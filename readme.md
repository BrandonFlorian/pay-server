# Payment Server

Please Note: This is WIP and not production ready.

This payment server integrates with Supabase for data management and Stripe for payment processing. It handles secure payment transactions and data storage related to payment processing.

## Getting Started

To get the server running locally, follow these steps:

1. Clone the repository to your local machine.
2. Ensure you have Node.js installed.
3. Install the necessary dependencies by running `npm install` in the project directory.

## Environment Variables

Set up the following environment variables in your `.env` file:

- `SUPABASE_CONNECTION_STRING`: The connection string to your Supabase database.
- `SUPABASE_REFERENCE_ID`: A reference ID used for linking with Supabase.
- `SUPABASE_PASSWORD`: The password for accessing Supabase.
- `SUPABASE_IMAGE_BUCKET`: The Supabase bucket name where images are stored.
- `SUPABASE_URL`: The URL to your Supabase project.
- `SUPABASE_ANON_KEY`: The anonymous key for accessing Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: The service role key for Supabase.
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe account's publishable key.
- `STRIPE_SECRET_KEY`: Your Stripe account's secret key.
- `PORT`: The port number on which the payment server will run.

Ensure that these variables are set correctly to connect to both Supabase and Stripe services.

## Running the Server

To start the server, run the following command in the terminal:

```bash
npm start
```

This command will start the server on the port specified in your .env file.
