const fs = require("node:fs/promises");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { type } = require("node:os");
const { updateProfile } = require("../controllers/account-controller");

// create schema for user profiles
const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "A user must have a user name"],
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
    },
    DOB: {
        type: String,
        required: [true, "A user must have Date of Birth"],
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
    },
    role: {
        type: String,
        default: "user",
        required: [true, "User role must be stated"],
    },
    otp: {
        type: String
    },
    otpExpiry: {
        type: Date
    }
});

const users = mongoose.model("users", usersSchema, "users");

async function registerUser(userName, email, DOB, password, role) {
    // checks if inputted username exists in database; ensures that usernames are unique
    if (await users.findOne({ userName: userName })) {
        throw new Error("Username already exists");
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
            userName,
            email,
            DOB,
            password: hashedPassword, // hashes the password for security
            role: 'user',
            otp:'',
            otpExpiry:''
        };
        // create new user profile + add to users schema
        await addUser(newUser);
    }
}

async function authenticateUser(userName, password) {
    // checks if user exists in DB; additional check if password is correct before logging user in.
    const user = await users.findOne({ userName: userName });

    if (!user) return null;

    let match = await bcrypt.compare(password, user.password);
    // returns user if password authentication passes
    if (match) {
        return user;
    } else {
        return null;
    }
}

async function findUserByNameAndEmail(userName, email){
    return users.findOne({userName: userName, email: email}).lean();
}

async function saveOTP(userId, otp, expiry){
    return users.updateOne(
        {_id: userId},
        {$set: {otp, otpExpiry: expiry}}
    );
}

async function updatePassword(userId, hashedPassword) {
    return users.updateOne(
        {_id: userId},
        {$set :{password: hashedPassword}, $unset: {otp:'', otpExpiry: ''}}
    );
}

async function retrieveProfile(userId) {
    // retrieves profile of specified userId + returns record as object
    return await users.findOne({ _id: userId }).lean();
}

async function addUser(user) {
    // creates a new record under user schema
    return await users.create(user);
}

async function checkUserExist(userName) {
    if (users.findOne({userName: userName})) {
        return true;
    }
    return false;
}

async function updateDetails(userId, userName, email, DOB, password) {
    // updates the profile details of specified user
    const originalDetails = await retrieveProfile(userId);
    return users.updateOne({ _id: userId },
        {$set: {userName, 
            email, 
            DOB, 
            password: password ? await bcrypt.hash(password, 10) : originalDetails.password}
        })
}

async function deleteUser(userId) {
    // deletes specified user from user schema
    return users.deleteOne({ _id: userId });
}
async function getAllUsers() {
    return users.find().lean();
}

module.exports = {
    authenticateUser,
    registerUser,
    retrieveProfile,
    deleteUser,
    updateDetails,
    getAllUsers,
    checkUserExist,
    findUserByNameAndEmail,
    saveOTP,
    updatePassword
};
