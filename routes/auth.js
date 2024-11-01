const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { generateOTP } = require("../utils/otp");
const twilio = require("twilio");

const authRouter = express.Router();
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY_TIME = 2 * 60 * 1000; 

let OTPData = {};

authRouter.post("/signup", async (req, res) => {
    try {
        const { username, number } = req.body;
        const existingUser = await User.findOne({ number });

        if (existingUser) {
            return res.status(400).json({ msg: "User with this number already exists!" });
        }

        const OTP = generateOTP();
        OTPData[number] = { OTP, expires: Date.now() + OTP_EXPIRY_TIME };

        await client.messages.create({
            body: `Your OTP verification code for ${username} is ${OTP}`,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: `+91${number}`
        });

        res.status(200).json({ msg: "OTP sent successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post("/signup/verify", async (req, res) => {
    try {
        const { otp, number } = req.body;

        if (OTPData[number]?.OTP !== otp || OTPData[number].expires < Date.now()) {
            return res.status(400).json({ msg: "Invalid or expired OTP." });
        }

        const user = new User({ username: OTPData[number].username, number, isVerified: true });
        const savedUser = await user.save();

        const token = jwt.sign({ id: savedUser._id }, JWT_SECRET);
        delete OTPData[number]; 

        res.status(200).json({ token, user: savedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post("/signin", async (req, res) => {
    try {
        const { number } = req.body;
        const user = await User.findOne({ number });

        if (!user) {
            return res.status(400).json({ msg: "User not found!" });
        }

        const OTP = generateOTP();
        OTPData[number] = { OTP, expires: Date.now() + OTP_EXPIRY_TIME };

        await client.messages.create({
            body: `Your OTP verification code is ${OTP}`,
            messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
            to: `+91${number}`
        });

        res.status(200).json({ msg: "OTP sent successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

authRouter.post("/signin/verify", async (req, res) => {
    try {
        const { otp, number } = req.body;

        if (OTPData[number]?.OTP !== otp || OTPData[number].expires < Date.now()) {
            return res.status(400).json({ msg: "Invalid or expired OTP." });
        }

        const user = await User.findOne({ number });

        const token = jwt.sign({ id: user._id }, JWT_SECRET);
        delete OTPData[number];  

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = authRouter;
