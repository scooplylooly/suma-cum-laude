const accountModel = require("../models/account-model");
const petModel = require("../models/pet-model");
const faqModel = require("../models/faq-model");

exports.showAdminPage = async (req, res) => {
    const user = req.session.user;
    const allApplications = await petModel.checkExistingApplications();
    const typeCounts = {};
    for (let app of allApplications) {
        if (app.petType) {
            typeCounts[app.petType] = (typeCounts[app.petType] || 0) + 1;
        }
    }
    let topPetTypes = [];
    for (let type in typeCounts) {
        topPetTypes.push({ type: type, count: typeCounts[type] });
    }
    topPetTypes.sort((a, b) => b.count - a.count);
    topPetTypes = topPetTypes.slice(0, 3);
    const totalPets = await petModel.countPets({});
    console.log("Total Pets: " + totalPets);
    const totalApplications = await petModel.countTotalApplications({});
    console.log("Total Applications: " + totalApplications);
    const pendingApplications = await petModel.countPendingApplications({
        status: "pending",
    });
    console.log("Total Pending Applications: " + pendingApplications);
    const totalUsers = await accountModel.countUsers({});
    console.log("Total Users: " + totalUsers);
    const totalFaqs = await faqModel.countFaqs({});
    console.log("Total FAQs: " + totalFaqs);
    const adoptionRateByType = await petModel.adoptionRateByType();
    if (!user) {
        return res.send(`
            <h1 style="color: red;">Unauthorized</h1>
            <p><b>You must be logged in to access this page. Redirecting...</b></p>

            <script>
                setTimeout(() => {
                    location.href = "/login"}, 3000);
            </script>
        `);
    } else if (user.role == "admin") {
        return res.render("admin-page", {
            user,
            totalPets,
            totalApplications,
            pendingApplications,
            totalFaqs,
            totalUsers,
            topPetTypes,
            adoptionRateByType
        });
    } else {
        return res.redirect("/adopt");
    }
};

exports.showIncomingListings = async (req, res) => {
    const pets = (await petModel.getAllPets()).reverse();
    let selectedStatus = "";
    res.render("admin-listings", { pets, selectedStatus });
};

exports.filterListings = async (req, res) => {
    let status = req.body.status;
    let selectedStatus = "";
    let pets;

    if (status === "approved") {
        pets = (await petModel.getAllPets())
            .reverse()
            .filter((pet) => pet.approved);
        selectedStatus = status;
    } else if (status === "pending") {
        pets = (await petModel.getAllPets())
            .reverse()
            .filter((pet) => !pet.approved);
        selectedStatus = status;
    } else {
        selectedStatus = "";
        pets = (await petModel.getAllPets()).reverse();
    }
    return res.render("admin-listings", {
        pets,
        selectedStatus,
    });
};

exports.confirmListingStatus = async (req, res) => {
    let pid = req.query.pid;
    let petFound = await petModel.findPetById(pid);
    let uid = petFound.uid;
    let ownerInfo = await accountModel.retrieveProfile(uid);
    petFound.ownerName = ownerInfo.userName;
    return res.render("admin-listing-status", { petFound });
};
exports.updateListingStatus = async (req, res) => {
    let action = req.body.action;
    let pid = req.body.pid;
    let petFound = await petModel.findPetById(pid);
    let uid = petFound.uid;
    let ownerInfo = await accountModel.retrieveProfile(uid);
    petFound.ownerName = ownerInfo.userName;
    let isApproved = action === "approve" ? true : false;
    if (action) {
        await petModel.updatePetApproval(pid, isApproved);
        console.log(`Listing ${isApproved} successfully`);
    }
    return res.redirect("/admin/listings");
};

exports.showUsers = async (req, res) => {
    let adminUserId = req.session.user._id;
    let users = await accountModel.getAllUsers();
    return res.render("admin-users", { users, selectedType: "", adminUserId });
};

