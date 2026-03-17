const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const server = express();

server.use(express.urlencoded({ extended: true }));

server.use(express.static(path.join(__dirname, "public")));

server.use(express.json());

server.set("view engine", "ejs");

dotenv.config({ path: "./config.env" });
const petRoutes = require("./routes/pet-routes");

server.use("/", petRoutes);

const indexRoutes = require("./routes/index-routes");
server.use('/', indexRoutes);

function startServer() {
    const hostname = "localhost"; // Define server hostname
    const port = 8000; // Define port number

    // Start the server and listen on the specified hostname and port
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });
}

startServer();