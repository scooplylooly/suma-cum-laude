const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs").promises;


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
//create pet in db
exports.createPetData = async function (pet) {
    try {
        await Pet.create(pet);
        console.log("Listing saved successfully");
    } catch (err) {
        console.error("Error writing to db:", err);
    }
};
//helps delete img in image folder
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
//deletes pet data from db
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
// updates pet data in db
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
//updates the pet listing approval by admin
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
// creates new application in db
exports.createNewApplication = async function (application) {
    return Application.create(application);
};
// find application of pet by pet id
exports.findApplicationByPet = async function (petID) {
    return Application.find({ pid: new mongoose.Types.ObjectId(petID) }).lean();
};
// find the application of pet by the application id
exports.findApplicationByID = async function (ID) {
    return Application.findOne({ _id: ID });
};
// find the application of pet by the user id
exports.findApplicationbyUID = async function (UID) {
    return Application.find({ uid: new mongoose.Types.ObjectId(UID) }).lean();
};
//updates the application by the application id
exports.updateApplicationbyID = async function (ID, value) {
    try {
        await Application.updateOne({ _id: ID }, { $set: { status: value } });
        return "Success!";
    } catch (error) {
        return error;
    }
};
//updates the pet adopted status by pet id
exports.updatePetStatusbyID = async function (pid, value) {
    try {
        await Pet.updateOne({ _id: pid }, { $set: { adopted: value } });
        return "Pet Adopted";
    } catch (error) {
        return error;
    }
};
//deletes the application in the db
exports.deleteApplication = async function (appID) {
    try {
        await Application.deleteOne({ _id: appID });
        console.log("success");
    } catch (error) {
        return error;
    }
};
//updates the applocation details in the db
exports.updateApplicationDetails = async function (appID, updatedFields) {
    return Application.findOneAndUpdate(
        { _id: appID },
        { $set: updatedFields },
        { new: true },
    );
};

//For Admin Dashboard
// count the number of pets in the db
exports.countPets = async function () {
    try {
        return Pet.countDocuments({});
    } catch (error) {
        return error;
    }
};
//count the number of applications for all pets in the db
exports.countTotalApplications = async function () {
    try {
        return Application.countDocuments({});
    } catch (error) {
        return error;
    }
};
// count the total pending application for all pets in the db
exports.countPendingApplications = async function () {
    try {
        return Application.countDocuments({ status: "pending" });
    } catch (error) {
        return error;
    }
};
// the rate of adoption of a pet by type
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
};
