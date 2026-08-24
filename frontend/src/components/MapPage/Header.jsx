import { useState } from "react";
import {
    FaFire,
    FaUserCircle,
    FaSignOutAlt,
    FaTrophy,
    FaBook,
} from "react-icons/fa";

import elephant from "../../assets/elephant.png";

function Header() {
    const [showMenu, setShowMenu] = useState(false);

    const handleLogout = () => {
        console.log("Logout");
    };

    return (
        <>
            <style>{`
                .user-dropdown {
                    position: relative;
                    cursor: pointer;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 60px;
                    right: 0;

                    width: 240px;

                    background: white;
                    border-radius: 16px;

                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);

                    overflow: hidden;
                    z-index: 9999;

                    color: #333;
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;

                    padding: 14px 16px;
                    cursor: pointer;

                    transition: 0.2s;
                }

                .dropdown-item:hover {
                    background: #f5f5f5;
                }

                .logout {
                    color: #ef4444;
                    font-weight: 600;
                }

                .dropdown-menu hr {
                    border: none;
                    border-top: 1px solid #ddd;
                    margin: 0;
                }

                .logo-text {
    font-size: 3rem;
    font-weight: 900;

    background: linear-gradient(
        180deg,
        #ffffff,
        #d8b4fe,
        #a78bfa,
        #7c3aed
    );

    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    -webkit-text-stroke: 2px #312e81;

    text-shadow:
        0 0 8px #c084fc,
        0 0 18px #a855f7,
        0 0 30px #9333ea;
}
                }
            `}</style>

            <div className="header">
                <div className="logo">
                    <img
                        src={elephant}
                        alt="Elephant"
                        style={{
                            width: "60px",
                            height: "auto",
                        }}
                    />

                    <span className="logo-text">
                        INTEGRITY QUEST
                    </span>
                </div>

                <div className="header-right">
                    <div>
                        <FaFire
                            style={{
                                color: "#f97316",
                                filter:
                                    "drop-shadow(0 0 4px rgba(249,115,22,0.4))",
                            }}
                        />
                        <span>7 Day Streak</span>
                    </div>

                    <div
                        className="user-dropdown"
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <FaUserCircle
                            style={{ color: "#38bdf8" }}
                        />
                        <span>Student Name</span>

                        {showMenu && (
                            <div className="dropdown-menu">
                                <div className="dropdown-item">
                                    <FaUserCircle />
                                    <span>Student Name</span>
                                </div>

                                <div className="dropdown-item">
                                    <FaTrophy />
                                    <span>Score : 2324</span>
                                </div>

                                <div className="dropdown-item">
                                    <FaFire />
                                    <span>Streak : 7 Days</span>
                                </div>

                                <div className="dropdown-item">
                                    <FaBook />
                                    <span>Progress : 60%</span>
                                </div>

                                <hr />

                                <div
                                    className="dropdown-item logout"
                                    onClick={handleLogout}
                                >
                                    <FaSignOutAlt />
                                    <span>Sign Out</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;