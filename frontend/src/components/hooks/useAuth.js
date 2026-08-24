import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";
import { getFaculties } from "../services/masterService";

export default function useAuth() {
    const navigate = useNavigate();

    const [isLogin, setIsLogin] = useState(true);

    const [popup, setPopup] = useState({
        show: false,
        type: "",
        message: "",
    });

    const [faculties, setFaculties] = useState([]);
    const [filteredMajors, setFilteredMajors] = useState([]);

    const [loginData, setLoginData] = useState({
        email: "",
        password: "",
    });

    const [registerData, setRegisterData] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        gender: "",
        age: "",
        faculty: "",
        major: "",
        year: "",
    });

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

    const handleLoginChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;

        const updatedData = {
            ...registerData,
            [name]: value,
        };

        setRegisterData(updatedData);

        if (name === "faculty") {
            const selectedFaculty = faculties.find(
                (f) => f.faculty_id === Number(value)
            );

            setFilteredMajors(selectedFaculty?.majors || []);

            setRegisterData({
                ...updatedData,
                major: "",
            });
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await login(loginData);

            localStorage.setItem("token", res.token);

            setPopup({
                show: true,
                type: "success",
                message: "เข้าสู่ระบบสำเร็จ!",
            });

            setTimeout(() => {
                navigate("/map");
            }, 1000);
        } catch (err) {
            console.log(err);

            setPopup({
                show: true,
                type: "error",
                message: "เข้าสู่ระบบไม่สำเร็จ!",
            });
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        try {
            await register(registerData);

            setPopup({
                show: true,
                type: "success",
                message: "ลงทะเบียนสำเร็จ!",
            });

            setTimeout(() => {
                setPopup({
                    show: false,
                    type: "",
                    message: "",
                });

                setIsLogin(true);
            }, 2000);
        } catch (err) {
            console.log(err);

            setPopup({
                show: true,
                type: "error",
                message: "ลงทะเบียนไม่สำเร็จ!",
            });
        }
    };

    return {
        isLogin,
        setIsLogin,

        popup,
        setPopup,

        loginData,
        registerData,

        faculties,
        filteredMajors,

        handleLoginChange,
        handleRegisterChange,
        handleLoginSubmit,
        handleRegisterSubmit,
    };
}