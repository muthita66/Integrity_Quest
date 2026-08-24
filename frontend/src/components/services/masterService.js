import axios from "axios";

const API_URL = "http://localhost:5000/api/master";

export const getFaculties = async () => {
    const res = await axios.get(`${API_URL}/faculties`);
    return res.data;
};