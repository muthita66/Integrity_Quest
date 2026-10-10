import { BASE_URL } from "../../config";
import axios from "axios";

const API_URL = `${BASE_URL}/api/master`;

export const getFaculties = async () => {
    const res = await axios.get(`${API_URL}/faculties`);
    return res.data;
};