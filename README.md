# 🚗 BXLINE Airport Transfer Booking Website

A modern, single-page booking website for airport and city transfers with integrated Stripe payment processing.

## 🌟 Features

- **Interactive Route Planning**: Google Maps integration with real-time route visualization
- **Dynamic Pricing**: Automatic calculation based on distance, time, vehicle type, and multipliers
- **5-Step Booking Process**: 
  1. Route calculation with live map
  2. Trip details (date, time, passengers)
  3. Vehicle selection (Lexus, Tesla Model Y, Renault Arkana)
  4. Contact information
  5. Review and payment
- **Stripe Checkout Integration**: Secure online card payments
- **Multiple Contact Options**: Email, WhatsApp, and online payment
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Validation**: Input validation and error handling throughout the booking process

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14.0.0 or higher)
- **npm** (v6.0.0 or higher)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## 🚀 Quick Start

### Windows (PowerShell/CMD)

```powershell
# 1. Navigate to project folder
cd bxline_website

# 2. Install dependencies
npm install

# 3. Copy environment file and add your Stripe keys
copy .env.example .env

# 4. Start the server
npm start
```

### Mac/Linux

```bash
# 1. Navigate to project folder
cd bxline_website

# 2. Install dependencies
npm install

# 3. Copy environment file and add your Stripe keys
cp .env.example .env

# 4. Start the server
npm start
```

The server will start on `http://localhost:3000`

### Open in Browser

Navigate to `http://localhost:3000` in your web browser.

