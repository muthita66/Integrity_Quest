import { Navigate, Outlet } from "react-router-dom";

// อ่าน payload ของ JWT (ไม่ได้ตรวจลายเซ็น — backend ตรวจอีกชั้นอยู่แล้ว)
const decodeToken = (token) => {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
};

const clearSession = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
};

const homeForRole = (role) => (role === "teacher" ? "/teacher" : "/map");

// กันการเข้าหน้าโดยตรงผ่าน URL: ต้องเข้าสู่ระบบจากหน้า login ก่อน
// roles: role ที่อนุญาตให้เข้า route ชุดนี้ (ไม่ระบุ = ทุก role ที่ login แล้ว)
export default function RequireAuth({ roles }) {
    const token = localStorage.getItem("token");
    const payload = token ? decodeToken(token) : null;
    const expired = payload?.exp && payload.exp * 1000 <= Date.now();

    if (!payload || expired) {
        clearSession();
        return <Navigate to="/" replace />;
    }

    if (roles && !roles.includes(payload.role)) {
        return <Navigate to={homeForRole(payload.role)} replace />;
    }

    return <Outlet />;
}
