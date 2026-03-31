function calculateScore(preferences = {}, pet = {}) {
    if (preferences.housingType === "HDB" && !pet.hdbApproved) {
        return { score: 0 };
    }

    let matches = 0;
    let total = 0;

    if (preferences.preferredAnimal?.length) {
        total++;
        const preferred = preferences.preferredAnimal.map(a => a.toLowerCase());
        if (preferred.includes(pet.type?.toLowerCase())) matches++;
    }

    if (preferences.preferredTraits?.length) {
        total++;
        const petTraits = (pet.personality || []).map(t => t.toLowerCase());
        const userTraits = preferences.preferredTraits.map(t => t.toLowerCase());

        const matchCount = userTraits.filter(t => petTraits.includes(t)).length;

        matches += matchCount / userTraits.length;
    }

    if (preferences.activityLevel) {
        total++;
        if (pet.activityLevel === preferences.activityLevel) matches++;
    }

    if (preferences.experienceLevel) {
        total++;
        if (pet.experienceLevel === preferences.experienceLevel) matches++;
    }

    if (total === 0) return { score: null };

    return { score: Math.round((matches / total) * 100) };
}

module.exports = { calculateScore };