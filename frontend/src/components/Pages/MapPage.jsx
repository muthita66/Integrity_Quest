import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import StreakRewardModal from "../MapPage/StreakRewardModal";
import CertificateReward from "../MapPage/CertificateReward";
import useMapHoverSound from '../../hooks/useMapHoverSound';
import { useSound } from '../../hooks/useSound';
import useGameMuted from '../../hooks/useGameMuted';
import mapMusic from '../../assets/sounds/Map/magical-storytime.mp3';

const API_BASE_URL = "http://localhost:5000";

// ------------------------------------------------------------
// Responsive: ปราสาท/ป้ายชื่อบทมีขนาดเป็นพิกเซลคงที่ แต่ตำแหน่งเป็น %
// พอพื้นที่แผนที่เล็กลง (iPad / หน้าต่างแคบ) ปราสาทจึงซ้อนกัน
// → คำนวณสัดส่วนจากขนาดพื้นที่แผนที่จริง แล้วย่อ/ขยายปราสาททั้งชุดตามนั้น
//
// MAP_REF_* = ขนาดพื้นที่แผนที่ที่ถือว่า "ขนาดปกติ" (scale = 1)
// ถ้าอยากให้ปราสาทใหญ่ขึ้น/เล็กลงทั้งระบบ ให้ปรับสองค่านี้
// (ลดค่า = ปราสาทใหญ่ขึ้น, เพิ่มค่า = ปราสาทเล็กลง)
// ------------------------------------------------------------
const MAP_REF_WIDTH = 1100;
const MAP_REF_HEIGHT = 600;
const MAP_SCALE_MIN = 0.4;
const MAP_SCALE_MAX = 1.4;

// ขนาดพื้นฐานของแต่ละบท (ค่าเดิมที่เคยตั้งไว้) และระยะเผื่อจากขอบแผนที่
// นอกจากย่อตามขนาดพื้นที่แล้ว ยังวัดตำแหน่งจริงของทุกบท แล้วย่อเพิ่มเท่าที่จำเป็น
// เพื่อไม่ให้ปราสาท/ป้ายชื่อบทล้นขอบแผนที่แล้วโดนตัด (เช่น บท 6 ที่อยู่ชิดขอบล่าง)
const UNIT_NODE_BASE_SCALE = 1.15;
const MAP_EDGE_MARGIN = 0.96;

function MapPage() {
    useMapHoverSound();
    const [muted] = useGameMuted();
    const { play: playMusic, stop: stopMusic } = useSound(mapMusic, {
        volume: 0.25, loop: true, preload: true, retryOnInteract: true,
    });
    useEffect(() => {
        if (!muted) playMusic();
        else stopMusic();
        return stopMusic;
    }, [muted, playMusic, stopMusic]);
    const location = useLocation();
    const navigate = useNavigate();

    const mapRef = useRef(null);
    const [mapScale, setMapScale] = useState(1);

    const recalcMapScale = useCallback(() => {
        const el = mapRef.current;
        if (!el) return;

        // clientWidth/Height และ offsetLeft/Top/Width/Height ไม่รวม transform
        // จึงวัดได้ตรงโดยไม่ขึ้นกับ scale ที่ใช้อยู่ตอนนี้
        const mapW = el.clientWidth;
        const mapH = el.clientHeight;
        if (!mapW || !mapH) return;

        // 1) ขนาดตามพื้นที่แผนที่
        let next = Math.min(mapW / MAP_REF_WIDTH, mapH / MAP_REF_HEIGHT);

        // 2) ย่อเพิ่มถ้ามีบทไหนจะล้นขอบ
        //    ศูนย์กลางของแต่ละบทอยู่ที่ (offsetLeft, offsetTop) เพราะใช้ translate(-50%, -50%)
        el.querySelectorAll("[data-map-node]").forEach((node) => {
            const w = node.offsetWidth;
            const h = node.offsetHeight;
            if (!w || !h) return;

            const cx = node.offsetLeft;
            const cy = node.offsetTop;

            const fitX = Math.min(cx, mapW - cx) / (w / 2);
            const fitY = Math.min(cy, mapH - cy) / (h / 2);
            const fit = Math.min(fitX, fitY);

            next = Math.min(next, (fit / UNIT_NODE_BASE_SCALE) * MAP_EDGE_MARGIN);
        });

        setMapScale(Math.min(MAP_SCALE_MAX, Math.max(MAP_SCALE_MIN, next)));
    }, []);

    const [progressUnits, setProgressUnits] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [progressError, setProgressError] = useState("");
    const [streakReward, setStreakReward] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const closeCertificate = useCallback(() => setShowCertificate(false), []);
    const rewardReady = !loadingProgress && !progressError && progressUnits.length > 0 && progressUnits.every((unit) =>
        unit.levels?.length > 0 && unit.levels.every((level) => ['PASS', 'PERFECT'].includes(level.status))
    );
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem("streakReward");

            if (raw) {
                setStreakReward(JSON.parse(raw));
                sessionStorage.removeItem("streakReward");
            }
        } catch (error) {
            console.error("Read streak reward error:", error);
        }
    }, []);

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

    // คำนวณ scale ใหม่เมื่อ: ขนาดแผนที่เปลี่ยน, รายการบทเปลี่ยน, หรือขนาดของบทเปลี่ยน (เช่นรูปโหลดเสร็จ)
    useEffect(() => {
        const el = mapRef.current;
        if (!el) return;

        recalcMapScale();

        const observer = new ResizeObserver(recalcMapScale);
        observer.observe(el);
        el.querySelectorAll("[data-map-node]").forEach((node) =>
            observer.observe(node)
        );

        return () => observer.disconnect();
    }, [recalcMapScale, visibleUnits]);

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

        if (loadingProgress) {
            return true;
        }

        if (!progress) {
            return true;
        }

        return progress.is_locked === true;
    };

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
        <>
            {showCertificate && <CertificateReward onClose={closeCertificate} />}
            <StreakRewardModal
                reward={streakReward}
                onClose={() => setStreakReward(null)}
            />
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
                        ref={mapRef}
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
                                    data-map-node
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
                                            `translate(-50%, -50%) scale(${UNIT_NODE_BASE_SCALE * mapScale})`,
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
                            ready={rewardReady}
                            disabled={loadingProgress}
                            onClick={() => setShowCertificate(true)}
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
                >
                    <a href="#about">
                        About Project
                    </a>
                    <a href="#help">
                        Help Center
                    </a>
                </div>
            </div>
        </>
    );
}

export default MapPage;