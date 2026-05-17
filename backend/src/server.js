const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const masterRoutes = require("./routes/masterRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/master", masterRoutes);

app.get("/", (req, res) => {
    res.send("APT running...");
})

const port = process.env.port || 5000;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});