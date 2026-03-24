const fs = require("node:fs/promises");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// create schema for user profiles 
const usersSchema = new mongoose.Schema({
        userName : {
            type: String,
            required: [true, 'A user must have a user name']
        },
        email: {
            type: String,
            required: [true, 'A user must have an email']
        },
        DOB: {
            type: String,
            required: [true, 'A user must have Date of Birth']
        },
        password: {
            type: String,
            required: [true, 'A user must have a password']
        }
    });

    const users = mongoose.model('users', usersSchema, 'users');

    // checks if user exists in DB; additional check if password is correct before logging user in.
    // returns user if is true
async function authenticateUser(userName, password) {
    const user = await users.findOne({userName: userName})

    if (!user) return null;

    let match = await bcrypt.compare(password, user.password);
    if (match) {
        return user;
    } else {
        return null;
    }
};

async function registerUser(userName, email, DOB, password) {
    
    // checks if inputted username exists in database; ensures that usernames are unique
    if (await users.findOne({userName: userName})){
        throw new Error("Username already exists"); 

    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
                    userName,
                    email,
                    DOB,
                    password: hashedPassword // hashes the password for security
                };
        // create new user profile + add to users schema
        await addUser(newUser);
    }
};


async function addUser(user) {
    return await users.create(user);
}

module.exports = {
    authenticateUser,
    registerUser
};