exports.filterUsers = async (req, res) => {
    let userType = req.body.userType;
    let adminUserId = req.session.user._id;
    let selectedType = "";
    let users;

    if (userType) {
        users = (await accountModel.getAllUsers())
            .reverse()
            .filter((user) => user.role == userType);
        selectedType = userType;
    } else {
        selectedType = "";
        users = (await accountModel.getAllUsers()).reverse();
        selectedType = userType;
    }
    return res.render("admin-users", {
        users,
        selectedType,
        adminUserId,
    });
};
exports.displayDeleteUser = async (req, res) => {
    let uid = req.query.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveProfile(uid);
    return res.render("admin-delete-user", { userInfo, error: "" });
};
exports.deleteUser = async (req, res) => {
    let uid = req.body.uid;
    console.log("UID FOUND:", uid);
    let userInfo = await accountModel.retrieveProfile(uid);
    let error = "";
    try {
        let pets = await petModel.getMyPets(uid);
        for (let pet of pets) {
            await petModel.deletePetData(pet._id, pet.img);
        }
        let applications = await petModel.findApplicationbyUID(uid);
        for (let app of applications) {
            await petModel.deleteApplication(app._id);
        }
        await accountModel.deleteListerByUid(uid);
        await accountModel.deleteUser(uid);

        console.log("user deleted!");
        return res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        error = "Error deleting user";
    }
    return res.render("admin-delete-user", { userInfo, error });
};

exports.displayUpdateUser = async (req, res) => {
    // shows update details form for user
    // retrieves profile details for user from database
    // and is put as default value for form fields
    const uid = req.query.uid;
    const originalDetails = await accountModel.retrieveProfile(uid);
    console.log("EDITING USER:", originalDetails.userName);
    const userName = originalDetails.userName;
    const email = originalDetails.email;
    const DOB = originalDetails.DOB;
    const role = originalDetails.role;
    const securityKey = originalDetails.securityKey;
    return res.render("admin-user-update", {
        userName,
        email,
        DOB,
        role,
        securityKey,
        password: "",
        password2: "",
        errors: [],
        uid,
    });
};
exports.updateUser = async (req, res) => {
    const uid = req.body.uid;
    const originalDetails = await accountModel.retrieveProfile(uid);
    const userName =
        (req.body.userName ?? "").trim() || originalDetails.userName;
    const email = (req.body.email ?? "").trim() || originalDetails.email;
    // note that password fields could be left empty if user does not key in values
    // passwords are not shown for security in update page
    const password =
        (req.body.password ?? "").trim()
    const password2 =
        (req.body.password2 ?? "").trim()
    const DOB = req.body.dob;
    const role = req.body.role;
    const securityKey =
        (req.body.securityKey ?? "").trim() || originalDetails.securityKey;
    console.log(role);

    let errors = [];
    console.log("Editing user:", originalDetails.userName);
    if (
        userName !== originalDetails.userName &&
        (await accountModel.checkUserExist(userName))
    ) {
        errors.push("Username already exists");
    }

    if (password || password2) {
        if (password !== password2) {
            errors.push("Passwords do not match");
        } else {
            const checkSecure = accountModel.securePassword(password);
            if (checkSecure !== true) {
                for (let error of checkSecure) {
                    errors.push(error);
                }
            }
        }
    }

    if (errors.length > 0) {
        return res.render("admin-user-update", {
            userName,
            email,
            DOB,
            role,
            securityKey,
            password: "",
            password2: "",
            errors,
            uid,
        });
    }

    try {
        // updates fields of user profile in database
        await accountModel.updateDetails(
            uid,
            userName,
            email,
            DOB,
            password ? password : undefined,
            securityKey,
            role,
        );
        console.log("Updated details successfully");
        // updates username variable in session; becauses session captures old snapshot with outdated details
        return res.redirect("/admin/admin-page");
    } catch (error) {
        console.error("Failed to update user details, error:", error);
        return res.render("admin-user-update", {
            errors: ["Failed to update user details. Please try again."],
    })};
};

exports.showListerApps = async (req, res) => {
    const pending = await accountModel.getPendingListers();
    res.render("admin-lister-status", { pending });
};

exports.approveLister = async (req, res) => {
    const lid = req.query.lid;
    try {
        const application = await accountModel.retrieveLister(lid);
        await accountModel.approveLister(lid);
        await accountModel.updateUserRole(application.uid, "lister");

        return res.redirect("/admin/lister-status");
    } catch (err) {
        console.error("Error approving listers:", err);
        return res.redirect("/admin/lister-status");
    }
};
exports.rejectLister = async (req, res) => {
    const uid = req.query.uid;
    await accountModel.rejectLister(uid);
    res.redirect("/admin/lister-status");
};

