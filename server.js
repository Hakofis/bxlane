require('dotenv').config();
const express = require('express');
const path = require('path');

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY is not set in environment variables.');
  console.error('   Please create a .env file with your Stripe keys.');
  console.error('   You can copy .env.example to .env and add your keys.');
  process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route to serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
  try {
    const {
      origin,
      destination,
      date,
      time,
      passengers,
      vehicle,
      multiplier,
      distance,
      duration,
      price,
      name,
      email,
      phone,
      notes
    } = req.body;

    // Validate required fields
    if (!origin || !destination || !price) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    // Create description for the line item
    const description = `Transfer: ${origin} → ${destination} | Date: ${date} ${time} | Vehicle: ${vehicle} | Distance: ${distance}km | Passengers: ${passengers}`;

    // Create line item for Stripe
    const lineItems = [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: 'BXLINE Airport Transfer',
            description: description,
            images: [], // Add your logo URL here e.g. ['https://bxline.be/assets/airport.jpg']
          },
          unit_amount: Math.round(price * 100), // Stripe expects amount in cents
        },
        quantity: 1,
      },
    ];

    // Store booking metadata
    const metadata = {
      origin,
      destination,
      date,
      time,
      passengers,
      vehicle,
      multiplier: multiplier?.toString() || '1.00',
      distance: distance?.toString() || 'N/A',
      duration: duration || 'N/A',
      customer_name: name || 'N/A',
      customer_email: email || 'N/A',
      customer_phone: phone || 'N/A',
      notes: notes || 'None',
    };

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel.html`,
      customer_email: email || undefined,
      metadata: metadata,
      // Optional: Enable billing address collection
      billing_address_collection: 'auto',
      // Optional: Add custom fields or additional options
      phone_number_collection: {
        enabled: true,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Retrieve session details (for success page)
app.get('/checkout-session', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
      amount_total: session.amount_total / 100, // Convert back to euros
      metadata: session.metadata,
    });
  } catch (error) {
    console.error('Error retrieving session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events (optional but recommended for production)
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  // In production, set this in environment variable
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.warn('Webhook secret not configured. Skipping signature verification.');
    return res.sendStatus(200);
  }

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment successful:', session.id);
        // Here you can:
        // - Send confirmation email
        // - Save to database
        // - Trigger notifications
        break;
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful:', paymentIntent.id);
        break;
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'BXLINE server is running' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`\n🚗 BXLINE Server running on http://localhost:${PORT}`);
  console.log(`📝 Open http://localhost:${PORT} in your browser to start booking\n`);
  console.log(`💳 Test Card Details:`);
  console.log(`   Card Number: 4242 4242 4242 4242`);
  console.log(`   Expiry Date: Any future date (e.g., 12/34)`);
  console.log(`   CVC: Any 3 digits (e.g., 123)`);
  console.log(`   ZIP: Any 5 digits (e.g., 12345)\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});