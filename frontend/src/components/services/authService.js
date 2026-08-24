import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export const login = async (data) => {
    const res = await axios.post(`${API_URL}/login`, data);
    return res.data;
};

export const register = async (data) => {
    const res = await axios.post(`${API_URL}/register`, data);
    return res.data;
};