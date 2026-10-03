// ============================================================
// Teacher API (หน้าแดชบอร์ดอาจารย์)
// ============================================================

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

// scope: "all" (นิสิตทั้งหมด) | "group:<group_id>" (กลุ่มที่ดูแล)
// ไม่ส่ง scope มา = ให้ backend เลือกค่าเริ่มต้นเอง (กลุ่มแรกของอาจารย์)
export const getTeacherDashboard = async (scope) =>
    (await request(`/teacher/dashboard${scope ? `?scope=${scope}` : ""}`)).data;

// รายละเอียดรายบท/รายด่านของนิสิต 1 คน
export const getStudentProgress = async (userId) =>
    (await request(`/teacher/students/${userId}/progress`)).data;

// คำตอบของนิสิตในรอบล่าสุดของด่านนั้น
export const getLevelPlayDetail = async (userId, levelId) =>
    (await request(`/teacher/students/${userId}/levels/${levelId}/latest`)).data;

// เพิ่มกลุ่มนักเรียนที่อาจารย์ดูแล (ปุ่ม "+ เพิ่มกลุ่ม" บนแดชบอร์ด)
export const addTeacherGroup = async (payload) =>
    (
        await request("/teacher/groups", {
            method: "POST",
            body: JSON.stringify(payload),
        })
    ).data;

// ลบกลุ่มนักเรียนที่อาจารย์ดูแล (ปุ่มสามจุด → "ลบกลุ่มนี้")
export const deleteTeacherGroup = async (groupId) =>
    request(`/teacher/groups/${groupId}`, { method: "DELETE" });