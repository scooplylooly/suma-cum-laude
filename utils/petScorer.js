// Maps pet personality traits to an activity level
function derivePetActivityLevel(personality = []) {
    const highTraits = ["active", "adventurous", "outgoing"];
    const lowTraits = ["relaxed", "cuddly", "sweet", "loving"];

    const traits = personality.map((t) => t.toLowerCase());
    const highCount = traits.filter((t) => highTraits.includes(t)).length;
    const lowCount = traits.filter((t) => lowTraits.includes(t)).length;

    if (highCount > lowCount) return "high";
    if (lowCount > highCount) return "low";
    return "medium";
}

// Maps pet type to an expected experience level
function derivePetExperienceLevel(type = "") {
    const beginnerPets = ["hamster", "other"];
    const experiencedPets = ["rabbit", "guinea pig", "bird"];

    if (beginnerPets.includes(type.toLowerCase())){
        return "beginner"
    }
    else if (experiencedPets.includes(type.toLowerCase())) {
        return "experienced"
    }
    else{
        return "intermediate"
    };
    
}

// Calculates a match score (0-100) between user preferences and a pet
// Returns { score, breakdown } where breakdown shows points earned per criterion
function calculateScore(preferences = {}, pet = {}) {
    const MAX_POINTS = {
        housing: 25,
        animalType: 25,
        traits: 25,
        activityLevel: 15,
        experienceLevel: 10,
    };

    let earned = {
        housing: 0,
        animalType: 0,
        traits: 0,
        activityLevel: 0,
        experienceLevel: 0,
    };

    // Housing: HDB users need hdbApproved pets; Condo/Landed have no restriction
    if (preferences.housingType) {
        if (preferences.housingType === "HDB") {
            if (pet.hdbApproved) {
                earned.housing = MAX_POINTS.housing
            }
        } else {
            // Condo or Landed — no housing restriction
            earned.housing = MAX_POINTS.housing;
        }
    }

    // Animal type: full points if pet type is in user's preferred animals
    if (preferences.preferredAnimal && preferences.preferredAnimal.length > 0) {
        const preferred = preferences.preferredAnimal.map((a) => a.toLowerCase());
        if (preferred.includes(pet.type?.toLowerCase())) {
            earned.animalType = MAX_POINTS.animalType;
        }
    }

    // Traits: proportional points based on how many preferred traits the pet has
    if (preferences.preferredTraits && preferences.preferredTraits.length > 0) {
        const petTraits = (pet.personality || []).map((t) => t.toLowerCase());
        const userTraits = preferences.preferredTraits.map((t) => t.toLowerCase());
        const matchCount = userTraits.filter((t) => petTraits.includes(t)).length;
        earned.traits = Math.round(
            (matchCount / userTraits.length) * MAX_POINTS.traits
        );
    }

    // Activity level: full points if pet activity level matches user's preference
    if (preferences.activityLevel) {
        const petActivity = derivePetActivityLevel(pet.personality);
        if (petActivity === preferences.activityLevel) {
            earned.activityLevel = MAX_POINTS.activityLevel;
        }
    }

    // Experience level: full points if pet experience requirement matches user's level
    if (preferences.experienceLevel) {
        const petExperience = derivePetExperienceLevel(pet.type);
        if (petExperience === preferences.experienceLevel) {
            earned.experienceLevel = MAX_POINTS.experienceLevel;
        }
    }

    // Only count criteria the user has actually set
    let totalPossible = 0;
    if (preferences.housingType) {
        totalPossible += MAX_POINTS.housing
    };
    if (preferences.preferredAnimal?.length > 0) {
        totalPossible += MAX_POINTS.animalType
    };
    if (preferences.preferredTraits?.length > 0) {
        totalPossible += MAX_POINTS.traits
    };
    if (preferences.activityLevel) {
        totalPossible += MAX_POINTS.activityLevel
    };
    if (preferences.experienceLevel) {
        totalPossible += MAX_POINTS.experienceLevel
    };

    // If user has set no preferences, return null (no score to show)
    if (totalPossible === 0) {
        return { score: null, breakdown: earned }
    };

    const totalEarned = Object.values(earned).reduce((a, b) => a + b, 0);
    const score = Math.round((totalEarned / totalPossible) * 100);

    return { score, breakdown: earned };
}

module.exports = { calculateScore };
