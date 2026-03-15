const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');

const server = express();

server.use(express.urlencoded({ extended: true }));

server.use(express.json());

server.set("view engine", "ejs"); 

dotenv.config({ path: './config.env' });











function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000;// Define port number
 
  // Start the server and listen on the specified hostname and port
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}