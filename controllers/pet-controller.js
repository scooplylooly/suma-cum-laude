const listing = require("../models/pet-model");// to access pet-model
const accountModel = require("../models/account-model");
const petScorer = require("../utils/petScorer");

// pets personalities avaliable
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

// Query database to get all pets and display on home
exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    const user = req.session.user;
    const userDetails = await accountModel.retrieveProfile(user._id);
    const preferences = userDetails?.preferences ?? {};
    const applications = await listing.findApplicationbyUID(user._id);
    let pids = [];
    for (let application of applications) {
        pids.push(application.pid.toString());
    }

    pets.reverse();

    for (let pet of pets) {
        pet.score = petScorer.calculateScore(preferences, pet).score;
    }

    pets.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    return res.render("pet-search", {
        pets,
        nameSearched: "",
        user,
        pids,
    });
};
// search pets based on names or type or breed
exports.searchPet = async (req, res) => {
    let nameSearched = req.query.nameSearched;
    let allPets = await listing.getAllPets();
    const user = req.session.user;
    const applications = await listing.findApplicationbyUID(user._id);

    allPets.reverse();
    let pids = [];
    for (let application of applications) {
        pids.push(application.pid.toString());
    }
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

    for (let pet of pets) {
        pet.score = petScorer.calculateScore(preferences, pet).score;
    }

    pets.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

    return res.render("pet-search", {
        nameSearched,
        pets,
        user,
        pids,
    });
};
//renders the listing form on the pet creation page
exports.showPetListingForm = async (req, res) => {
    const user = req.session.user;
    
    return res.render("pet-create-listing", {
        redirectUrl: null,
        errorMsg: "",
        successMsg: "",
        user,
        petPersonalities,
        formData: null,
    });
};
//to render pet profile and application form
exports.showPetProfile = async (req, res) => {
    const user = req.session.user;

    let pid = req.query.pid;
    const appForPet = await listing.findApplicationByPet(pid); 
    let appExist = false;//check if application exist, if so, users can't apply for pet
    if (appForPet) {
        for (app of appForPet) {
            if (app.uid == user._id) {
                appExist = true;
                break;
            }
        }
    }
    console.log("appExist", appExist);

    if (!pid) {
        return res.redirect("/adopt");
    } else {
        let result = await listing.findPetById(pid);
        console.log(result);
        return res.render("pet-profile", {
            appExist,
            petFound: result,
            errorMsg: "",
            successMsg: "",
            user,
            userInfo: await accountModel.retrieveProfile(user._id),
        });
    }
};
//post the the application form in pet profile and creates the application for a pet in the db
exports.applyInterest = async (req, res) => {
    const user = req.session.user;
    let petName = req.body.petName;
    //let pet = await listing.findPet(petName).lean();
    let pid = req.body.pid
    pet = await listing.findPetById(pid).lean();
    let appForPet = await listing.findApplicationByPet(pid);
    let appExist = false;
    
    if (appForPet) {
        for (app of appForPet) {
            if (app.uid == user._id) {
                appExist = true;
            }
            break;
        }
    }
    let errorMsg = "";
    let successMsg = "";
    // let petFound = null;
    let uid = user._id;
    let userName = user.userName;
    let reason = (req.body.applyReason ?? "").trim();
    let houseType = (req.body.houseType ?? "").trim();
    let existingPets = (req.body.existingPets ?? "").trim();
    let petExperience = (req.body.petExperience ?? "").trim();
    let income = (req.body.income ?? "").trim();
    let contactNo = (req.body.contactNo ?? "").trim();

    if (
        !reason ||
        !houseType ||
        !existingPets ||
        !petExperience ||
        !income ||
        !contactNo 
        
    ) {
        errorMsg += "Please fill in all fields to apply for adoption.";
        return res.render("pet-profile", {
            petFound: pet,
            errorMsg: errorMsg,
            successMsg: successMsg,
            user,
            userInfo: await accountModel.retrieveProfile(uid),
            appExist,
        });
    }

    let application = {
        uid: uid,
        pid: pid,
        userName: userName,
        petName: petName,
        petType: pet.type,
        reason: reason,
        houseType: houseType,
        existingPets: existingPets,
        petExperience: petExperience,
        income: income,
        contactNo: contactNo,
        
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
        user,
        userInfo: await accountModel.retrieveProfile(uid),
        appExist: successMsg != "" ? true : false,
    });
};


