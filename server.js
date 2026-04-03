const dns = require("node:dns").promises;
dns.setServers(["1.1.1.1", "8.8.8.8"])

const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const server = express();
const session = require("express-session");

server.use(express.urlencoded({ extended: true }));

server.use(express.static(path.join(__dirname, "public")));

server.use(express.json());

server.set("view engine", "ejs");

dotenv.config({ path: "./config.env" });
const petRoutes = require("./routes/pet-routes");
const accountRoutes = require("./routes/account-routes");
const adminRoutes = require("./routes/admin-routes");
const faqRoutes = require("./routes/faq-routes");

server.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    }),
);
server.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

server.use("/", accountRoutes);
server.use("/", petRoutes);
server.use("/", adminRoutes);
server.use("/", faqRoutes);

server.get("/", (req, res) => {
    res.redirect("/adopt");
});

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }
};

const startServer = () => {
    const hostname = "localhost";
    const port = 8000;

    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
};

connectDB().then(startServer);