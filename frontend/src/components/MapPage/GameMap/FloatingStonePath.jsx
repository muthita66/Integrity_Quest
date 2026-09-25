import { useNavigate } from "react-router-dom";

import Stone1 from "../../../assets/Stone/Stone1.png";
import Stone2 from "../../../assets/Stone/Stone2.png";
import Stone3 from "../../../assets/Stone/Stone3.png";
import Stone4 from "../../../assets/Stone/Stone4.png";
import Stone5 from "../../../assets/Stone/Stone5.png";
import Stone6 from "../../../assets/Stone/Stone6.png";

// ============================================================
// หน้าเริ่มเกมของแต่ละ Level (level_id → path)
// ------------------------------------------------------------
// ดึงจาก App.jsx (หน้า Intro/เริ่มเกมของแต่ละ level)
// ถ้า level ไหนยังไม่ได้ใส่ จะพาไปหน้าบท (/unit/unitX) แทน
// ============================================================

const LEVEL_ROUTES = {
    // Unit 1
    1: "/unit1/Level1IntroPage",
    2: "/unit1/level2/intro",
    3: "/unit1/final",

    // Unit 2
    5: "/unit2/intro",
    6: "/unit2/level2/intro",
    7: "/unit2/final/intro",

    // Unit 3
    8: "/unit3/level1/intro",
    9: "/unit3/level2/intro",
    10: "/unit3/final/start",
};

// ============================================================
// หินลอย: บทละ 3 ก้อน = Level 1, 2, 3 ของบทนั้น
// เรียงก้อนแรก → ก้อนสุดท้ายตามลำดับ Level (order_no)
// ============================================================

const STONE_GROUPS = [
    {
        unitId: 1,
        img: Stone1,
        stones: [
            { x: "24%", y: "20%" },
            { x: "32%", y: "13%" },
            { x: "42%", y: "12%" },
        ],
    },
    {
        unitId: 2,
        img: Stone2,
        stones: [
            { x: "60%", y: "12%" },
            { x: "68%", y: "15%" },
            { x: "75%", y: "22%" },
        ],
    },
    {
        unitId: 3,
        img: Stone3,
        stones: [
            { x: "73%", y: "48%" },
            { x: "66%", y: "54%" },
            { x: "57%", y: "57%" },
        ],
    },
    {
        unitId: 4,
        img: Stone5,
        stones: [
            { x: "37%", y: "50%" },
            { x: "29%", y: "52%" },
            { x: "22%", y: "59%" },
        ],
    },
    {
        unitId: 5,
        img: Stone4,
        stones: [
            { x: "25%", y: "89%" },
            { x: "33%", y: "93%" },
            { x: "43%", y: "93%" },
        ],
    },
    {
        unitId: 6,
        img: Stone6,
        stones: [
            { x: "69%", y: "89%" },
            { x: "77%", y: "86%" },
            { x: "84%", y: "82%" },
        ],
    },
];

const STONE_SIZE = 70;

// ผ่าน Level = ติ๊กถูก (FAIL ไม่ติ๊ก)
const PASSED_STATUSES = ["PASS", "PERFECT"];

// ============================================================
// หาสถานะของหินแต่ละก้อน
// ------------------------------------------------------------
// none   : บทนี้ยังไม่มี Level ใน DB           → เทา กดไม่ได้
// locked : ยังไม่ปลดล็อก                      → เทา กดไม่ได้
// ready  : ปลดล็อกแล้ว ยังไม่ผ่าน             → เรืองแสง กดได้
// passed : ผ่านแล้ว (PASS/PERFECT)            → ติ๊กถูก กดเล่นซ้ำได้
// ============================================================

const getStoneState = ({ unitProgress, level, index, loading }) => {
    if (loading || !unitProgress || !level) {
        return "none";
    }

    if (unitProgress.is_locked === true) {
        return "locked";
    }

    if (PASSED_STATUSES.includes(level.status)) {
        return "passed";
    }

    // Level แรกของบทที่ปลดล็อกแล้ว เล่นได้เสมอ
    // (Backend startGame ก็อนุญาตกรณีนี้)
    if (index === 0) {
        return "ready";
    }

    return level.is_locked === false ? "ready" : "locked";
};

