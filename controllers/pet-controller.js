const { configDotenv } = require("dotenv");
const listing = require("../models/pet-model");
const accountModel = require("../models/account-model");
const petScorer = require("../utils/petScorer");
const path = require("path");

// ... rest of your code
const petPersonalities = [
    "affectionate",
    "independent",
    "playful",
    "curious",
    "gentle",
    "vocal",
    "shy",
    "bold",
    "couch potato",
    "hunter",
    "social",
    "energetic",
    "loyal",
    "friendly",
    "protective",
    "calm",
    "smart",
    "goofy",
    "cuddly",
    "adventurous",
    "sweet",
    "relaxed",
    "outgoing",
    "loving",
    "resilient",
    "chatty",
    "foodie",
    "active",
];
petPersonalities.sort();
// Query database to get all pets
exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    const user = req.session.user;
    const userDetails = await accountModel.retrieveProfile(user._id);
    const preferences = userDetails?.preferences ?? {};
    const applications = await listing.findApplicationbyUID(user._id);
    const pids = applications.map((application) => String(application.pid));

    pets.reverse();

    pets = pets.map((pet) => ({
        ...pet,
        score: petScorer.calculateScore(preferences, pet).score,
    }));

    pets.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    return res.render("pet-search", {
        pets,
        nameSearched: "",
        user,
        pids,
    });
};

exports.searchPet = async (req, res) => {
    let nameSearched = req.query.nameSearched;
    let allPets = await listing.getAllPets();
    const user = req.session.user;
    const applications = await listing.findApplicationbyUID(user._id);
    const pids = applications.map((application) => String(application.pid));

    allPets.reverse();
    let pets = [];

    if (nameSearched !== "") {
        const search = nameSearched.toLowerCase();

        for (let pet of allPets) {
            if (
                pet.name.toLowerCase().includes(search) ||
                pet.type.toLowerCase().includes(search) ||
                pet.breed.toLowerCase().includes(search)
            ) {
                pets.push(pet);
            }
        }
    } else {
        pets = allPets;
    }

    const userDetails = await accountModel.retrieveProfile(user._id);
    const preferences = userDetails?.preferences ?? {};

    pets = pets.map((pet) => ({
        ...pet,
        score: petScorer.calculateScore(preferences, pet).score,
    }));

    pets.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    return res.render("pet-search", {
        nameSearched,
        pets,
        user,
        pids,
    });
};

exports.showPetListingForm = async (req, res) => {
    const user = req.session.user;
    return res.render("pet-create-listing", {
        errorMsg: "",
        successMsg: "",
        user,
    });
};

exports.showPetProfile = async (req, res) => {
    const user = req.session.user;
    let userInfo = await accountModel.retrieveProfile(user._id);
    let pid = req.query.pid;
    if (!pid) {
        return res.redirect("/adopt");
    } else {
        let result = await listing.findPetById(pid);
        console.log(result);
        return res.render("pet-profile", {
            petFound: result,
            errorMsg: "",
            successMsg: "",
            user,
            userInfo,
        });
    }
};

exports.applyInterest = async (req, res) => {
    let errorMsg = "";
    let successMsg = "";
    // let petFound = null;
    const user = req.session.user;
    let petName = req.body.petName;
    let pet = await listing.findPet(petName).lean();

    let application = {
        uid: req.session.user?._id ?? null,
        pid: pet?._id ?? null,
        userName: req.session.user?.userName ?? null,
        petName: petName,
        petType: pet.type,
        reason: req.body.applyReason,
        houseType: req.body.houseType,
        existingPets: req.body.existingPets,
        petExperience: req.body.petExperience,
        income: req.body.income,
        contactNo: req.body.contactNo,
    };

    try {
        await listing.createNewApplication(application);
        console.log(application);
        successMsg += "Application successful!";
    } catch (error) {
        errorMsg += "Application failed.";
        console.error("Error when applying", error);
    }

    return res.render("pet-profile", {
        petFound: pet,
        errorMsg: errorMsg,
        successMsg: successMsg,
    });
};

exports.showPetListingForm = async (req, res) => {
    const user = req.session.user;
    return res.render("pet-create-listing", {
        errorMsg: "",
        successMsg: "",
        petPersonalities,
        formData: null,
        user,
    });
};