//to post to pet listing form submited by user
exports.createPetListing = async (req, res) => {
    let username = (req.body.ownerName ?? "").trim();
    console.log("Received username:", username);
    let user = username
        ? await accountModel.findUserByName(username)
        : req.session.user;
    console.log("user", user);
    let type = req.body.type;
    let breed = req.body.breed;
    const imageFilename = req.file
        ? req.file.filename.replace(".jpg", "")
        : "default-pet";
    console.log("Saved image as:", imageFilename); // Should be like "pet-1234567890.jpg
    let redirectUrl = "/view-listings";
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
    if (hdbApproved === undefined) missingFields.push("HDB Approved status");
    if (vaccinated === undefined) missingFields.push("Vaccinated status");
    if (sterilized === undefined) missingFields.push("Sterilized status");
    if (!type) missingFields.push("Type");
    if (!breed) missingFields.push("Breed");
    if (!name) missingFields.push("Name");
    if (!gender) missingFields.push("Gender");
    if (!desc) missingFields.push("Description");
    if (!dob) missingFields.push("Date of Birth");
    if (activityLevel === undefined) missingFields.push("Activity Level");
    if (experienceLevel === undefined) missingFields.push("Experience Level");
    if (dob && new Date(dob) > new Date()) {
        missingFields.push("Date of birth cannot be in the future");
    }
    console.log(user);
    if (!user) {
        missingFields.push("invalid owner / lister");
    } else if (user.role === "user") {
        missingFields.push("The owner must be a lister to create a listing");
    }
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
        approved: createdByAdmin ? true : false, // New listings start as unapproved
        createdByAdmin: createdByAdmin,
        activityLevel: activityLevel,
        experienceLevel: experienceLevel,
    };

    try {
        await listing.createPetData(newPet);//creates new pet listing in DB
        successMsg = "Listing created successfully!";
        redirectUrl = createdByAdmin ? "/admin/listings" : "/view-listings"; // changes redirect based on user.role
        return res.render("pet-create-listing", {
            redirectUrl,
            errorMsg: "",
            successMsg: successMsg,
            petPersonalities,
            formData: null, // Clear form
        });
    } catch (error) {
        errorMsg = "Error creating pet listing! Please try again.";
        console.error("Error creating pet listing:", error);

        return res.render("pet-create-listing", {
            redirectUrl,
            errorMsg: errorMsg,
            successMsg: "",
            petPersonalities,
            formData: req.body, // Send back data to repopulate form
        });
    }
};
// renders listings of listers
exports.viewListings = async (req, res) => {
    const user = req.session.user;
    console.log("SESSION USER:", user);

    const uid = user._id;
    const pets = await listing.getMyPets(uid).lean();// gets pets owned by lister by their user id
    let petFound = [];
    for (let pet of pets) {
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
//lets user see the profile of thier own pet and then they have the option to edit or withdraw their listing
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
//render the update listing form  
exports.updatePetProfile = async (req, res) => {
    const pid = req.query.pid;
    let pet = await listing.findPetById(pid);
    res.render("update-pet-details", {
        redirectUrl: null,
        pet,
        petPersonalities,
        errorMsg: "",
        successMsg: "",
        formData: req.query, // Send back data to repopulate form
    });
};
//post the updated details of the listing into the DB
exports.petUpdated = async (req, res) => {
    const pid = req.body.pid;
    console.log("PID RECEIVED:", pid);
    let redirectUrl = "/view-listings";
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
    let name = (req.body.name ?? "").trim() || pet.name;
    let gender = (req.body.gender ?? "").trim() || pet.gender;
    let desc = (req.body.desc ?? "").trim() || pet.description;
    let dob = (req.body.dob ?? "").trim() || pet.dob;
    let hdbApproved =
        (req.body.hdbApproved ?? "").trim() || pet.hdbApproved.toString();
    let vaccinated =
        (req.body.vaccinated ?? "").trim() || pet.vaccinated.toString();
    let sterilized =
        (req.body.sterilized ?? "").trim() || pet.sterilized.toString();
    let personality = req.body.personality || pet.personality;
    let createdByAdmin = user.role == "admin" ? true : false;
    let activityLevel =
        (req.body.activityLevel ?? "").trim() || pet.activityLevel;
    let experienceLevel =
        (req.body.experienceLevel ?? "").trim() || pet.experienceLevel;
    if (user.role == "admin") {
        redirectUrl = "/admin/listings";
    } else {
        redirectUrl = "/view-listings";
    };

    let errorMsg = "";
    let successMsg = "";
    let missingFields = [];

    if (!type || type === "--Choose a type--") missingFields.push("Type");
    if (!breed) missingFields.push("Breed");
    if (!name) missingFields.push("Name");
    if (!gender) missingFields.push("Gender");
    if (!desc) missingFields.push("Description");
    if (!dob) missingFields.push("Date of Birth");
    if (hdbApproved === undefined) missingFields.push("HDB Approved status");
    if (vaccinated === undefined) missingFields.push("Vaccinated status");
    if (sterilized === undefined) missingFields.push("Sterilized status");
    if (dob && new Date(dob) > new Date()) {
        missingFields.push("Date of birth cannot be in the future");
    }

    if (missingFields.length > 0) {
        errorMsg = `Required fields missing: ${missingFields.join(", ")}`;
        return res.render("pet-create-listing", {
            redirectUrl,
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
        approved: createdByAdmin ? true : false, // checks if user is admin, if not, will reset approval on update
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
            redirectUrl,
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
            redirectUrl,
            errorMsg: errorMsg,
            successMsg: "",
            petPersonalities: petPersonalities,
            pet: pet,
            formData: req.body,
        });
    }
};
// lets lister view application for their pet 
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
//get and render the some pet details and gives option for user to delete their listing
exports.deletePetProfile = async (req, res) => {
    const pid = req.query.pid;
    let pet = await listing.findPetById(pid);
    return res.render("delete-pet-profile", { pet, errorMsg: "" });
};
//post and deletes pet listing base on the user
exports.petDeleted = async (req, res) => {
    let redirectUrl = "/view-listings";
    let user = req.session.user;
    const pid = req.body.pid;
    let pet = await listing.findPetById(pid);
    console.log("pet", pet);
    console.log("PID RECEIVED:", pid);
    let fail = "";
    try {
        await listing.deletePetData(pid, pet.img);

        console.log("deleted");
        if (user.role == "admin") {
            redirectUrl = "/admin/listings";
        }
        return res.redirect(redirectUrl);
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
    let pet = await listing.findPetById(petID);

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
    return res.render("view-applications", { applications, user, petName, pet });
};

// lets lister deny user applictions for thier pet listing

exports.denyApp = async (req, res) => {
    const appID = req.query.application;
    const value = "denied";
    const petID = req.query.petID;
    const petName = req.query.petName;
    const user = req.session.user;
    let pet = await listing.findPetById(petID);
    try {
        await listing.updateApplicationbyID(appID, value);
        console.log("Success!");
    } catch (error) {
        console.log(error);
    }
    const applications = await listing.findApplicationByPet(petID);
    return res.render("view-applications", { applications, user, petName , pet});
};
//lets user check application status for a pet
exports.applicationStatus = async (req, res) => {
    const user = req.session.user;
    const uid = user._id;
    const applications = await listing.findApplicationbyUID(uid);
    return res.render("applications-status", { applications, user });
};
// lets user delete their appplication
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
//lets user update their application
exports.updateApplication = async (req, res) => {
    const appID = req.query.appID;
    const user = req.session.user;
    const application = await listing.findApplicationByID(appID);
    return res.render("update-application", {
        application,
        user,
        errorMsg: "",
        successMsg: "",
    });
};
//post and handle update application form of user and the updates in the db
exports.updateApplicationDetails = async (req, res) => {
    const appID = req.body.appID;
    console.log("APPID:", appID);
    const originalApp = await listing.findApplicationByID(appID);
    console.log("Original Application:", originalApp);
    const houseType =
        (req.body.houseType ?? "").trim() || originalApp.houseType;
    const existingPets =
        (req.body.existingPets ?? "").trim() || originalApp.existingPets;
    const reason = (req.body.reason ?? "").trim() || originalApp.reason;
    const contactNo =
        (req.body.contactNo ?? "").trim() || originalApp.contactNo;
    const income = (req.body.income ?? "").trim() || originalApp.income;
    const petExperience =
        (req.body.petExperience ?? "").trim() || originalApp.petExperience;
    const user = req.session.user;
    const uid = user._id;
    if (
        !houseType ||
        !existingPets ||
        !reason ||
        !contactNo ||
        !income ||
        !petExperience
    ) {
        let errorMsg = "Please fill in all fields to update your application.";
        const application = await listing.findApplicationByID(req.body.appID);
        return res.render("update-application", {
            application,
            user,
            errorMsg,
            successMsg: "",
        });
    }

    const updatedFields = {
        houseType: houseType,
        income: income,
        petExperience: petExperience,
        existingPets: existingPets,
        contactNo: contactNo,
        reason: reason,
    };

    try {
        await listing.updateApplicationDetails(appID, updatedFields);
        console.log("application updated");
    } catch (error) {
        console.log("Error:", error);
        return res.render("update-application", {
            application: await listing.findApplicationByID(appID),
            user,
            errorMsg: "Error updating application.",
            successMsg: "",
        });
    }
    const applications = await listing.findApplicationbyUID(uid);
    return res.render("applications-status", {
        user,
        applications,
        errorMsg: "",
        successMsg: "Application updated successfully!",
    });
};
