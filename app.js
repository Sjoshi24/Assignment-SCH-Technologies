require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('frontend'));
app.use("/auth", authRouter);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/frontend/index.html'); 
  });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("MongoDB connection error:", error));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
