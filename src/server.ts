require('dotenv').config();
import express, { Request, Response  } from 'express';
import { authenticateToken } from './middleware';
import { Database, Tables } from './types/supabase';
import { createClient } from '@supabase/supabase-js'
// Extending the Express Request type with a custom User type
declare global {
  namespace Express {
    interface User {
      // properties will go here later
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      username: string;
      phone_number: string;
      profile_image_url: string;
    }

    interface Request {
      user?: User;
    }
  }
}


const supabaseURL: string = process.env.SUPABASE_URL!;
const supabaseAnonKey: string = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient<Database>(supabaseURL, supabaseAnonKey)
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


app.post("/create-checkout-session", authenticateToken ,async (request: Request, response: Response) => {
  try {

    const { orderId } = request.body;

    // todo: will need to properly deal with the errors
    if (!orderId) {
      throw new Error("Order ID is required to create a checkout session.");
    }
    // Fetch order items from the database
    const { data: orderDetails, error } = await supabase
      .from('order_information')
      .select(`
        id,
        order_status,
        user_id,
        order_item (
          id,
          quantity,
          product (
            id,
            name,
            price
          )
        )
      `)
      .eq('id', orderId);

    if (error) {
      throw new Error(error.message);
    }

    if (!orderDetails || orderDetails.length === 0) {
      throw new Error("Order not found or has no items.");
    }

    const order = orderDetails[0];
    if (!order.order_item || order.order_item.length === 0) {
      throw new Error("No items found in the order.");
    }

    // Check if all items have valid product data
    const invalidItem = order.order_item.find(item => !item.product || !item.quantity || !item.product.name || !item.product.price);
    if (invalidItem) {
      //update the order status to invalid
      throw new Error("Invalid item found in order. Aborting checkout session creation.");
    }

  // Prepare line items for Stripe session
  const lineItems = order.order_item.map(item => {
    const product = item.product!; // Non-null assertion, safe here due to the above checks

    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
        },
        unit_amount: product.price * 100, // Convert price to cents
      },
      quantity: item.quantity,
    };
  });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    // Check if the session was successfully created
    if (!session.url) {
      throw new Error("Failed to create Stripe checkout session.");
    }
    //todo: will work on the response a bit later
    response.json({ url: session.url, orderId: orderId });
  } catch (error: any) {
    console.error(error);
    response.status(500).json({ error: error.message });
  }
})

//retrieve the session
app.get("/get-checkout-session", async (request: Request, response: Response) => {
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






