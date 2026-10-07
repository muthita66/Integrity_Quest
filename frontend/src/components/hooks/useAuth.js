import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register, getDepartments } from "../services/authService";
import { getFaculties } from "../services/masterService";

const initialLoginData = {
    email: "",
    password: "",
};

const initialRegisterData = {
    // ข้อมูลบัญชี (ใช้ร่วมกัน)
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    faculty: "",

    // นักเรียน
    age: "",
    major: "",
    year: "",

    // อาจารย์
    department: "",
    position: "",
    inviteCode: "",
    studentGroups: [], // กลุ่มนักเรียนที่ดูแล: [{ faculty, major, year, note }]
};

export default function useAuth() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState("student"); // "student" | "teacher"

    const [popup, setPopup] = useState({
        show: false,
        type: "",
        message: "",
    });

    const [faculties, setFaculties] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [filteredMajors, setFilteredMajors] = useState([]);

    const [loginData, setLoginData] = useState(initialLoginData);
    const [registerData, setRegisterData] = useState(initialRegisterData);

    useEffect(() => {
        fetchFaculties();
        fetchDepartments();
    }, []);

    const fetchFaculties = async () => {
        try {
            const data = await getFaculties();
            setFaculties(data);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await getDepartments();
            setDepartments(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log(err);
        }
    };

    const showPopup = (type, message) => {
        setPopup({ show: true, type, message });
    };

    const handleLoginChange = (e) => {
        const { name, value } = e.target;

        setLoginData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;

        if (name === "faculty") {
            const selectedFaculty = faculties.find(
                (f) => f.faculty_id === Number(value)
            );

            setFilteredMajors(selectedFaculty?.majors || []);

            // เปลี่ยนคณะ → ล้างสาขา/ภาควิชาที่เลือกไว้
            setRegisterData((prev) => ({
                ...prev,
                faculty: value,
                major: "",
                department: "",
            }));
            return;
        }

        setRegisterData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // อัปเดตรายการกลุ่มนักเรียนที่อาจารย์ดูแล (เรียกจาก RegisterForm/StudentGroupsEditor)
    const updateStudentGroups = (groups) => {
        setRegisterData((prev) => ({ ...prev, studentGroups: groups }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await login({ ...loginData, role });

            localStorage.setItem("token", res.token);
            if (res.user) {
                localStorage.setItem("user", JSON.stringify(res.user));
            }

            if (res.streakReward?.justEarned) {
                sessionStorage.setItem(
                    "streakReward",
                    JSON.stringify(res.streakReward)
                );
            }

            const userRole = res.user?.role || res.role || role;
            const target = userRole === "teacher" ? "/teacher" : "/map";

            showPopup("success", "เข้าสู่ระบบสำเร็จ!");

            setTimeout(() => {
                navigate(target, { replace: true });
            }, 1000);
        } catch (err) {
            console.log(err);
            const msg = err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ!";
            showPopup("error", msg);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            showPopup("error", "รหัสผ่านไม่ตรงกัน!");
            return;
        }

        if (role === "teacher" && (registerData.studentGroups || []).length === 0) {
            showPopup("error", "กรุณาเพิ่มอย่างน้อย 1 กลุ่มนักเรียนที่จะดูแล");
            return;
        }

        const {
            confirmPassword,
            age,
            major,
            year,
            department,
            position,
            inviteCode,
            studentGroups,
            ...common
        } = registerData;

        const cleanedGroups = (studentGroups || []).map(
            ({ faculty, major: groupMajor, year: groupYear, note }) => ({
                faculty: faculty || null,
                major: groupMajor || null,
                year: groupYear || null,
                note: note?.trim() || null,
            })
        );

        const payload =
            role === "teacher"
                ? {
                    ...common,
                    role,
                    department,
                    position,
                    inviteCode,
                    studentGroups: cleanedGroups,
                }
                : { ...common, role, age, major, year };

        try {
            await register(payload);

            showPopup("success", "ลงทะเบียนสำเร็จ!");

            setTimeout(() => {
                setPopup({ show: false, type: "", message: "" });
                setRegisterData(initialRegisterData);
                setFilteredMajors([]);
                setIsLogin(true);
            }, 2000);
        } catch (err) {
            console.log("STATUS:", err.response?.status);
            console.log("BODY:", err.response?.data);
            showPopup("error", err.response?.data?.message || "ลงทะเบียนไม่สำเร็จ!");
        }
    };

    return {
        isLogin,
        setIsLogin,

        role,
        setRole,

        popup,
        setPopup,

        loginData,
        registerData,

        faculties,
        filteredMajors,
        departments,

        handleLoginChange,
        handleRegisterChange,
        handleLoginSubmit,
        handleRegisterSubmit,
        updateStudentGroups,
    };
}