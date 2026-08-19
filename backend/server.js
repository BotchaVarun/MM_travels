const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const app = express();
app.use(cors());
app.use(express.json());

// In-memory store for OTPs (In production, use Redis or Postgres/Supabase)
const otpStore = new Map();

// Generate a random 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

app.post('/api/auth/send-whatsapp-otp', async (req, res) => {
    const { phone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    const otp = generateOTP();
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // strict 5 min expiry

    console.log(`\n========================================`);
    console.log(`[WHATSAPP-MOCK] Sending OTP strictly to WhatsApp!`);
    console.log(`To: +91${phone}`);
    console.log(`Message: "Your MM Travels Verification Code is: ${otp}"`);
    console.log(`========================================\n`);

    // TODO: Integrate actual Twilio WhatsApp API or Gupshup/WATI WhatsApp Business API here
    // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
    // await client.messages.create({
    //     body: `Your MM Travels Verification Code is: ${otp}`,
    //     from: 'whatsapp:+14155238886',
    //     to: `whatsapp:+91${phone}`
    // });

    return res.status(200).json({ success: true, message: 'OTP sent via WhatsApp successfully' });
});

app.post('/api/auth/verify-otp', async (req, res) => {
    const { phone, code } = req.body;

    const record = otpStore.get(phone);

    if (!record) {
        return res.status(400).json({ success: false, error: 'OTP expired or not sent' });
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(phone);
        return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    if (record.otp === code) {
        otpStore.delete(phone);

        // TODO: Validate/Insert user into Supabase profiles table
        // const { data, error } = await supabase.from('profiles').upsert({ phone: phone }).select().single();

        // Generate a custom or mock token
        const demoToken = 'mock_jwt_token_for_' + phone;

        console.log(`[AUTH-SUCCESS] User +91${phone} entered CORRECT OTP: ${code}`);

        return res.status(200).json({
            success: true,
            message: 'Verification successful',
            token: demoToken,
            isNewUser: true // Set to false if data shows they are an existing user in Supabase
        });
    }

    console.log(`[AUTH-FAILED] User +91${phone} entered WRONG OTP: ${code}. Expected: ${record.otp}`);
    return res.status(400).json({ success: false, error: 'Invalid OTP' });
});

// Profile Registration Endpoint
app.post('/api/users/profile', async (req, res) => {
    const { phone, fullName, email, gender, emergencyName, emergencyPhone } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                phone,
                full_name: fullName,
                email,
                gender,
                emergency_contact_name: emergencyName,
                emergency_contact_phone: emergencyPhone
            }, { onConflict: 'phone' })
            .select()
            .single();

        if (error) throw error;

        return res.status(200).json({ success: true, profile: data });
    } catch (err) {
        console.error('Supabase Profile Error:', err);
        return res.status(500).json({ error: 'Failed to save profile data.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 MM Travels Backend running on http://localhost:${PORT}`);
});
