const fs = require("node:fs/promises");
const petPfFilePath = "data/pets-data.json";
const applyFilePath = "data/apply-for-pet-data.json";

exports.getAllPets = async () => {
    try {
        const jsonData = await fs.readFile(petPfFilePath, "utf-8");
        const data = JSON.parse(jsonData);
        return data;
    } catch (error) {
        console.error("Error reading pet-data.json:", error);
    }
};

exports.writeApplyInfo = async (application) => {
    try {
        const jsonData = await fs.readFile(applyFilePath, "utf-8");
        let data = JSON.parse(jsonData);
        console.log(data);
        data.push(application);
        const jData = JSON.stringify(data, null, 2);
        await fs.writeFile(applyFilePath, jData);
    } catch (error) {
        console.error("Error writing to apply-for-pet-data.json:", error);
    }
};