exports.confirmListerStatus = async (req, res) => {
    const pending = await accountModel.getPendingListers();
    res.render("admin-lister-status", { pending });
};

exports.updateListerStatus = async (req, res) => {
    const listers = req.body.listers ?? [];
    try {
        for (const lister of listers) {
            const { lid, uid, statusL } = lister;

            if (statusL === "approved") {
                await accountModel.approveLister(lid);
                await accountModel.updateUserRole(uid, "lister");
            } else if (statusL === "rejected") {
                await accountModel.rejectLister(lid);
            }
        }
        return res.redirect("/admin/lister");
    } catch (err) {
        console.log(err);
        res.redirect("/admin/admin-page");
    }
};

exports.showListerListings = async (req, res) => {
    try {
        const listers = await accountModel.getAllListers();
        const adminUserId = req.session.user._id;

        return res.render("admin-lister", {
            listers,
            adminUserId,
        });
    } catch (err) {
        console.error("Error fetching listers:", err);
        return res.render("admin-lister", {
            listers: [],
            adminUserId: req.session.user._id,
        });
    }
};

exports.displayDeleteLister = async (req, res) => {
    let lid = req.query.lid;
    console.log("LID FOUND:", lid);
    const listerInfo = await accountModel.retrieveLister(lid);

    if (!listerInfo) {
        return res.redirect("/admin/lister");
    }
    return res.render("admin-delete-lister", { listerInfo, error: "" });
};
exports.adminDeleteLister = async (req, res) => {
    const lid = req.query.lid;
    const uid = req.query.uid;

    try {
        await accountModel.deleteLister(lid);
        if (uid) {
            await accountModel.updateUserRole(uid, "user");
        }
        let applications = await petModel.findApplicationbyUID(uid);
        for (let app of applications) {
            await petModel.deleteApplication(app._id);
        }
        let pets = await petModel.getMyPets(uid);
        for (let pet of pets) {
            await petModel.deletePetData(pet._id, pet.img);
        }

        return res.redirect("/admin/lister");
    } catch (err) {
        console.error("Could not delete lister:", err);
        return res.redirect("/admin/lister");
    }
};

exports.displayUpdateLister = async (req, res) => {
    // shows update details form for user
    // retrieves profile details for user from database
    // and is put as default value for form fields
    const lid = req.query.lid;
    const originalDetails = await accountModel.retrieveLister(lid);
    const userName = originalDetails.userName;

    if (!originalDetails || originalDetails.statusL !== "approved") {
        console.log("Lister not found or approved:", lid);
        return res.redirect("/admin/lister");
    }

    console.log("EDITING USER:", originalDetails.userName);
    const address = originalDetails.address;
    const contactNo = originalDetails.contactNo;
    const currentPets = originalDetails.pets;
    const experience = originalDetails.experience;
    const role = originalDetails.role;
    return res.render("admin-lister-update", {
        userName,
        address,
        contactNo,
        currentPets,
        experience,
        role,
        errors: [],
        lid,
    });
};
exports.updateLister = async (req, res) => {
    const lid = req.body.lid;
    const originalDetails = await accountModel.retrieveLister(lid);
    const address = (req.body.address ?? "").trim() || originalDetails.address;
    const contactNo =
        (req.body.contactNo ?? "").trim() || originalDetails.contactNo;
    const pets = (req.body.pets ?? "").trim() || originalDetails.pets;
    const experience =
        (req.body.experience ?? "").trim() || originalDetails.experience;
    const role = req.body.role;
    console.log(role);
    console.log("Editing lister:", originalDetails.userName);

    try {
        // updates fields of user profile in database
        await accountModel.updateLister(
            lid,
            address,
            contactNo,
            pets,
            experience,
        );
        await accountModel.updateUserRole(originalDetails.uid, role);

        console.log("Updated details successfully");
        return res.redirect("/admin/lister");
    } catch (error) {
        console.error("Failed to update lister details, error:", error);
    }
};
exports.viewUserApplications = async (req, res) => {
    const uid = req.query.uid;
    const applications = await petModel.findApplicationbyUID(uid);
    console.log("APPLICATIONS FOUND:", applications);
    const user = await accountModel.retrieveProfile(uid);
    console.log("USER FOUND:", user);
    return res.render("admin-application-status", { applications, user });
};
