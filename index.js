

const express = require('express');
const app = express();

const path = require('path');

require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const DOMAIN = process.env.DOMAIN;

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());

app.post('/stripe-payment', async (req, res) => {
    const { product } = req.body;
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.name,
                            images: [product.image],
                        },
                        unit_amount: product.amount * 100,
                    },
                    quantity: product.quantity,
                },
            ],
            mode: 'payment',
            success_url: `${DOMAIN}/success.html`,
            cancel_url: `${DOMAIN}/cancel.html`,
        });
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on ${PORT} port.`);
});
