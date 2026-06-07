import { getUnitContent } from "../services/unitContent.service.js"

const getUnitContentByUnit = async (req, res) => {
    try {
        const { unitId } = req.params;
        const contents = await getUnitContent(unitId);
        res.status(200).json(contents);
    } catch (error) {
        console.error("Error fetching unit content:", error);
        res.status(500).json({ message: "Error fetching unit content" });
    }
};
export default getUnitContentByUnit;