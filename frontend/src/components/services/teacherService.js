// ============================================================
// Teacher API (หน้าแดชบอร์ดอาจารย์)
// ============================================================

const API_URL = "http://localhost:5000/api";

const request = async (path) => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}${path}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.message || "เกิดข้อผิดพลาด");
        error.status = response.status;
        throw error;
    }

    return data;
};

// scope: "faculty" (คณะของฉัน) | "all" (ทั้งหมด)
export const getTeacherDashboard = async (scope = "faculty") =>
    (await request(`/teacher/dashboard?scope=${scope}`)).data;

// รายละเอียดรายบท/รายด่านของนิสิต 1 คน
export const getStudentProgress = async (userId) =>
    (await request(`/teacher/students/${userId}/progress`)).data;

// คำตอบของนิสิตในรอบล่าสุดของด่านนั้น
export const getLevelPlayDetail = async (userId, levelId) =>
    (await request(`/teacher/students/${userId}/levels/${levelId}/latest`)).data;