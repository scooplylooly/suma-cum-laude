const fs = require("node:fs/promises");
const path = require("path");
const filePath = "data/user-profiles.json";
const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
        id: {
            type: String,
            required: [true, 'A user must have an id']
        },
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

async function authenticateUser(userName, password) {
    const user = await users.findOne({userName: userName})

    if (!user) return false;

    return user.password === password;
};

function createId(userName, DOB) {
    const formattedName = userName.replaceAll(' ', '').toLowerCase();
    const formattedDOB = DOB.replaceAll('-', '');
    return formattedName + formattedDOB;
};

async function registerUser(userName, email, DOB, password) {
    let newUser = {
                id: createId(userName, DOB),
                userName,
                email,
                DOB,
                password
            };
    
    if (await users.findOne({userName: userName})){
        throw new Error("Username already exists"); 

    } else {
        // create new user profile + add to user schema
        await addUser(newUser);
        const data = {
                userName, email, DOB, password
        };
        // writes new user to json file
        await writeUsers(data);
    }
};

async function writeUsers(users) {
    await fs.writeFile(
        filePath,
        JSON.stringify(users, null, 2)
    );
}

async function addUser(user) {
    return await users.create(user);
}

module.exports = {
    authenticateUser,
    registerUser
};