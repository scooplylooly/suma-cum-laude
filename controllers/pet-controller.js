const listing = require("../models/pet-model");
const petPersonalities = [
    "Affectionate",
    "Independent",
    "Playful",
    "Curious",
    "Gentle",
    "Vocal",
    "Shy",
    "Bold",
    "Couch Potato",
    "Hunter",
    "Social",
    "Energetic",
    "Loyal",
    "Friendly",
    "Protective",
    "Calm",
    "Smart",
    "Goofy",
    "Cuddly",
    "Adventurous",
    "Sweet",
    "Relaxed",
    "Outgoing",
    "Loving",
    "Resilient",
    "Chatty",
    "Foodie",
    "Active",
];

// Query database to get all pets
exports.displayPets = async (req, res) => {
    let pets = await listing.getAllPets();
    console.log(pets);
    pets.reverse();
    res.render("pet-search", {
        pets,
        nameSearched:''
    });
};

exports.searchPet = async (req,res) => {
    let nameSearched = req.query.nameSearched;
    let allPets = await listing.getAllPets();
    allPets.reverse();
    let pets = [];
    if (nameSearched!=''){
        for (let pet of allPets) {
            if (pet.name.toLowerCase().includes(nameSearched.toLowerCase())){
                pets.push(pet)
            }
        }
    }else{
        pets = allPets
    }
    res.render("pet-search",{
        nameSearched,
        pets
    });
}

exports.showPetListingForm = async (req, res) => {
    res.render("pet-create-listing", {
        errorMsg: "",
        successMsg: "",
        })
    }

exports.showPetProfile = async (req, res) => {
    let petName = req.body.petName;
    if (!petName) {
        res.redirect("/adopt");
        return;
    } else {
        let result = await listing.findPet(petName);
        console.log(result);
        res.render("pet-profile", {

            petFound: result,
            errorMsg: "",
            successMsg: "",
        });
    }
};

exports.applyInterest = async (req, res) => {
    let errorMsg = "";
    let successMsg = "";
    let petFound = null;

    let petName = req.body.petName;
    let pet = await listing.findPet(petName).lean()
    
    let application = {
        uid: req.session.user?._id ?? null,
        pid: null,
        petName: petName,
        reason: req.body.applyReason,
    };

    try {
        await listing.createNewApplication(application);
        console.log(application)
        successMsg += "Application successful!"
    } catch (error) {
        errorMsg += "Application failed.";
        console.error("Error when applying", error);
    }

    res.render("pet-profile", {
        petFound: pet,
        errorMsg: errorMsg,
        successMsg: successMsg,
    });
};

exports.showPetListingForm = async (req, res) => {
    return res.render("pet-create-listing", {
        errorMsg: "",
        successMsg: "",
        petPersonalities,
        formData: null,
    });
};

exports.viewListings = async (req, res) => {
    const uid = req.session.user?._id ?? null;
    const pets = await listing.getMyPets(uid);
    res.render("pet-listings", { pets });
};

exports.createPetListing = async (req, res) => {
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

    let errorMsg = "";
    let successMsg = "";

    let missingFields = [];

    if (!type) missingFields.push("Type");
    if (!breed) missingFields.push("Breed");
    if (!name) missingFields.push("Name");
    if (!gender) missingFields.push("Gender");
    if (!desc) missingFields.push("Description");
    if (!dob) missingFields.push("Date of Birth");

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
        pid: null,
        uid: req.session.user?._id ?? null,
    };

    try {
        await listing.createPetData(newPet);
        successMsg = "Listing created successfully!";

        // Clear form data on success
        return res.render("pet-create-listing", {
            errorMsg: "",
            successMsg: successMsg,
            petPersonalities,
            formData: null, // Clear form
        });
    } catch (error) {
        errorMsg = "Error creating pet listing! Please try again.";
        console.error("Error creating pet listing:", error);

        return res.render("pet-create-listing", {
            errorMsg: errorMsg,
            successMsg: "",
            petPersonalities,
            formData: req.body, // Send back data to repopulate form
        });
    }
};
