// const fs = require("node:fs/promises");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { type } = require("node:os");

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
    securityKey: {
        type: String,
        required: [true, "A user must have a securityKey"],
    },
    role: {
        type: String,
        default: "user",
        required: [true, "User role must be stated"],
    },
    preferences: {
        housingType: String,
        preferredAnimal: [String],
        preferredTraits: [String],
        experienceLevel: String,
        activityLevel: String
    }
});

const users = mongoose.model("users", usersSchema, "users");

async function registerUser(userName, email, DOB, password, securityKey, role) {
    // checks if inputted username exists in database; ensures that usernames are unique
    if (await users.findOne({ userName: userName })) {
        throw new Error("Username already exists. Please choose another username.");
    } 
    
    if (await users.findOne({ email: email })) {
        throw new Error("Email already exists. Please use another email.")
    }
    else {
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
            userName,
            email,
            DOB,
            password: hashedPassword, // hashes the password for security
            securityKey,
            role: "user"
        };
        // create new user profile + add to users schema
        await addUser(newUser);
    }
}

async function authenticateUser(userName, password) {
    // checks if user exists in DB
    const user = await users.findOne({ userName: userName });

    if (!user) return null;

    // authenticates password before logging user in
    let match = await bcrypt.compare(password, user.password);
    // returns user if authentication passed
    if (match) {
        return user;
    } else {
        return null;
    }
}

// function checks if password meets mininum requirements to ensure security
function securePassword(password) {
    let errors = [];
    if (password.length < 5) {
        errors.push("Password must be at least 5 characters");
    }
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push(
            "Password must contain at least one special character: !@#$%^&*",
        );
    }

    if (errors.length === 0) {
        return true;
    }
    // returns array of errors back to caller
    return errors;
}

async function checkSecurityKey(userName, securityKey) {
    // checks if securityKey matches; case insensitive
    const data = await users.findOne({ userName }).lean();
    if (!data) {
        return false;
    }
    // authenticates security key: case insensitive
    return data.securityKey.toLowerCase() === securityKey.toLowerCase();
}

async function updatePassword(userName, hashedPassword) {
    return await users.updateOne(
        { userName },
        { $set: { password: hashedPassword } },
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
    // checks if current user exists in database
    if (await users.findOne({ userName })) {
        return true;
    }
    return false;
}
async function findUserByName(userName) {
    return await users.findOne({ userName }).lean();
}

async function updateDetails(
    userId,
    userName,
    email,
    DOB,
    password,
    securityKey,
    role,
) {
    // updates the profile details of specified user
    const originalDetails = await retrieveProfile(userId);
    return users.updateOne(
        { _id: userId },
        {
            $set: {
                userName,
                email,
                DOB,
                // if no password was inputted in form, value defaulted to original password
                password: password
                    ? await bcrypt.hash(password, 10)
                    : originalDetails.password,
                securityKey,
                role,
            },
        },
    );
}

async function deleteUser(userId) {
    // deletes specified user from user schema
    return users.deleteOne({ _id: userId });
}
async function getAllUsers() {
    return users.find().lean();
}

const updatePreferences = async (userId, preferences) => {
    return await users.findByIdAndUpdate(userId, {preferences})
}

const countUsers = async () => {
    try {
        return users.countDocuments({})
    } catch(error) {
        return error
    }
}

module.exports = {
    authenticateUser,
    registerUser,
    retrieveProfile,
    deleteUser,
    updateDetails,
    getAllUsers,
    checkUserExist,
    updatePassword,
    checkSecurityKey,
    securePassword,
    updatePreferences,
    countUsers
};
