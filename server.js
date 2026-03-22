const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const server = express();

server.use(express.urlencoded({ extended: true }));

server.use(express.static(path.join(__dirname, "public")));

server.use(express.json());

server.set("view engine", "ejs");

dotenv.config({ path: "./config.env" });
const petRoutes = require("./routes/pet-routes");
const indexRoutes = require("./routes/index-routes");

server.use("/", indexRoutes);
server.use("/", petRoutes);

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
