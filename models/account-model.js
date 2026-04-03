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
        type: {
            housingType: String,
            preferredAnimal: [String],
            preferredTraits: [String],
            experienceLevel: String,
            activityLevel: String,
        },
        default: {
            housingType: "",
            preferredAnimal: [],
            preferredTraits: [],
            experienceLevel: "beginner",
            activityLevel: "low",
        },
    },
});

const users = mongoose.model("users", usersSchema, "users");
//creates new user data in db
async function registerUser(userName, email, DOB, password, securityKey, role) {
    // checks if inputted username exists in database; ensures that usernames are unique
    if (await users.findOne({ userName: userName })) {
        throw new Error(
            "Username already exists. Please choose another username.",
        );
    }

    if (await users.findOne({ email: email })) {
        throw new Error("Email already exists. Please use another email.");
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        let newUser = {
            userName,
            email,
            DOB,
            password: hashedPassword, // hashes the password for security
            securityKey,
            role,
        };
        // create new user profile + add to users schema
        await addUser(newUser);
    }
}
//check if user password is correct and authenticate user
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
//get security key of user in the db
async function checkSecurityKey(userName, securityKey) {
    // checks if securityKey matches; case insensitive
    const data = await users.findOne({ userName }).lean();
    if (!data) {
        return false;
    }
    // authenticates security key: case insensitive
    return data.securityKey.toLowerCase() === securityKey.toLowerCase();
}
//updates the password of the user
async function updatePassword(userName, hashedPassword) {
    return await users.updateOne(
        { userName },
        { $set: { password: hashedPassword } },
    );
}
// retrieve the profile/details of the user in the db
async function retrieveProfile(userId) {
    // retrieves profile of specified userId + returns record as object
    return await users.findOne({ _id: userId }).lean();
}
// creates new user details in the db
async function addUser(user) {
    // creates a new record under user schema
    return await users.create(user);
}
//check if user data exits in the db
async function checkUserExist(username) {
    // checks if current user exists in database
    if (await users.findOne({ userName: username })) {
        return true;
    }
    return false;
}
//find the user details in the db by using the username
async function findUserByName(username) {
    return await users.findOne({ userName: username }).lean();
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
//deletes the user in the db
async function deleteUser(userId) {
    // deletes specified user from user schema
    return users.deleteOne({ _id: userId });
}
//find  all users in the db
async function getAllUsers() {
    return users.find().lean();
}
// Lister schema + functions
const listerSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: [true, "A user must have an address"],
    },
    uid: {
        type: String,
        required: [true, "A user must have a uid"],
    },
    address: {
        type: String,
        required: [true, "A user must have an address"],
    },
    contactNo: {
        type: String,
        required: [true, "A user must have a contact number"],
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
});

const lister = mongoose.model("lister", listerSchema, "lister");

async function getPendingListers() {
    return await lister.find({ statusL: "pending" }).lean();
}

async function approveLister(userId) {
    return await lister.updateOne({ _id: userId }, { statusL: "approved" });
}

async function rejectLister(userId) {
    return await lister.updateOne({ _id: userId }, { statusL: "rejected" });
}

async function retrieveLister(id) {
    let found = await lister.findOne({ uid: id }).lean();

    if (!found) {
        found = await lister.findOne({ _id: id }).lean();
    }
    return found;
}

async function getAllListers() {
    const allListers = await lister.find().lean();
    return allListers.filter(
        (l) => l.statusL === "approved" || l.statusL === "rejected",
    );
}

async function addLister(listerData) {
    return await lister.create(listerData);
}

async function updateLister(userId, address, contactNo, pets, experience) {
    // updates the profile details of speificied user
    return lister.updateOne(
        { _id: userId },
        { address, contactNo, pets, experience },
    );
}

async function getListerByUserName(userName) {
    return await lister.findOne({ userName }).lean();
}

async function updateUserRole(userId, role) {
    return users.updateOne({ _id: userId }, { role });
}

async function deleteLister(listerID) {
    return lister.deleteOne({ _id: listerID });
}
async function deleteListerByUid(userId) {
    return lister.deleteOne({ uid: userId });
}

const updatePreferences = async (userId, preferences) => {
    return await users.findByIdAndUpdate(userId, { preferences });
};

const countUsers = async () => {
    try {
        return users.countDocuments({});
    } catch (error) {
        return error;
    }
};

module.exports = {
    authenticateUser,
    registerUser,
    retrieveProfile,
    deleteUser,
    updateDetails,
    getAllUsers,
    getPendingListers,
    approveLister,
    rejectLister,
    retrieveLister,
    updateLister,
    getListerByUserName,
    updateUserRole,
    deleteLister,
    deleteListerByUid,
    getAllListers,
    addLister,
    checkUserExist,
    updatePassword,
    checkSecurityKey,
    securePassword,
    updatePreferences,
    countUsers,
    findUserByName,
};
