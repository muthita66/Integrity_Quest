import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaFire,
    FaUserCircle,
    FaSignOutAlt,
    FaTrophy,
    FaBook,
    FaCog,
} from "react-icons/fa";

import elephant from "../../assets/elephant.png";
import { getProfile } from "../services/profileService";

import "../../styles/MapPage/header.css";


function Header() {

    const navigate = useNavigate();

    const [showMenu, setShowMenu] = useState(false);

    const [profile, setProfile] = useState(null);


    // ==============================
    // โหลดข้อมูลผู้ใช้จาก DB
    // ==============================

    useEffect(() => {
        let isMounted = true;

        getProfile()
            .then((data) => {
                if (isMounted) setProfile(data);
            })
            .catch((error) => {
                console.error("Load profile error:", error);

                // token หมดอายุ / ไม่ได้ login → กลับหน้า login
                if (error.status === 401 || error.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [navigate]);


    const displayName = profile
        ? `${profile.firstName} ${profile.lastName}`.trim() ||
        profile.username
        : "...";

    const streak = profile?.stats?.current_streak ?? 0;
    const score = profile?.stats?.integrity_points ?? 0;
    const progress = profile?.stats?.progress_percent ?? 0;


    // ==============================
    // Logout
    // ==============================

    const handleLogout = async () => {

        try {

            const token = localStorage.getItem("token");


            // ไม่มี Token
            if (!token) {

                localStorage.removeItem("user");

                navigate("/");

                return;
            }


            // ==============================
            // เรียก API Logout
            // ==============================

            const response = await fetch(
                "http://localhost:5000/api/auth/logout",
                {
                    method: "POST",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            const data = await response.json();


            if (!response.ok) {
                throw new Error(
                    data.message || "Logout failed"
                );
            }


            // ==============================
            // ลบข้อมูล Login
            // ==============================

            localStorage.removeItem("token");

            localStorage.removeItem("user");


            // ปิด Dropdown
            setShowMenu(false);


            // ==============================
            // กลับหน้า Auth
            // ==============================

            navigate("/");


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            // ถึง API Error
            // ก็ลบ Login ฝั่ง Client
            localStorage.removeItem("token");

            localStorage.removeItem("user");


            setShowMenu(false);

            navigate("/");
        }
    };


    return (
        <div className="header">


            {/* =========================
                Logo
            ========================= */}

            <div className="logo">

                <img
                    src={elephant}
                    alt="Elephant"
                    style={{
                        width: "60px",
                        height: "auto",
                    }}
                />

                <span className="logo-text no-sarabun">
                    INTEGRITY QUEST
                </span>

            </div>



            {/* =========================
                Header Right
            ========================= */}

            <div className="header-right">


                {/* =========================
                    Streak
                ========================= */}

                <div className="sarabun-bold">

                    <FaFire
                        style={{
                            color: "#f97316",
                            filter:
                                "drop-shadow(0 0 4px rgba(249,115,22,0.4))",
                        }}
                    />

                    <span>
                        {streak} Day Streak
                    </span>

                </div>



                {/* =========================
                    User
                ========================= */}

                <div
                    className="user-dropdown"
                    onClick={() =>
                        setShowMenu(!showMenu)
                    }
                >

                    <FaUserCircle
                        style={{
                            color: "#38bdf8",
                            fontSize: "24px",
                        }}
                    />

                    <span>
                        {displayName}
                    </span>



                    {/* =========================
                        Dropdown
                    ========================= */}

                    {showMenu && (

                        <div
                            className="dropdown-menu"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >


                            {/* Name → หน้าความคืบหน้า */}

                            <div
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                title="ดูความคืบหน้าทั้งหมด"
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/progress");
                                }}
                            >

                                <FaUserCircle />

                                <span>
                                    {displayName}
                                </span>

                            </div>



                            {/* Score */}

                            <div className="dropdown-item">

                                <FaTrophy />

                                <span>
                                    Score : {score}
                                </span>

                            </div>



                            {/* Streak */}

                            <div className="dropdown-item">

                                <FaFire />

                                <span>
                                    Streak : {streak} {streak === 1 ? "Day" : "Days"}
                                </span>

                            </div>



                            {/* Progress */}

                            <div className="dropdown-item">

                                <FaBook />

                                <span>
                                    Progress : {progress}%
                                </span>

                            </div>



                            {/* Settings */}

                            <div
                                className="dropdown-item"
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    setShowMenu(false);
                                    navigate("/settings");
                                }}
                            >

                                <FaCog />

                                <span>
                                    ตั้งค่าบัญชี
                                </span>

                            </div>

                        </div>

                    )}

                </div>



                {/* =========================
                    Logout
                ========================= */}

                <button
                    className="logout-button sarabun-bold"
                    onClick={handleLogout}
                >

                    <FaSignOutAlt />

                    <span>
                        Logout
                    </span>

                </button>


            </div>

        </div>
    );
}


export default Header;