**⚠️ Important Note About Localhost:**
> The localhost URL (http://localhost:3000) refers to the computer where the server is running. If you're accessing this from a remote system, you'll need to deploy the application on your own system or use the server's IP address.

## 💳 Testing Payments

The website is configured with **Stripe Test Mode** credentials. Use the following test card details to simulate payments:

### Test Card Information

| Field | Value |
|-------|-------|
| **Card Number** | `4242 4242 4242 4242` |
| **Expiry Date** | Any future date (e.g., `12/34`) |
| **CVC** | Any 3 digits (e.g., `123`) |
| **ZIP/Postal Code** | Any 5 digits (e.g., `12345`) |

### Additional Test Cards

You can also test different scenarios:

- **Successful Payment**: `4242 4242 4242 4242`
- **Payment Requires Authentication**: `4000 0025 0000 3155`
- **Payment Declined**: `4000 0000 0000 9995`
- **Insufficient Funds**: `4000 0000 0000 9995`

For more test cards, visit: [Stripe Test Cards Documentation](https://stripe.com/docs/testing#cards)

## 📁 Project Structure

```
bxline_website/
├── server.js              # Express server with Stripe integration
├── index.html             # Main booking page
├── success.html           # Payment success page
├── cancel.html            # Payment cancellation page
├── package.json           # Project dependencies
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── README.md             # This file
└── assets/
    ├── style.css         # Stylesheet
    ├── lexus.jpg         # Vehicle image
    ├── tesla-model-y.jpg # Vehicle image
    ├── renault-arkana.jpg # Vehicle image
    └── airport.jpg       # Background image
```

## 🔧 Configuration

### Stripe API Keys

The application uses environment variables to securely store Stripe credentials. 

**Setup Steps:**

1. Copy the environment template:
   - Windows: `copy .env.example .env`
   - Mac/Linux: `cp .env.example .env`

2. Edit the `.env` file and add your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):
   ```
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   ```

> **⚠️ Security Note**: The `.env` file contains sensitive credentials and is excluded from git via `.gitignore`. Never commit this file to version control or share your secret keys publicly.

> **Note**: For production deployment, replace test keys with live mode keys from your Stripe Dashboard.

## 🎯 How It Works

### Booking Flow

1. **Route Selection** (Step 1)
   - User enters pickup and drop-off locations
   - Google Maps calculates distance and duration
   - System displays route on map with red line
   - Price is calculated based on: base fee + (distance × per km rate) × multipliers

2. **Trip Details** (Step 2)
   - User selects date, time, and number of passengers
   - Night multiplier (×1.10) applied for 22:00-06:00
   - Weekend multiplier (×1.05) applied for Saturday/Sunday

3. **Vehicle Selection** (Step 3)
   - Choose from three vehicle options:
     - Lexus (×1.00)
     - Tesla Model Y (×1.15)
     - Renault Arkana (×0.95)
   - Price updates based on vehicle multiplier

4. **Contact Information** (Step 4)
   - User provides name, email, phone, and optional notes

5. **Review & Payment** (Step 5)
   - Summary of all booking details
   - Three action options:
     - **Pay Now**: Stripe Checkout for card payment
     - **Send by Email**: Opens email client with booking details
     - **WhatsApp**: Sends booking to WhatsApp

### Payment Process

1. User clicks "Pay Now with Stripe"
2. Frontend validates booking details
3. Backend creates a Stripe Checkout session
4. User is redirected to Stripe's hosted checkout page
5. User enters card details (use test card)
6. After payment:
   - **Success**: Redirected to `success.html` with booking confirmation
   - **Cancel**: Redirected to `cancel.html` with retry options

### Pricing Model

```javascript
Base Price = €30.00
Per Kilometer = €1.50
Minimum Fare = €35.00

Subtotal = Base Price + (Distance × Per Km Rate)

If (time is 22:00-06:00): Subtotal × 1.10
If (day is weekend): Subtotal × 1.05

Final Price = Subtotal × Vehicle Multiplier
If (Final Price < Minimum Fare): Final Price = Minimum Fare
```

## 🛠️ Development

### Run in Development Mode (with auto-restart)

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when files change.

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Display test instructions

## 🌐 API Endpoints

### POST `/create-checkout-session`
Creates a Stripe Checkout session for payment processing.

**Request Body:**
```json
{
  "origin": "Pickup location",
  "destination": "Drop-off location",
  "date": "2024-03-15",
  "time": "14:30",
  "passengers": "2",
  "vehicle": "Tesla Model Y",
  "multiplier": 1.15,
  "distance": "25.5",
  "duration": "35 mins",
  "price": 65,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+32491255954",
  "notes": "Flight AA123"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### GET `/checkout-session?session_id=cs_test_...`
Retrieves Stripe session details for the success page.

**Response:**
```json
{
  "status": "paid",
  "customer_email": "john@example.com",
  "amount_total": 65.00,
  "metadata": {
    "origin": "...",
    "destination": "...",
    ...
  }
}
```

### POST `/webhook`
Stripe webhook endpoint for handling payment events (optional, requires configuration).

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "BXLINE server is running"
}
```

## 🔒 Security Considerations

### Current Implementation (Test Mode)
- ✅ HTTPS required for production (Stripe requirement)
- ✅ Payment processing handled by Stripe (PCI compliant)
- ✅ No sensitive data stored on server
- ✅ Test credentials used (safe for development)

### Production Checklist
Before deploying to production:

- [ ] Replace test Stripe keys with live keys
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up Stripe webhooks for payment confirmation
- [ ] Configure webhook signature verification
- [ ] Set up proper logging and monitoring
- [ ] Implement rate limiting
- [ ] Add CORS configuration if needed
- [ ] Set up database for storing bookings
- [ ] Configure email notifications
- [ ] Add backup payment methods
- [ ] Test with real cards (small amounts)
- [ ] Set up proper error tracking (e.g., Sentry)

## 📧 Contact Information

**BXLANE International & Consulting BV**
- Address: Excelsiorlaan 31, 1930 Zaventem, Belgium
- Phone/WhatsApp: [+32 491 25 59 54](https://wa.me/32491255954)
- Email: [info@bxline.be](mailto:info@bxline.be)
- Support: Available 24/7

## 🐛 Troubleshooting

### Server won't start

**Windows (PowerShell):**
```powershell
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual process ID)
taskkill /PID <PID> /F

# Or use a different port
$env:PORT=3001; npm start
```

**Windows (CMD):**
```cmd
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F

# Or use a different port
set PORT=3001 && npm start
```

**Mac/Linux:**
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill the process if needed
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### Missing .env file
If you see an error about STRIPE_SECRET_KEY:
- Windows: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`
- Then edit `.env` and add your Stripe keys

### Google Maps not loading
- Check internet connection
- Verify Google Maps API key is valid
- Check browser console for errors

### Stripe payment not working
- Ensure you're using test card: `4242 4242 4242 4242`
- Check browser console for errors
- Verify server is running
- Check that Stripe keys are correctly configured

### Payment redirects not working
- Check that server URL in `server.js` matches your actual URL
- Verify success.html and cancel.html are accessible
- Check browser console for navigation errors

## 📝 License

This project is proprietary software owned by BXLANE International & Consulting BV.

## 🙏 Acknowledgments

- [Stripe](https://stripe.com/) for payment processing
- [Google Maps Platform](https://developers.google.com/maps) for mapping and geocoding
- [Express.js](https://expressjs.com/) for the web framework

---

**Happy Booking! 🚗💨**

For questions or support, contact us via WhatsApp or email.
