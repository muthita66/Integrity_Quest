import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../MapPage/Header";
import UnitNode from "../MapPage/GameMap/UnitNode";
import DailyQuest from "../MapPage/Sidebar/DailyQuest";
import Leaderboard from "../MapPage/Sidebar/Leaderboard";
import PrePost from "../MapPage/Sidebar/PrePost";
import units from "../MapPage/GameMap/Unitdata";
import bg from "../../assets/bg_game.png";
import Chest from "../MapPage/GameMap/Chest";
import FloatingStonePath from "../MapPage/GameMap/FloatingStonePath";

const API_BASE_URL = "http://localhost:5000";

function MapPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const [progressUnits, setProgressUnits] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [progressError, setProgressError] = useState("");

    useEffect(() => {
        console.log("location.state:", location.state);

        if (location.state?.preTestJustCompleted) {
            alert("ทำ Pre-Test เรียบร้อยแล้ว!");
            navigate(location.pathname, {
                replace: true,
                state: {},
            });
        }
    }, [
        location.state,
        location.pathname,
        navigate,
    ]);

    useEffect(() => {
        let isMounted = true;

        const fetchUserProgress = async () => {
            try {
                setLoadingProgress(true);
                setProgressError("");

                const token =
                    localStorage.getItem("token");

                if (!token) {
                    throw new Error(
                        "ไม่พบ Token กรุณาเข้าสู่ระบบก่อน"
                    );
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/user-progress`,
                    {
                        method: "GET",
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "ไม่สามารถโหลด Progress ได้"
                    );
                }

                if (isMounted) {
                    setProgressUnits(
                        Array.isArray(data.data)
                            ? data.data
                            : []
                    );
                }
            } catch (error) {
                console.error(
                    "Get User Progress Error:",
                    error
                );

                if (isMounted) {
                    setProgressError(
                        error.message ||
                        "ไม่สามารถโหลด Progress ได้"
                    );
                    setProgressUnits([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingProgress(false);
                }
            }
        };

        fetchUserProgress();

        return () => {
            isMounted = false;
        };
    }, []);

    const progressByUnitId = useMemo(() => {
        return new Map(
            progressUnits.map((unit) => [
                Number(unit.unit_id),
                unit,
            ])
        );
    }, [progressUnits]);

    /*
     * API /api/user-progress ส่งเฉพาะ Unit ที่ is_active = true
     * ดังนั้นเมื่อโหลดสำเร็จ เราใช้ข้อมูลจาก API เป็นตัวกำหนด
     * ว่า Unit ใดจะแสดงบน Map
     */
    const visibleUnits = useMemo(() => {
        if (loadingProgress) {
            return units;
        }

        return units.filter((unit) =>
            progressByUnitId.has(
                Number(unit.id)
            )
        );
    }, [
        loadingProgress,
        progressByUnitId,
    ]);

    const getUnitProgress = (unitId) => {
        return (
            progressByUnitId.get(
                Number(unitId)
            ) || null
        );
    };

    const isUnitLocked = (unitId) => {
        const progress =
            getUnitProgress(unitId);

        /*
         * ระหว่าง Loading ให้ยังไม่ตัดสินจากข้อมูล
         * แต่จะกันการกดไว้จนกว่า API จะตอบกลับ
         */
        if (loadingProgress) {
            return true;
        }

        /*
         * ถ้าไม่มี Progress:
         * ถือว่า Locked เพื่อไม่ให้ Frontend
         * เปิด Unit ที่ Backend ยังไม่ได้ Unlock
         */
        if (!progress) {
            return true;
        }

        return progress.is_locked === true;
    };

    /*
     * Unit ที่ "เล่นแล้ว" = completion_percentage > 0
     *
     * ตัวอย่าง:
     *
     * Unit 1 = 100% -> สี
     * Unit 2 = 100% -> สี
     * Unit 3 = 0%   -> เทา
     * Unit 4 = LOCKED -> เทา
     */
    const hasPlayedUnit = (unitId) => {
        const progress =
            getUnitProgress(unitId);

        if (!progress) {
            return false;
        }

        return (
            Number(
                progress.completion_percentage || 0
            ) > 0
        );
    };

    const handleLockedUnitClick = (
        event,
        unitId
    ) => {
        if (isUnitLocked(unitId)) {
            event.preventDefault();
            event.stopPropagation();

            alert(
                "Unit นี้ยังไม่ปลดล็อก\nกรุณาผ่าน Unit ก่อนหน้าก่อน"
            );
        }
    };

    return (
        <div
            className="map-page"
            style={{
                background:
                    `linear-gradient(
                        rgba(255, 255, 255, 0.2),
                        rgba(255, 255, 255, 0.3)
                    ), url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                height: "100vh",
                fontFamily:
                    "'Prompt', sans-serif",
            }}
        >
            <Header />

            <div
                className="content"
                style={{
                    display: "flex",
                    flex: 1,
                    overflow: "hidden",
                }}
            >
                {/* Game Map Board */}
                <div
                    className="game-map"
                    style={{
                        position: "relative",
                        flex: 1,
                    }}
                >
                    <FloatingStonePath
                        progressUnits={progressUnits}
                        loading={loadingProgress}
                    />

                    {visibleUnits.map((unit) => {
                        const progress =
                            getUnitProgress(
                                unit.id
                            );

                        const locked =
                            isUnitLocked(
                                unit.id
                            );

                        const played =
                            hasPlayedUnit(
                                unit.id
                            );

                        /*
                         * 3 สถานะ:
                         * Locked                   -> เทาจาง
                         * ปลดล็อกแล้ว แต่ยังไม่เล่น -> สีปกติ + เรืองแสงสีทอง
                         * เล่นแล้ว                  -> สีปกติ
                         */
                        const isReadyToPlay =
                            !locked && !played;

                        const unitFilter = locked
                            ? "grayscale(1) opacity(0.55)"
                            : isReadyToPlay
                                ? "drop-shadow(0 0 14px rgba(255, 215, 0, 0.95)) drop-shadow(0 0 28px rgba(255, 190, 0, 0.6))"
                                : "none";

                        return (
                            <div
                                key={unit.id}
                                onClickCapture={(event) =>
                                    handleLockedUnitClick(
                                        event,
                                        unit.id
                                    )
                                }
                                style={{
                                    position:
                                        "absolute",
                                    left:
                                        unit.left,
                                    top:
                                        unit.top,
                                    transform:
                                        "translate(-50%, -50%) scale(1.15)",
                                    zIndex: 10,
                                    cursor:
                                        locked
                                            ? "not-allowed"
                                            : "pointer",

                                    filter: unitFilter,

                                    transition:
                                        "filter 0.25s ease",
                                }}
                                title={
                                    locked
                                        ? "Unit นี้ยังไม่ปลดล็อก"
                                        : played
                                            ? "Unit นี้เล่นแล้ว"
                                            : "ปลดล็อกแล้ว พร้อมเล่น!"
                                }
                            >
                                <UnitNode
                                    unit={unit}
                                />

                            </div>
                        );
                    })}

                    <Chest
                        left="90%"
                        top="69%"
                    />

                    {/* Loading */}
                    {loadingProgress && (
                        <div
                            style={{
                                position:
                                    "absolute",
                                inset: 0,
                                display:
                                    "flex",
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                background:
                                    "rgba(255,255,255,0.25)",
                                zIndex: 50,
                                pointerEvents:
                                    "none",
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        "rgba(255,255,255,0.95)",
                                    padding:
                                        "14px 24px",
                                    borderRadius:
                                        "16px",
                                    boxShadow:
                                        "0 8px 25px rgba(0,0,0,0.2)",
                                    fontWeight: 700,
                                    color:
                                        "#374151",
                                }}
                            >
                                กำลังโหลด Progress...
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {!loadingProgress &&
                        progressError && (
                            <div
                                style={{
                                    position:
                                        "absolute",
                                    top:
                                        "20px",
                                    left:
                                        "50%",
                                    transform:
                                        "translateX(-50%)",
                                    zIndex: 60,
                                    background:
                                        "rgba(255,255,255,0.96)",
                                    padding:
                                        "12px 18px",
                                    borderRadius:
                                        "14px",
                                    boxShadow:
                                        "0 8px 25px rgba(0,0,0,0.2)",
                                    color:
                                        "#b91c1c",
                                    fontWeight:
                                        700,
                                }}
                            >
                                {progressError}
                            </div>
                        )}
                </div>

                {/* Sidebar */}
                <div
                    className="sidebar"
                    style={{
                        width: "280px",
                        padding: "20px",
                        zIndex: 20,
                    }}
                >
                    <DailyQuest />
                    <Leaderboard />

                    <PrePost
                        completedUnits={
                            progressUnits.filter(
                                (unit) =>
                                    !unit.is_locked &&
                                    Number(
                                        unit.completion_percentage
                                    ) >= 100
                            ).length
                        }
                        totalUnits={
                            progressUnits.length ||
                            3
                        }
                    />
                </div>
            </div>

            {/* Footer */}
            <div
                className="footer"
                style={{
                    height: "2vh",
                    width: "19vw",
                    left: "81.7%",
                    zIndex: 20,
                    position: "relative",
                }}
            >
                <a href="#about">
                    About Project
                </a>
                <a href="#help">
                    Help Center
                </a>
            </div>
        </div>
    );
}

export default MapPage;