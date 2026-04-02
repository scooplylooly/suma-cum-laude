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
        activityLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
        },
        experienceLevel: {
            type: String,
            enum: ["beginner", "intermediate", "experienced"],
            default: "intermediate",
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
        adopted: {
            type: Boolean,
            default: false,
        },
        createdByAdmin: {
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
            default: null,
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
        petType: {
            type: String,
            default: "",
        },
        reason: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "denied"],
            default: "pending",
        },
        houseType: {
            type: String,
            enum: ["HDB", "Condo", "Landed"],
            required: true,
        },
        existingPets: {
            type: String,
            required: true,
        },
        petExperience: {
            type: String,
            required: true,
        },
        income: {
            type: Number,
            required: true,
        },
        contactNo: {
            type: Number,
            required: true,
        },
        activityLevel: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
            required: true,
        },
        experienceLevel: {
            type: String,
            enum: ["beginner", "intermediate", "experienced"],
            default: "beginner",
            required: true,
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

exports.createPetData = async function (pet) {
    try {
        await Pet.create(pet);
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
    return Application.find({ pid: new mongoose.Types.ObjectId(petID) }).lean();
};
exports.findApplicationByID = async function (ID) {
    return Application.findOne({ _id: ID });
};
exports.findApplicationbyUID = async function (UID) {
    return Application.find({ uid: new mongoose.Types.ObjectId(UID) }).lean();
};
exports.updateApplicationbyID = async function (ID, value) {
    try {
        await Application.updateOne({ _id: ID }, { $set: { status: value } });
        return "Success!";
    } catch (error) {
        return error;
    }
};
exports.updatePetStatusbyID = async function (pid, value) {
    try {
        await Pet.updateOne({ _id: pid }, { $set: { adopted: value } });
        return "Pet Adopted";
    } catch (error) {
        return error;
    }
};
exports.deleteApplication = async function (appID) {
    try {
        await Application.deleteOne({ _id: appID });
        console.log("success");
    } catch (error) {
        return error;
    }
};
exports.updateApplicationDetails = async function (appID, updatedFields) {
    return Application.findOneAndUpdate(
        { _id: appID },
        { $set: updatedFields },
        { new: true },
    );
};

//For Admin Dashboard

exports.countPets = async function () {
    try {
        return Pet.countDocuments({});
    } catch (error) {
        return error;
    }
};

exports.countTotalApplications = async function () {
    try {
        return Application.countDocuments({});
    } catch (error) {
        return error;
    }
};

exports.countPendingApplications = async function () {
    try {
        return Application.countDocuments({ status: "pending" });
    } catch (error) {
        return error;
    }
}

exports.avgDaysUnadopted = async function () {
    try {
        const adoptedApplications = await Application.find({ status: 'approved' }).lean();
        // checks if applications exist yet
        if (adoptedApplications.length === 0){
            return null;
        }

        let totalTime = 0;
        let count = 0;

        for (let app of adoptedApplications) {
            const pet = await Pet.findOne({_id: app.pid}).lean(); // find the pid of each adopted pet
            if (!pet){ // guard for errors if pet is deleted from database
                continue;
            }; 

            const listedAt = pet.createdAt;
            const adoptedAt = app.updatedAt; // updatedAt reflects when status was last changed to adopted
            totalTime += (new Date(adoptedAt) - new Date(listedAt)); // time is in miliseconds
            count++;
        }

        if (count === 0){
            return null; // to ensure that we do not get a undefined stats value: a non-zero num / zero is undefined
        }

        const avgTime = totalTime / count;
        const avgDays = (avgTime / (1000 * 60 * 60 * 24)).toFixed(1); // converts time from ms to days
        return avgDays;

    } catch (error) {
        console.error('Error calculating avg time unadopted:', error);
        return null;
    }
};

exports.avgDaysUnadoptedByType = async function () {
    try {
        const adoptedApplications = await Application.find({status: 'approved'}).lean();
        if (adoptedApplications.length === 0){ // check if applications exist yet
             return null;
        }

        let avgByType = {};
        let typeCount = {};

        for (let app of adoptedApplications) {
            const pet = await Pet.findOne({_id: app.pid}).lean()
            if (!pet){
                continue; 
            }
            const listedAt = pet.createdAt;
            const adoptedAt = app.updatedAt; // updatedAt reflects when status was last changed to adopted
            const diff = (new Date(adoptedAt) - new Date(listedAt));
            if (diff <= 0) {
                continue; // skips aggregating insignificant data
            }
           // records unadopted time for each pet in ms
            avgByType[pet.type] = (avgByType[pet.type] ?? 0) + diff;
            // records count for each type
            typeCount[pet.type] = (typeCount[pet.type] ?? 0) + 1
        }

        Object.keys(avgByType).forEach(type => {
            const currentAvg = avgByType[type] / typeCount[type];
            avgByType[type] = (currentAvg / (1000 * 60 * 60 * 24)).toFixed(1); // converts time from ms to days
        });
        return avgByType;

    } catch (error) {
        console.error('Error calculating avg time unadopted by pet type:', error);
    }
};

exports.adoptionRateByType = async function () {
    try {
        const adoptedPets = await Pet.find({ approved: true }).lean();

        if (adoptedPets.length === 0){
            return null;
        }

        const total = {};
        const adopted = {};

        for (let pet of adoptedPets) {
            const type = pet.type;

            total[type] = (total[type] || 0) + 1;
            if (pet.adopted) {
                adopted[type] = (adopted[type] || 0) + 1;
            }
        }

        const rates = {};
        for (let type in total) {
            const rate = ((adopted[type] || 0) / total[type] * 100).toFixed(1);
            rates[type] = { adopted: adopted[type] || 0, total: total[type], rate: `${rate}%` };
        }

        return rates;

    } catch (error) {
        console.error('Error calculating adoption rate by type:', error);
        return {};
    }
}
