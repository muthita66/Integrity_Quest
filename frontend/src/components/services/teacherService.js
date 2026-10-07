const API_URL = "http://localhost:5000/api";

const request = async (path, options = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {}),
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "เกิดข้อผิดพลาด");
        error.status = response.status;
        throw error;
    }

    return data;
};

export const getTeacherDashboard = async (scope) =>
    (await request(`/teacher/dashboard${scope ? `?scope=${scope}` : ""}`)).data;

export const getStudentProgress = async (userId) =>
    (await request(`/teacher/students/${userId}/progress`)).data;

export const getLevelPlayDetail = async (userId, levelId) =>
    (await request(`/teacher/students/${userId}/levels/${levelId}/latest`)).data;

export const addTeacherGroup = async (payload) =>
    (
        await request("/teacher/groups", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    ).data;

export const deleteTeacherGroup = async (groupId) =>
    request(`/teacher/groups/${groupId}`, { method: "DELETE" });

export const deleteStudent = async (userId) =>
    request(`/teacher/students/${userId}`, { method: "DELETE" });