const STONE_FILTER = {
    none: "grayscale(1) opacity(0.45) drop-shadow(0 10px 10px rgba(0,0,0,.25))",
    locked: "grayscale(1) opacity(0.55) drop-shadow(0 10px 10px rgba(0,0,0,.3))",
    ready: "drop-shadow(0 0 10px rgba(255, 215, 0, 0.95)) drop-shadow(0 0 22px rgba(255, 190, 0, 0.6))",
    passed: "drop-shadow(0 10px 10px rgba(0,0,0,.35))",
};

function FloatingStonePath({ progressUnits = [], loading = false }) {
    const navigate = useNavigate();

    const handleStoneClick = ({ state, level, unitId }) => {
        if (state === "none") {
            return;
        }

        if (state === "locked") {
            alert(
                "🔒 Level นี้ยังไม่ปลดล็อก\nกรุณาผ่าน Level ก่อนหน้าก่อน"
            );
            return;
        }

        navigate(
            LEVEL_ROUTES[level.level_id] ||
            `/unit/unit${unitId}`
        );
    };

    return (
        <>
            <style>{`
                .map-stone {
                    position: absolute;
                    transform: translate(-50%, -50%);
                    z-index: 5;
                    user-select: none;
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .map-stone.clickable {
                    cursor: pointer;
                }

                .map-stone.clickable:hover {
                    transform: translate(-50%, -50%) scale(1.15);
                }

                .map-stone.locked {
                    cursor: not-allowed;
                }

                .map-stone img {
                    display: block;
                    width: ${STONE_SIZE}px;
                    pointer-events: none;
                    transition: filter 0.25s ease;
                }

                .map-stone.ready img {
                    animation: stone-float 2.2s ease-in-out infinite;
                }

                @keyframes stone-float {
                    0%, 100% { transform: translateY(0); }
                    50%      { transform: translateY(-5px); }
                }

                .stone-check {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: #22c55e;
                    border: 2px solid #ffffff;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 900;
                    line-height: 20px;
                    text-align: center;
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.35);
                    pointer-events: none;
                }
            `}</style>

            {STONE_GROUPS.map((group) => {
                const unitProgress =
                    progressUnits.find(
                        (unit) =>
                            Number(unit.unit_id) ===
                            group.unitId
                    ) || null;

                const levels = [
                    ...(unitProgress?.levels || []),
                ].sort(
                    (a, b) =>
                        Number(a.order_no) -
                        Number(b.order_no)
                );

                return group.stones.map((stone, index) => {
                    const level = levels[index] || null;

                    const state = getStoneState({
                        unitProgress,
                        level,
                        index,
                        loading,
                    });

                    const clickable =
                        state === "ready" ||
                        state === "passed";

                    const title = !level
                        ? "ยังไม่เปิดให้เล่น"
                        : state === "locked"
                            ? `🔒 Level ${index + 1}: ${level.title}`
                            : state === "passed"
                                ? `✓ Level ${index + 1}: ${level.title} (ผ่านแล้ว · กดเพื่อเล่นอีกครั้ง)`
                                : `Level ${index + 1}: ${level.title} (พร้อมเล่น!)`;

                    return (
                        <div
                            key={`${group.unitId}-${index}`}
                            className={`map-stone ${state} ${clickable ? "clickable" : ""
                                }`}
                            style={{
                                left: stone.x,
                                top: stone.y,
                            }}
                            title={title}
                            onClick={() =>
                                handleStoneClick({
                                    state,
                                    level,
                                    unitId: group.unitId,
                                })
                            }
                        >
                            <img
                                src={group.img}
                                alt={title}
                                draggable={false}
                                style={{
                                    filter: STONE_FILTER[state],
                                }}
                            />

                            {state === "passed" && (
                                <span className="stone-check">
                                    ✓
                                </span>
                            )}
                        </div>
                    );
                });
            })}
        </>
    );
}

export default FloatingStonePath;