const fs = require("node:fs/promises");
const path = require("path");
const filePath = "data/user-profiles.json";

async function authenticateUser(userName, password) {
    const users = await readUsers();

    const user = users[userName];

    if (!user) return false;

    return user.password === password;
}

async function registerUser(userName, email, DOB, password) {
    const users = await readUsers();
    if (users[userName]) {
        throw new Error("Username already exists");
    }
    users[userName] = {
        userName,
        email,
        DOB, 
        password
    };
    await writeUsers(users);
};

async function readUsers() {
    try {
        const data = await fs.readFile(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        // file doesn't exist yet
        return {};
    }
};

async function writeUsers(users) {
    await fs.writeFile(
        filePath,
        JSON.stringify(users, null, 2)
    );
}


module.exports = {
    authenticateUser,
    registerUser
};