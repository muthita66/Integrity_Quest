import axios from "axios";

const API_URL = "http://localhost:5000/api/game-play";

const authConfig = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนเริ่มเกม");
    }

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const startGame = async (levelId) => {
    const response = await axios.post(`${API_URL}/start`, { level_id: levelId }, authConfig());
    return response.data;
};

export const submitAnswer = async ({ playId, questionId, choiceId }) => {
    const response = await axios.post(
        `${API_URL}/answer`,
        { play_id: playId, question_id: questionId, choice_id: choiceId },
        authConfig()
    );
    return response.data;
};

export const completeGame = async (playId) => {
    const response = await axios.post(`${API_URL}/complete`, { play_id: playId }, authConfig());
    return response.data;
};
