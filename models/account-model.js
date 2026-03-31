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
    }
});

const users = mongoose.model("users", usersSchema, "users");

async function registerUser(userName, email, DOB, password, securityKey, role ) {
    // checks if inputted username exists in database; ensures that usernames are unique
    if (await users.findOne({ userName: userName })) {
        throw new Error("Username already exists. Please choose another username.");
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
            userName,
            email,
            DOB,
            password: hashedPassword, // hashes the password for security
            securityKey,
            role
        };
        // create new user profile + add to users schema
        await addUser(newUser);
    }
};

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
};

// function checks if password meets mininum requirements to ensure security
function securePassword(password){
    let errors = [];
    if (password.length < 5){
        errors.push("Password must be at least 5 characters")
    } 
    if (!/[!@#$%^&*]/.test(password)) {
        errors.push("Password must contain at least one special character: !@#$%^&*")
    }

    if (errors.length === 0) {
        return true 
    }
    // returns array of errors back to caller
    return errors;
}

async function checkSecurityKey(userName, securityKey) {
    // checks if securityKey matches; case insensitive
    const data = await users.findOne({userName}).lean()
    if (!data) {
        return false
    }
    // authenticates security key: case insensitive
    return data.securityKey.toLowerCase() === securityKey.toLowerCase();
}

async function updatePassword(userName, hashedPassword) {
    return await users.updateOne(
        {userName},
        {$set: {password: hashedPassword}}
    );
}

async function retrieveProfile(userId) {
    // retrieves profile of specified userId + returns record as object
    return await users.findOne({ _id: userId }).lean();
};

async function addUser(user) {
    // creates a new record under user schema
    return await users.create(user);
};

async function checkUserExist(userName) {
    // checks if current user exists in database
    if (await users.findOne({userName})) {
        return true;
    }
    return false;
}

async function updateDetails(userId, userName, email, DOB, password, securityKey) {
    // updates the profile details of specified user
    const originalDetails = await retrieveProfile(userId);
    return users.updateOne({ _id: userId },
        {$set: {userName, 
            email, 
            DOB, 
            // if no password was inputted in form, value defaulted to original password
            password: password ? await bcrypt.hash(password, 10) : originalDetails.password,
            securityKey}
        })
} 

async function deleteUser(userId) {
    // deletes specified user from user schema
    return users.deleteOne({ _id: userId });
};
async function getAllUsers() {
    return users.find().lean();
};

const listerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "A user must have an address"]
    },

    address: {
        type: String,
        required: [true, "A user must have an address"]
    },
    contactNo: {
        type: String,
        required: [true, "A user must have a contact number"]
    },
    reason: {
        type: String,
        required: [true, "A user must have a reason"],
    },
    pets: {
        type: String,
        required: [true, "A user must have at least a pet"],
    },
    experience: {
        type: String,
        required: [true, "A user must have experience"],
    },
    statusL: {
        type: String,
        default: "pending",
        required: [true, "A user will have a status"],
    },
    role: {
        type: String,
        default: "user",
        required: [true, "User role must be stated"],
    },
});

const lister = mongoose.model("lister", listerSchema, "lister");

async function authenticateLister(userName) {
    const exists = await lister.findOne({ userName });

    if (!exists) return null;

};

async function getPendingListers() {
    return await lister.find({ statusL: 'pending' }).lean();
};

async function approveLister(userId) {
    return await lister.updateOne({ _id: userId}, { $set: {statusL: "approved"} })
};

async function rejectLister(userId) {
    return await lister.updateOne({ _id: userId}, { $set: {statusL: "rejected"} })
};

async function retrieveLister(userId) {
    return await lister.findOne({ _id: userId }).lean();
};

async function addLister(lister) {
    return await lister.create(lister);
};

async function updateLister(userId, address, contactNo, pets, experience) {
    // updates the profile details of speificied user
    return users.updateOne({ _id: userId }, { $set: {address, contactNo, pets, experience} });
};

async function deleteLister(userID) {
    return lister.deleteOne({ _id: userID });
};


module.exports = {
    authenticateUser,
    registerUser,
    retrieveProfile,
    deleteUser,
    updateDetails,
    getAllUsers,
    authenticateLister,
    getPendingListers,
    approveLister,
    rejectLister,
    retrieveLister,
    updateLister,
    deleteLister,
    addLister,
    checkUserExist,
    updatePassword,
    checkSecurityKey,
    securePassword
};
