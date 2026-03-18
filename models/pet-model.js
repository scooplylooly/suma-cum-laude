const mongoose = require("mongoose");

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

        age: {
            type: Number,
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

        createdBy: {
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

exports.getAllPets = async () => {
    try {
        const jsonData = await fs.readFile(petPfFilePath, "utf-8");
        const data = JSON.parse(jsonData);
        return data;
    } catch (error) {
        console.error("Error reading pet-data.json:", error);
    }
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
