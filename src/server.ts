require('dotenv').config();
import express, { Request, Response  } from 'express';
import { Product } from './types/product';
import { authenticateToken } from './middleware';


// Extending the Express Request type with a custom User type
declare global {
  namespace Express {
    interface User {
      // properties will go here later
    }

    interface Request {
      user?: User;
    }
  }
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); 
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Routes
app.post('/create-payment-intent', authenticateToken,  async (request: Request, response: Response) => {
    try {
        const { amount } = request.body; // You should validate and sanitize this in production
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            // Add other payment configurations here
        });

        response.status(200).send(paymentIntent.client_secret);
    } catch (error : any) {
        console.log(error);
        response.status(400).send({ error: error.message });
    }
});


app.post("/create-checkout-session", authenticateToken, async (request: Request, response: Response) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: request.body.items.map((item: Product) => {
        //get items and add the data
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Stubborn Attachments",
            },
            unit_amount: 2000, //price in cents
          },
          quantity: item.quantity,
        }
      }),
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    })
    response.json({ url: session.url })
  } catch (error : any) {
    response.status(500).json({ error: error.message })
  }
})

//retrieve the session
app.get("/get-checkout-session", authenticateToken,  async (request: Request, response: Response) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(request.query.session_id)
    response.json(session)
  } catch (error: any) {
    response.status(500).json({ error: error.message })
  }
})

//retrieve the sessions line items
app.get("/get-checkout-session-line-items", authenticateToken,  async (request: Request, response: Response) => {
  try {
    const lineItems = await stripe.checkout.sessions.listLineItems(request.query.session_id)
    response.json(lineItems)
  } catch (error: any) {
    response.status(500).json({ error: error.message })
  }
})

//expire a session 
app.post("/expire-checkout-session", authenticateToken,  async (request: Request, response: Response) => {
  try {
    const session = await stripe.checkout.sessions.expire(request.body.session_id);
    response.json(session)
  } catch (error: any) {
    response.status(500).json({ error: error.message })
  }
})

// This is Stripe CLI webhook secret for testing the endpoint locally.
const endpointSecret = process.env.STRIPE_TEST_SECRET;

app.post('/webhook', express.raw({type: 'application/json'}), (request: Request, response: Response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (error: any) {
    response.status(400).send(`Webhook Error: ${error.message}`);
    return;
  }

    // Handle the event
    switch (event.type) {
        case 'account.updated':
          const accountUpdated = event.data.object;
          // Then define and call a function to handle the event account.updated
          break;
        case 'account.external_account.created':
          const accountExternalAccountCreated = event.data.object;
          // Then define and call a function to handle the event account.external_account.created
          break;
        case 'account.external_account.deleted':
          const accountExternalAccountDeleted = event.data.object;
          // Then define and call a function to handle the event account.external_account.deleted
          break;
        case 'account.external_account.updated':
          const accountExternalAccountUpdated = event.data.object;
          // Then define and call a function to handle the event account.external_account.updated
          break;
        case 'checkout.session.async_payment_failed':
          const checkoutSessionAsyncPaymentFailed = event.data.object;
          // Then define and call a function to handle the event checkout.session.async_payment_failed
          break;
        case 'checkout.session.async_payment_succeeded':
          const checkoutSessionAsyncPaymentSucceeded = event.data.object;
          // Then define and call a function to handle the event checkout.session.async_payment_succeeded
          break;
        case 'checkout.session.completed':
          const checkoutSessionCompleted = event.data.object;
          // Then define and call a function to handle the event checkout.session.completed
          break;
        case 'checkout.session.expired':
          const checkoutSessionExpired = event.data.object;
          // Then define and call a function to handle the event checkout.session.expired
          break;
        // ... handle other event types
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

  // Handle the event
  console.log(`Unhandled event type ${event.type}`);

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






