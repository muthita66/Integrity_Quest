// ============================================================
// Profile API (ข้อมูลผู้ใช้ที่ login อยู่)
// ============================================================

const API_URL = "http://localhost:5000/api";

const request = async (path, { method = "GET", body } = {}) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "เกิดข้อผิดพลาด");
        error.status = response.status;
        throw error;
    }

    return data;
};

export const getProfile = async () => (await request("/profile")).data;

export const getOverview = async () =>
    (await request("/profile/overview")).data;

export const getDailyQuests = async () =>
    (await request("/profile/daily-quests")).data;

export const getLeaderboard = async () =>
    (await request("/profile/leaderboard")).data;

// { pre_test_done, post_test_done, post_test_unlocked, units_completed, units_total }
export const getTestStatus = async () =>
    (await request("/profile/test-status")).data;

export const updateProfile = async (profile) =>
    request("/profile", { method: "PUT", body: profile });

export const changePassword = async ({ currentPassword, newPassword }) =>
    request("/profile/password", {
        method: "PUT",
        body: { currentPassword, newPassword },
    });

export const getDepartments = async () => {
    const response = await fetch(`${API_URL}/auth/departments`);
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};