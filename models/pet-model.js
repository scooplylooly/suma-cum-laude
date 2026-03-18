const mongoose = require("mongoose");
const fs = require("fs");
const applyFilePath = require("../data/apply-for-pet-data.json");
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
    return Pet.find();
};

exports.writeApplyInfo = async (application) => {
    try {
        const jsonData = await fs.readFile(applyFilePath, "utf-8");
        let data = JSON.parse(jsonData);
        console.log(data);
        data.push(application);
        const jData = JSON.stringify(data, null, 2);
        await fs.writeFile(applyFilePath, jData);
    } catch (error) {
        console.error("Error writing to apply-for-pet-data.json:", error);
    }
};
