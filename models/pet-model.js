const mongoose = require("mongoose");
const fs = require("fs").promises;
const applyFilePath = "data/apply-for-pet-data.json";
const petFilePath = "data/pets-data.json";

// pet-data schema

const petSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ["dog", "cat", "rabbit", "other"],
        },

        img: {
            type: String,
            default: "",
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        breed: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: ["male", "female"],
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        hdbApproved: {
            type: Boolean,
            default: false,
        },

        dob: {
            type: String,
            required: true,
            min: 0,
        },

        vaccinated: {
            type: Boolean,
            default: false,
        },

        sterilized: {
            type: Boolean,
            default: false,
        },

        personality: {
            type: [String],
            default: [],
        },

        pid: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Specifying which schema to use
const Pet = mongoose.model("Pet", petSchema, "pets-data");

//Methods

exports.getAllPets = function () {
    return Pet.find().lean();
};

// exports.getAllPets = async () => {
//     const jData = await fs.readFile(petFilePath, "utf-8");
//     data = JSON.parse(jData);
//     return data;
// };

exports.writeApplyInfo = async (application) => {
    try {
        let data = [];

        // Try to read existing file
        try {
            const jsonData = await fs.readFile(applyFilePath, "utf-8");
            data = JSON.parse(jsonData);
            console.log("existing data", data);
        } catch (readError) {
            // File doesn't exist - start with empty array
            console.log("No existing file, creating new one");
            data = [];
        }

        data.push(application);
        const jData = JSON.stringify(data, null, 2);
        console.log(applyFilePath, data);
        await fs.writeFile(applyFilePath, jData, "utf-8");
        console.log("Application saved successfully");
    } catch (error) {
        console.error("Error writing to apply-for-pet-data.json:", error);
    }
};

exports.createPetData = async (petInfo) => {
    try {
        let data = [];

        // Try to read existing file
        try {
            const jData = await fs.readFile(petFilePath, "utf-8");
            data = JSON.parse(jData);
            console.log("existing data", data);
        } catch (readError) {
            // File doesn't exist - start with empty array
            console.log("No existing file, creating new one");
            data = [];
        }

        data.push(petInfo);
        console.log("new", data);
        const jData = JSON.stringify(data, null, 2);
        console.log(petFilePath, data);
        await fs.writeFile(petFilePath, jData, "utf-8");
        console.log("Listing saved successfully");
    } catch (error) {
        console.error("Error writing to pet-data.json:", error);
    }
};