exports.createPetListing = async (req, res) => {
    let user = req.body.ownerName
        ? await account.findUserByName(req.body.ownerName)
        : req.session.user;
    console.log("user", user);
    let type = req.body.type;
    let breed = req.body.breed;
    const imageFilename = req.file
        ? req.file.filename.replace(".jpg", "")
        : "default-pet";
    console.log("Saved image as:", imageFilename); // Should be like "pet-1234567890.jpg
    let name = req.body.name;
    let gender = req.body.gender;
    let desc = req.body.desc;
    let dob = req.body.dob;
    let hdbApproved = req.body.hdbApproved;
    let vaccinated = req.body.vaccinated;
    let sterilized = req.body.sterilized;
    let personality = req.body.personality;
    let createdByAdmin = req.session.user.role == "admin" ? true : false;
    let activityLevel = req.body.activityLevel;
    let experienceLevel = req.body.experienceLevel;
    console.log("created by admin:", createdByAdmin);
    let errorMsg = "";
    let successMsg = "";

    let missingFields = [];
    if (!type) missingFields.push("Type");
    if (!breed) missingFields.push("Breed");
    if (!name) missingFields.push("Name");
    if (!gender) missingFields.push("Gender");
    if (!desc) missingFields.push("Description");
    if (!dob) missingFields.push("Date of Birth");
    if (!activityLevel) missingFields.push("Activity Level");
    if (!experienceLevel) missingFields.push("Experience Level");
    if (user.role == "user")
        missingFields.push("The owner must be a lister to create a listing");
    if (missingFields.length > 0) {
        errorMsg = `Required fields missing: ${missingFields.join(", ")}`;
        return res.render("pet-create-listing", {
            errorMsg: errorMsg,
            successMsg: "",
            petPersonalities,
            formData: req.body,
        });
    }

    // Handle personality array
    if (!personality) {
        personality = [];
    } else if (!Array.isArray(personality)) {
        personality = [personality];
    }

    // Create new pet object
    let newPet = {
        type: type,
        img: imageFilename,
        name: name,
        breed: breed,
        gender: gender,
        description: desc,
        hdbApproved: hdbApproved === "true" ? true : false,
        dob: dob,
        vaccinated: vaccinated === "true" ? true : false,
        sterilized: sterilized === "true" ? true : false,
        personality: personality,
        uid: user ? user._id : null,
        approved: false, // New listings start as unapproved
        createdByAdmin: createdByAdmin,
        activityLevel: activityLevel,
        experienceLevel: experienceLevel,
    };

    try {
        await listing.createPetData(newPet);
        successMsg = "Listing created successfully!";

        // Clear form data on success
        return res.render("pet-create-listing", {
            user,
            errorMsg: "",
            successMsg: successMsg,
            petPersonalities,
            formData: null, // Clear form
        });
    } catch (error) {
        errorMsg = "Error creating pet listing! Please try again.";
        console.error("Error creating pet listing:", error);

        return res.render("pet-create-listing", {
            user,
            errorMsg: errorMsg,
            successMsg: "",
            petPersonalities,
            formData: req.body, // Send back data to repopulate form
        });
    }
};
exports.viewListings = async (req, res) => {
    const user = req.session.user;
    console.log("SESSION USER:", user);

    const uid = user._id;
    const pets = await listing.getMyPets(uid).lean();
    let petFound = [];
    for (pet of pets) {
        if (pet.uid == uid) {
            petFound.push(pet);
        }
    }

    res.render("view-user-listings", {
        pets,
        user,
        petFound,
    });
};
exports.showPetlistingProfile = async (req, res) => {
    const pid = req.query.pid;
    let pet = await listing.findPetById(pid).lean();
    console.log(pid);

    res.render("edit-pet-listing", {
        pet,
        successMsg: "",
        errorMsg: "",
    });
};

exports.changePetlistingProfile = async (req, res) => {
    const pid = req.query.pid;
    let pet = await listing.findPetById(pid);
    res.render("edit-pet-listing", {
        pet,
    });
};

exports.updatePetProfile = async (req, res) => {
    const pid = req.query.pid;
    let pet = await listing.findPetById(pid);
    res.render("update-pet-details", {
        pet,
        petPersonalities,
        errorMsg: "",
        successMsg: "",
        formData: req.query, // Send back data to repopulate form
    });
};

