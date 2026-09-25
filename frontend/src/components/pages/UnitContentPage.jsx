import React, { useEffect, useState } from "react";
import bgGame from "../../assets/bg_game.png";
import { useParams, useNavigate } from "react-router-dom";
import { FaCircleArrowRight, FaHouse } from "react-icons/fa6";

const API_BASE_URL = "http://localhost:5000";

export default function UnitContentPage() {
    const navigate = useNavigate();

    const [header, setHeader] = useState(null);
    const [cards, setCards] = useState([]);

    // ============================================================
    // User Progress
    // ============================================================

    const [levelProgress, setLevelProgress] = useState([]);
    const [unitLocked, setUnitLocked] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(true);
    const [progressError, setProgressError] = useState("");

    const { unitId } = useParams();

    // เช่น /unit/unit2 -> "unit2" -> 2
    const parsedUnitId = unitId
        ? unitId.replace(/\D/g, "")
        : "";

    const currentUnitId = Number(parsedUnitId) || 1;

    // ============================================================
    // โหลด Unit Content
    // ============================================================

    useEffect(() => {
        const fetchUnitContent = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/unitContent/${currentUnitId}/contents`
                );

                if (!response.ok) {
                    throw new Error(
                        `HTTP Error ${response.status}`
                    );
                }

                const data = await response.json();

                console.log("Unit Content:", data);

                setHeader(data.header);
                setCards(data.cards || []);
            } catch (error) {
                console.error(
                    "Get Unit Content Error:",
                    error
                );

                setHeader(null);
                setCards([]);
            }
        };

        fetchUnitContent();
    }, [currentUnitId]);

    // ============================================================
    // โหลด User Progress
    // ============================================================

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

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        "ไม่สามารถโหลด Progress ได้"
                    );
                }

                const currentUnit =
                    Array.isArray(data.data)
                        ? data.data.find(
                            (unit) =>
                                Number(unit.unit_id) ===
                                currentUnitId
                        )
                        : null;

                console.log(
                    "Current Unit Progress:",
                    currentUnit
                );

                if (isMounted) {
                    setLevelProgress(
                        currentUnit?.levels || []
                    );

                    // ไม่พบบทนี้ (ยังไม่เปิด) = ล็อก
                    setUnitLocked(
                        !currentUnit ||
                        currentUnit.is_locked === true
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

                    setLevelProgress([]);
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
    }, [currentUnitId]);

    // ============================================================
    // เรียง Level
    // ============================================================

    const sortedLevels = [...levelProgress].sort(
        (a, b) =>
            Number(a.order_no || 0) -
            Number(b.order_no || 0)
    );

    // ============================================================
    // หา Level ที่ควรเล่นต่อ
    //
    // PASS / PERFECT = ผ่านแล้ว
    // FAIL / IN_PROGRESS / UNLOCKED = ยังสามารถเล่นต่อได้
    // LOCKED = ยังเล่นไม่ได้
    // ============================================================

    // กติกาเดียวกับก้อนหินบนแผนที่ (FloatingStonePath):
    //   - บทล็อก → เล่นไม่ได้ทุก Level
    //   - Level แรกของบทที่ปลดล็อกแล้ว → เล่นได้เสมอ
    //     (ยังไม่มีแถวใน user_level_progress ก็เล่นได้)
    //   - Level อื่น → ต้อง is_locked = false
    const isLevelPlayable = (level, index) =>
        !unitLocked &&
        (index === 0 || level.is_locked === false);

    const nextPlayableLevel =
        sortedLevels.find(
            (level, index) =>
                isLevelPlayable(level, index) &&
                level.status !== "PASS" &&
                level.status !== "PERFECT"
        ) || null;

    const allLevelsCompleted =
        sortedLevels.length > 0 &&
        sortedLevels.every(
            (level) =>
                level.status === "PASS" ||
                level.status === "PERFECT"
        );

    const isStartLocked =
        loadingProgress ||
        !!progressError ||
        unitLocked ||
        (!nextPlayableLevel && !allLevelsCompleted);

    // ============================================================
    // Route ของแต่ละ Level
    // ============================================================

    const getLevelRoute = (
        unitId,
        levelId
    ) => {
        // --------------------------------------------------------
        // Unit 1
        // --------------------------------------------------------

        if (unitId === 1) {
            switch (levelId) {
                case 1:
                    return "/unit1/Level1IntroPage";

                case 2:
                    return "/unit1/level2/intro";

                case 3:
                    return "/unit1/final";

                default:
                    return null;
            }
        }

        // --------------------------------------------------------
        // Unit 2
        // --------------------------------------------------------

        if (unitId === 2) {
            switch (levelId) {
                // Level 5
                case 5:
                    return "/unit2/intro";

                // Level 6
                case 6:
                    return "/unit2/level2/intro";

                // Level 7
                case 7:
                    return "/unit2/final/intro";

                default:
                    return null;
            }
        }

        // --------------------------------------------------------
        // Unit 3
        // --------------------------------------------------------

        if (unitId === 3) {
            switch (levelId) {
                // Level 8
                case 8:
                    return "/unit3/level1/intro";

                // Level 9
                case 9:
                    return "/unit3/level2/intro";

                // Level 10
                case 10:
                    return "/unit3/final/start";

                default:
                    return null;
            }
        }

        return null;
    };

    // ============================================================
    // Start Level
    // ============================================================

    const handleStart = () => {
        if (loadingProgress) {
            return;
        }

        if (progressError) {
            alert(
                "ไม่สามารถตรวจสอบ Progress ได้\nกรุณาลองใหม่อีกครั้ง"
            );
            return;
        }

        let levelToStart = nextPlayableLevel;

        // ถ้าผ่าน Unit ครบทุก Level แล้ว
        // ให้สามารถเล่นซ้ำได้ โดยเริ่มจาก Level แรก
        if (allLevelsCompleted) {
            levelToStart = sortedLevels[0];
        }

        if (!levelToStart) {
            alert(
                "🔒 ยังไม่มี Level ที่สามารถเล่นได้"
            );
            return;
        }

        const levelId =
            Number(levelToStart.level_id);

        const route = getLevelRoute(
            currentUnitId,
            levelId
        );

        console.log(
            "Starting Level:",
            nextPlayableLevel
        );

        console.log(
            "Navigate Route:",
            route
        );

        if (!route) {
            alert(
                `ไม่พบ Route ของ Level ${levelId}\nกรุณาตรวจสอบ App.jsx`
            );
            return;
        }

        navigate(route);
    };

    // ============================================================
    // UI
    // ============================================================

    return (
        <div
            className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-cover
                bg-center
                bg-fixed
                sarabun-medium
                relative
            "
            style={{
                backgroundImage:
                    `url(${bgGame})`,
            }}
        >
            {/* Overlay */}
            <div
                className="
                    absolute
                    inset-0
                    bg-white/40
                    backdrop-blur-[2px]
                "
            />

            {/* Header Unit */}
            <div
                className="
                    absolute
                    top-0
                    left-0
                    z-20
                    bg-orange-600
                    text-white
                    sarabun-semibold
                    px-6
                    py-2
                    rounded-br-2xl
                    text-lg
                    shadow-md
                "
            >
                Unit {currentUnitId}:{" "}
                {header?.name_th ||
                    header?.title ||
                    "กำลังโหลด..."}
            </div>

            {/* Home Button */}
            <button
                onClick={() =>
                    navigate("/map")
                }
                className="
                    absolute
                    top-3
                    right-4
                    z-20
                    flex
                    items-center
                    gap-2
                    bg-white/80
                    hover:bg-orange-600
                    hover:text-white
                    text-orange-600
                    border-2
                    border-orange-600
                    px-2
                    py-2
                    rounded-full
                    text-sm
                    shadow-md
                    transition-all
                    duration-200
                    hover:scale-105
                "
            >
                <FaHouse size={24} />
            </button>

            {/* Main Content */}
            <div
                className="
                    relative
                    z-10
                    w-full
                    px-6
                    py-8
                "
            >
                {/* Title */}
                <div
                    className="
                        text-center
                        mt-2
                        mb-4
                    "
                >
                    <h1
                        className="
                            text-3xl
                            sarabun-bold
                            text-gray-800
                            tracking-wide
                            uppercase
                        "
                    >
                        {header?.title ||
                            header?.name_en}
                    </h1>
                </div>

                {/* Cards */}
                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-3
                        gap-4
                        max-w-[1300px]
                        h-[550px]
                        mx-auto
                    "
                >
                    {cards.length > 0 ? (
                        cards.map((item) => (
                            <div
                                key={
                                    item.content_id
                                }
                                className="
                                    border-[3px]
                                    border-black
                                    bg-white/90
                                    rounded-2xl
                                    px-4
                                    py-4
                                    flex
                                    flex-col
                                    items-center
                                    justify-between
                                    min-h-[450px]
                                    shadow-lg
                                "
                            >
                                <h2
                                    className="
                                        text-xl
                                        sarabun-bold
                                        text-center
                                        border-b
                                        pb-1
                                        w-full
                                    "
                                >
                                    {item.title}
                                </h2>

                                <p
                                    className="
                                        mt-2
                                        sarabun-light
                                        text-md
                                        text-center
                                        text-black
                                        whitespace-pre-line
                                    "
                                >
                                    {item.description}
                                </p>

                                <div
                                    className="
                                        flex-grow
                                        flex
                                        items-center
                                        justify-center
                                        my-4
                                        w-full
                                    "
                                >
                                    <img
                                        src={`/image/${item.image_url}`}
                                        alt={
                                            item.title
                                        }
                                        className="
                                            max-h-64
                                            max-w-full
                                            object-contain
                                        "
                                    />
                                </div>

                                <p
                                    className="
                                        sarabun-light
                                        text-sm
                                        text-center
                                        justify-center
                                        text-black
                                        whitespace-pre-line
                                    "
                                >
                                    {item.reflection}
                                </p>
                            </div>
                        ))
                    ) : (
                        <div
                            className="
                                col-span-full
                                text-center
                                py-12
                                text-gray-700
                                font-bold
                            "
                        >
                            กำลังโหลดข้อมูลบทเรียน...
                        </div>
                    )}
                </div>

                {/* Progress Status */}
                {!loadingProgress &&
                    !progressError &&
                    nextPlayableLevel && (
                        <div
                            className="
                                flex
                                justify-center
                                mt-2
                                text-sm
                                font-bold
                                text-gray-800
                            "
                        >
                            🔓 พร้อมเล่น:{" "}
                            {nextPlayableLevel.title}
                        </div>
                    )}

                {!loadingProgress &&
                    !progressError &&
                    allLevelsCompleted && (
                        <div
                            className="
                                flex
                                justify-center
                                mt-2
                                text-sm
                                font-bold
                                text-green-700
                            "
                        >
                            🎉 ผ่าน Unit นี้ครบแล้ว
                        </div>
                    )}

                {progressError && (
                    <div
                        className="
                            flex
                            justify-center
                            mt-2
                            text-sm
                            font-bold
                            text-red-600
                        "
                    >
                        {progressError}
                    </div>
                )}

                {/* START Button */}
                <div
                    className="
                        flex
                        justify-center
                        mt-2
                        mb-2
                    "
                >
                    <button
                        onClick={handleStart}
                        disabled={isStartLocked}
                        title={
                            loadingProgress
                                ? "กำลังโหลด Progress..."
                                : progressError
                                    ? "ไม่สามารถโหลด Progress ได้"
                                    : allLevelsCompleted
                                        ? "เล่น Unit นี้ซ้ำ"
                                        : nextPlayableLevel
                                            ? `เริ่ม ${nextPlayableLevel.title}`
                                            : unitLocked
                                                ? "บทนี้ยังไม่ปลดล็อก"
                                                : "Level นี้ยังไม่ปลดล็อก"
                        }
                        className={`
                            w-[48px]
                            h-[48px]
                            px-2
                            py-2
                            rounded-full
                            text-sm
                            shadow-md
                            transition-all
                            duration-200
                            border-2
                            ${isStartLocked
                                ? `
                                        bg-gray-300
                                        text-gray-500
                                        border-gray-500
                                        cursor-not-allowed
                                        opacity-70
                                    `
                                : `
                                        bg-white/80
                                        hover:bg-orange-600
                                        hover:text-white
                                        text-orange-600
                                        border-orange-600
                                        hover:scale-105
                                        cursor-pointer
                                    `
                            }
                        `}
                    >
                        {isStartLocked ? (
                            <span className="text-xl">
                                🔒
                            </span>
                        ) : (
                            <FaCircleArrowRight
                                className="
                                    w-full
                                    h-full
                                "
                            />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}