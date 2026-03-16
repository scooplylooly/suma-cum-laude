const fs = require("node:fs/promises");
const petPfFilePath = "data/pets-data.json";
const applyFilePath = "data/apply-for-pet-data.json";

exports.getAllPets = async () => {
    const jsonData = await fs.readFile(petPfFilePath, "utf-8");
    const data = JSON.parse(jsonData);
    return data;
};