exports.petUpdated = async (req, res) => {
    const pid = req.body.pid;
    console.log("PID RECEIVED:", pid);

    // Validate pid exists
    if (!pid) {
        return res.status(400).send("Pet ID is missing");
    }

    let pet = await listing.findPetById(pid);

    // Check if pet exists
    if (!pet) {
        return res.status(404).send("Pet not found");
    }

    let type = req.body.type;
    let breed = req.body.breed;

    // Store old image name before creating newPet object
    const oldImageName = pet.img;

    // Handle image filename - multer saves as "pet-1234567890.jpg"
    let imageFilename = oldImageName;
    if (req.file) {
        // Remove .jpg extension to store just the base name
        imageFilename = req.file.filename.replace(".jpg", "");
        console.log("New image uploaded:", req.file.filename);
        console.log("Stored as:", imageFilename);
    }

    console.log("Old image:", oldImageName);
    console.log("New image filename:", imageFilename);
    let user = req.session.user;
    let name = req.body.name;
    let gender = req.body.gender;
    let desc = req.body.desc;
    let dob = req.body.dob;
    let hdbApproved = req.body.hdbApproved;
    let vaccinated = req.body.vaccinated;
    let sterilized = req.body.sterilized;
    let personality = req.body.personality;
    let createdByAdmin = user.role == "admin" ? true : false;
    let activityLevel = req.body.activityLevel;
    let experienceLevel = req.body.experienceLevel;

    let errorMsg = "";
    let successMsg = "";
    let missingFields = [];

    if (!type || type === "--Choose a type--") missingFields.push("Type");
    if (!breed) missingFields.push("Breed");
    if (!name) missingFields.push("Name");
    if (!gender) missingFields.push("Gender");
    if (!desc) missingFields.push("Description");
    if (!dob) missingFields.push("Date of Birth");
    if (!activityLevel) missingFields.push("Activity Level");
    if (!experienceLevel) missingFields.push("Experience Level");
    if (user.role == "user")
        missingFields.push("The owner must be a lister to update a listing");
    if (missingFields.length > 0) {
        errorMsg = `Required fields missing: ${missingFields.join(", ")}`;
        return res.render("pet-create-listing", {
            errorMsg: errorMsg,
            successMsg: "",
            pet: pet,
            petPersonalities: petPersonalities,
            formData: req.body,
        });
    }

    // Handle personality array
    if (!personality) {
        personality = [];
    } else if (!Array.isArray(personality)) {
        personality = [personality];
    }

    // Create updated pet object
    let newPet = {
        type: type,
        img: imageFilename,
        name: name,
        breed: breed,
        gender: gender,
        description: desc,
        hdbApproved: hdbApproved === "true" ? true : false,
        dob: dob,
        vaccinated: vaccinated === "true" ? true : false,
        sterilized: sterilized === "true" ? true : false,
        personality: personality,
        uid: pet.uid || null,
        approved: false, // Reset approval status on update
        createdByAdmin: createdByAdmin, // set admin creation status on update
        activityLevel: activityLevel,
        experienceLevel: experienceLevel,
    };

    console.log("Updating pet with data:", newPet);

    try {
        // Update pet data in database
        const updateResult = await listing.updatePetData(pid, newPet);
        console.log("Update result:", updateResult);

        if (updateResult.modifiedCount === 0) {
            console.log("No changes were made to the pet listing");
        }

        successMsg = "Listing updated successfully!";

        // Only delete old image if a new image was uploaded and old image exists
        if (req.file && oldImageName && oldImageName !== "default-pet") {
            try {
                await listing.deleteImage(oldImageName);
                console.log("Old image deleted successfully:", oldImageName);
            } catch (deleteError) {
                console.error(
                    "Error deleting old image (non-critical):",
                    deleteError,
                );
            }
        } else {
            console.log("Keeping old image (no new upload)");
        }

        // Fetch the updated pet data to display
        const updatedPet = await listing.findPetById(pid);

        return res.render("pet-create-listing", {
            errorMsg: "",
            successMsg: successMsg,
            pet: updatedPet,
            petPersonalities: petPersonalities,
            formData: null,
        });
    } catch (error) {
        errorMsg = "Error updating pet listing! Please try again.";
        console.error("Error updating pet listing:", error);
        console.error("Error stack:", error.stack);

        // If there was an error and a new file was uploaded, clean it up
        if (req.file) {
            try {
                const fs = require("fs");
                const filePath = "public/images/" + req.file.filename;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log("Cleaned up uploaded file after error");
                }
            } catch (cleanupError) {
                console.error("Error cleaning up file:", cleanupError);
            }
        }

        return res.render("pet-create-listing", {
            errorMsg: errorMsg,
            successMsg: "",
            petPersonalities: petPersonalities,
            pet: pet,
            formData: req.body,
        });
    }
};
exports.viewApplications = async (req, res) => {
    let pid = req.query.pid;
    const user = req.session.user;
    let applications = await listing.findApplicationByPet(pid);
    let pet = await listing.findPetById(pid);
    let petName = pet.name;
    return res.render("view-applications", {
        applications,
        pet,
        user,
        petName,
    });
};
exports.deletePetProfile = async (req, res) => {
    const pid = req.query.pid;
    let pet = await listing.findPetById(pid);
    return res.render("delete-pet-profile", { pet, errorMsg: "" });
};
exports.petDeleted = async (req, res) => {
    const pid = req.body.pid;
    let pet = await listing.findPetById(pid);
    console.log("pet", pet);
    console.log("PID RECEIVED:", pid);
    let fail = "";
    try {
        await listing.deletePetData(pid, pet.img);

        console.log("deleted");
        return res.send(`
            <h3 style="color: green;"> Pet has been withdrawn from listing! Redirecting...</h3>
            <script>
                setTimeout(() => {
                    location.href = "/view-listings"
                    },3000)
            </script>`);
    } catch (err) {
        console.error("Trouble deleting pet", err);
        fail = "Error deleting pet";
        return res.render("delete-pet-profile", {
            pet,
            errorMsg: fail,
        });
    }
};
exports.approveApp = async (req, res) => {
    const appID = req.query.application;
    const value = "approved";
    const petID = req.query.petID;
    const petName = req.query.petName;
    const user = req.session.user;

    try {
        await listing.updateApplicationbyID(appID, value);
        await listing.updatePetStatusbyID(petID, true);
        console.log("Success!");
    } catch (error) {
        console.log(error);
    }
    let applications = await listing.findApplicationByPet(petID);
    console.log(petID);
    console.log(appID);
    for (let application of applications) {
        console.log("checking:", application._id.toString(), "vs", appID);

        if (application._id.toString() != appID) {
            console.log("denying:", application._id);

            await listing.updateApplicationbyID(application._id, "denied");
        }
    }
    applications = await listing.findApplicationByPet(petID);
    return res.render("view-applications", { applications, user, petName });
};
exports.denyApp = async (req, res) => {
    const appID = req.query.application;
    const value = "denied";
    const petID = req.query.petID;
    const petName = req.query.petName;
    const user = req.session.user;
    try {
        await listing.updateApplicationbyID(appID, value);
        console.log("Success!");
    } catch (error) {
        console.log(error);
    }
    const applications = await listing.findApplicationByPet(petID);
    return res.render("view-applications", { applications, user, petName });
};
exports.applicationStatus = async (req, res) => {
    const user = req.session.user;
    const uid = user._id;
    const applications = await listing.findApplicationbyUID(uid);
    return res.render("applications-status", { applications, user });
};
exports.deleteApplication = async (req, res) => {
    const appID = req.query.appID;
    const user = req.session.user;
    const uid = user._id;
    try {
        await listing.deleteApplication(appID);
        console.log("Application Deleted");
    } catch (error) {
        console.log("Error:", error);
    }
    const applications = await listing.findApplicationbyUID(uid);
    return res.render("applications-status", { applications, user });
};
exports.updateApplication = async (req, res) => {
    const appID = req.query.appID;
    const user = req.session.user;
    const application = await listing.findApplicationByID(appID);
    return res.render("update-application", { application, user });
};
exports.updateApplicationDetails = async (req, res) => {
    const updatedFields = {
        houseType: req.body.houseType,
        income: req.body.income,
        petExperience: req.body.petExperience,
        existingPets: req.body.existingPets,
        contactNo: req.body.contactNo,
        reason: req.body.applyReason,
    };
    const user = req.session.user;
    const appID = req.body.appID;
    const uid = user._id;
    try {
        await listing.updateApplicationDetails(appID, updatedFields);
        console.log("application updated");
    } catch (error) {
        console.log("Error:", error);
    }
    const applications = await listing.findApplicationbyUID(uid);
    return res.render("applications-status", { user, applications });
};
