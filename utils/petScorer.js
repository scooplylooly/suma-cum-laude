const weights = {
    preferredAnimal: 0.4,
    preferredTraits: 0.3,
    activityLevel: 0.2,
    experienceLevel: 0.1
};

function calculateScore(preferences = {}, pet = {}) {
    if (preferences.housingType === "HDB" && !pet.hdbApproved) {
        return { score: 0 };
    }

    let earned = 0;
    let possible = 0;

    if (preferences.preferredAnimal?.length) {
        possible += weights.preferredAnimal;
        const preferred = preferences.preferredAnimal.map(a => a.toLowerCase());
        if (preferred.includes(pet.type?.toLowerCase())) earned += weights.preferredAnimal;
    }

    if (preferences.preferredTraits?.length) {
        possible += weights.preferredTraits;
        const petTraits = (pet.personality || []).map(t => t.toLowerCase());
        const userTraits = preferences.preferredTraits.map(t => t.toLowerCase());

        const matchCount = userTraits.filter(t => petTraits.includes(t)).length;

        earned += (matchCount / userTraits.length) * weights.preferredTraits;
    }

    if (preferences.activityLevel) {
        possible += weights.activityLevel;
        if (pet.activityLevel === preferences.activityLevel) earned += weights.activityLevel;
    }

    if (preferences.experienceLevel) {
        possible += weights.experienceLevel;
        if (pet.experienceLevel === preferences.experienceLevel) earned += weights.experienceLevel;
    }

    if (possible === 0) return { score: null };

    return { score: Math.round((earned / possible) * 100) };
}

module.exports = { calculateScore };
