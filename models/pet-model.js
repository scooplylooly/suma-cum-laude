const mongoose = require("mongoose");
const { devNull } = require("os");
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
            ref: "users",
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// Application Schema
const applicationSchema = new mongoose.Schema(
    {
        uid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        default: null
        },
        applicationNumber: {
            type: String,
            default: () => "APP-" + Date.now()
        },
        pid: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        petName: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true
        },

    },
    {
        timestamps: true,
    },

);

///////////////////////////////////////////////////////////////////////////////////////////////////

// Pet Schema Definition
const Pet = mongoose.model("Pet", petSchema, "pets-data");

// Pet Methods

exports.getMyPets = function (uid) {
    return Pet.find({uid}).lean()
}

exports.getAllPets = function () {
    return Pet.find().lean();
};

exports.findPet = function (petName) {
    return Pet.findOne({ name: petName }).lean();
};

// exports.writeApplyInfo = function (application) {
//     return Pet.create(application)
// }

// exports.writeApplyInfo = async (application) => {
//     try {
//         let data = [];

//         // Try to read existing file
//         try {
//             const jsonData = await fs.readFile(applyFilePath, "utf-8");
//             data = JSON.parse(jsonData);
//             console.log("existing data", data);
//         } catch (readError) {
//             // File doesn't exist - start with empty array
//             console.log("No existing file, creating new one");
//             data = [];
//         }

//         data.push(application);
//         const jData = JSON.stringify(data, null, 2);
//         console.log(applyFilePath, data);
//         await fs.writeFile(applyFilePath, jData, "utf-8");
//         console.log("Application saved successfully");
//     } catch (error) {
//         console.error("Error writing to apply-for-pet-data.json:", error);
//     }
// };

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

///////////////////////////////////////////////////////////////////////////////////////////////////

// Application Schema definition
const Application = mongoose.model("Application", applicationSchema, "pet-application-form");


// Application Methods
exports.checkExistingApplications =  function () {
    return Application.find().lean()
}

exports.createNewApplication = async function (application) {
    return Application.create(application)
}
