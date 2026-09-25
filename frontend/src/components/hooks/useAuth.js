import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";
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
    const [filteredMajors, setFilteredMajors] = useState([]);

    const [loginData, setLoginData] = useState(initialLoginData);
    const [registerData, setRegisterData] = useState(initialRegisterData);

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            const data = await getFaculties();
            setFaculties(data);
        } catch (err) {
            console.log(err);
        }
    };

    // ภาควิชาทั้งหมด ดึงจาก faculties (ถ้า API ส่ง faculty.departments มาด้วย)
    // ถ้า backend มี API ภาควิชาแยก ให้เปลี่ยนเป็น state + fetch แทน
    const departments = useMemo(
        () =>
            faculties.flatMap((f) =>
                (f.departments || []).map((d) => ({
                    ...d,
                    faculty_id: d.faculty_id ?? f.faculty_id,
                }))
            ),
        [faculties]
    );

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

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await login({ ...loginData, role });

            localStorage.setItem("token", res.token);
            if (res.user) {
                localStorage.setItem("user", JSON.stringify(res.user));
            }

            // ใช้ role จาก backend เป็นหลัก (กันคนเลือกแท็บผิด)
            // ถ้า backend ไม่ส่งมา ค่อยใช้แท็บที่เลือก
            const userRole = res.user?.role || res.role || role;
            const target = userRole === "teacher" ? "/teacher" : "/map";

            showPopup("success", "เข้าสู่ระบบสำเร็จ!");

            setTimeout(() => {
                navigate(target, { replace: true });
            }, 1000);
        } catch (err) {
            console.log(err);
            showPopup("error", "เข้าสู่ระบบไม่สำเร็จ!");
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        if (registerData.password !== registerData.confirmPassword) {
            showPopup("error", "รหัสผ่านไม่ตรงกัน!");
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
            ...common
        } = registerData;

        // ส่งเฉพาะช่องที่ตรงกับ role
        const payload =
            role === "teacher"
                ? { ...common, role, department, position, inviteCode }
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
            console.log(err);
            showPopup("error", "ลงทะเบียนไม่สำเร็จ!");
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
    };
}