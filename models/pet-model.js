const mongoose = require("mongoose");
const { devNull, type } = require("os");
const path = require("path");
const fs = require("fs").promises;
// const applyFilePath = "data/apply-for-pet-data.json";
// const petFilePath = "data/pets-data.json";

// pet-data schema
const petSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            enum: [
                "dog",
                "cat",
                "rabbit",
                "hamster",
                "bird",
                "guinea pig",
                "other",
            ],
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

        uid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            default: null,
        },
        approved: {
            type: Boolean,
            default: false,
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
            default: null,
        },
        userName: {
            type: String,
            ref: "users",
            default: null
        },
        applicationNumber: {
            type: String,
            default: () => "APP-" + Date.now(),
        },
        pid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pets",
            default: null,
        },
        petName: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending','approved','denied'],
            default: 'pending'
        }
    },
    {
        timestamps: true,
    },
);

///////////////////////////////////////////////////////////////////////////////////////////////////

// Pet Schema Definition
const Pet = mongoose.model("Pet", petSchema, "pets-data");

// Pet Methods
// get pets by user id
exports.getMyPets = function (uid) {
    return Pet.find({ uid }).lean();
};
// get all pets
exports.getAllPets = function () {
    return Pet.find().lean();
};
// finding pet by name
exports.findPet = function (petName) {
    return Pet.findOne({ name: petName }).lean();
};
// finding pet by ID
exports.findPetById = function (pid) {
    return Pet.findOne({ _id: pid }).lean();
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

// exports.createPetData = async (petInfo) => {
//     try {
//         let data = [];

//         // Try to read existing file
//         try {
//             const jData = await fs.readFile(petFilePath, "utf-8");
//             data = JSON.parse(jData);
//             console.log("existing data", data);
//         } catch (readError) {
//             // File doesn't exist - start with empty array
//             console.log("No existing file, creating new one");
//             data = [];
//         }

//         data.push(petInfo);
//         console.log("new", data);
//         const jData = JSON.stringify(data, null, 2);
//         console.log(petFilePath, data);
//         await fs.writeFile(petFilePath, jData, "utf-8");
//         console.log("Listing saved successfully");
//     } catch (error) {
//         console.error("Error writing to pet-data.json:", error);
//     }
// };

exports.createPetData = function (pet) {
    try {
        Pet.create(pet);
        console.log("Listing saved successfully");
    } catch (err) {
        console.error("Error writing to db:", err);
    }
};

exports.deleteImage = async function (img) {
    try {
        const imagePath = path.join(
            __dirname,
            "..",
            "public",
            "images",
            img + ".jpg",
        );
        await fs.unlink(imagePath);
        console.log("Image deleted successfully");
    } catch (err) {
        console.error("Error deleting image:", err);
    }
};
exports.deletePetData = async function (pid, img) {
    try {
        const result = await Pet.deleteOne({
            _id: new mongoose.Types.ObjectId(pid),
        });
        await this.deleteImage(img);
        console.log("Delete result:", result);

        return result;
    } catch (err) {
        console.error("Error deleting from db:", err);
    }
};

exports.updatePetData = async function (pid, pet) {
    try {
        const result = await Pet.updateOne(
            {
                _id: new mongoose.Types.ObjectId(pid),
            },
            { $set: pet },
        );

        console.log("Update result:", result);

        return result;
    } catch (err) {
        console.error("Error updating in db:", err);
    }
};
exports.updatePetApproval = async function (pid, approved) {
    try {
        const result = await Pet.updateOne(
            {
                _id: new mongoose.Types.ObjectId(pid),
            },
            { $set: { approved: approved } },
        );
        return result;
    } catch (err) {
        console.error("Error updating approval in db:", err);
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////

// Application Schema definition
const Application = mongoose.model(
    "Application",
    applicationSchema,
    "pet-application-form",
);

// Application Methods
exports.checkExistingApplications = function () {
    return Application.find().lean();
};

exports.createNewApplication = async function (application) {
    return Application.create(application);
};

exports.findApplicationByPet = async function (petID) {
    return Application.find({pid: new mongoose.Types.ObjectId(petID)}).lean()
}
exports.findApplicationByID = async function (ID) {
    return Application.findOne({_id:ID})
};
exports.updateApplicationbyID = async function (ID,value) {
    try{
        await Application.updateOne({_id: ID}, {$set: {status: value}})
        return 'Success!'
    }catch(error){
        return error
    }
};
exports.updatePetStatusbyID = async function (pid,value) {
    try{
        await Pet.updateOne({_id:pid}, {$set: {approved: value}})
        return "Pet Adopted"
    }catch(error){
        return error
    }
};
