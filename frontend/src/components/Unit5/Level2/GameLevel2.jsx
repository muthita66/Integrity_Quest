import { BASE_URL } from "../../../config";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
    FaSchool,
    FaHospital,
    FaRoad,
    FaTree,
    FaTint,
    FaFireExtinguisher,
} from "react-icons/fa";
import bg from '../../../assets/unit5/citymap.png'

import BuildingCard from "./BuildingCard";
import BudgetPanel from "./BudgetPanel";
import StatusPanel from "./StatusPanel";
import EventPopup from "./EventPopup";

// ============================================================
// Unit 5 Level 2 : จัดสรรงบประมาณให้เมือง
// ------------------------------------------------------------
// งบที่จัดสรรบันทึกลง DB แล้ว backend เป็นคนคิดคะแนน / Rank / IP
//   เข้าเกม    → POST /api/game-play/start     { level_id } → play_id
//   สรุปผล    → POST /api/budget-game/submit  { playId, budgets }
//              → POST /api/game-play/complete  { play_id }
//              → /unit5/result?playId=
// ============================================================

const API_URL = `${BASE_URL}`;
const LEVEL_ID = 15;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function GameLevel2() {
    const navigate = useNavigate();

    const TOTAL_BUDGET = 100;

    const [playId, setPlayId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const startingRef = useRef(false); // กัน StrictMode เริ่มเกมซ้ำ

    // --------------------------------------------------------
    // เริ่มรอบใหม่ (backend ตรวจล็อกด่านให้)
    // --------------------------------------------------------
    useEffect(() => {
        if (startingRef.current) return;
        startingRef.current = true;

        const start = async () => {
            try {
                const response = await fetch(`${API_URL}/api/game-play/start`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ level_id: LEVEL_ID }),
                });

                if (response.status === 401) {
                    navigate("/", { replace: true });
                    return;
                }

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "เริ่มเกมไม่ได้");
                    navigate("/map", { replace: true });
                    return;
                }

                setPlayId(data.data.play_id);
            } catch (error) {
                console.error("Start budget game error:", error);
                alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                navigate("/map", { replace: true });
            }
        };

        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const buildings = [
        {
            id: "school",
            name: "โรงเรียน",
            icon: <FaSchool />,
        },
        {
            id: "hospital",
            name: "โรงพยาบาล",
            icon: <FaHospital />,
        },
        {
            id: "road",
            name: "ถนน",
            icon: <FaRoad />,
        },
        {
            id: "fire",
            name: "สถานีดับเพลิง",
            icon: <FaFireExtinguisher />,
        },
        {
            id: "park",
            name: "สวนสาธารณะ",
            icon: <FaTree />,
        },
        {
            id: "water",
            name: "ระบบน้ำสะอาด",
            icon: <FaTint />,
        },
    ];

    const [budgets, setBudgets] = useState({
        school: 0,
        hospital: 0,
        road: 0,
        fire: 0,
        park: 0,
        water: 0,
    });

    const [showEvent, setShowEvent] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    const [showResult, setShowResult] = useState(false);

    const remainingBudget = useMemo(() => {

        const used =
            budgets.school +
            budgets.hospital +
            budgets.road +
            budgets.fire +
            budgets.park +
            budgets.water;

        return TOTAL_BUDGET - used;

    }, [budgets]);

    function increaseBudget(id) {

        if (remainingBudget < 5) return;

        setBudgets((prev) => ({
            ...prev,
            [id]: prev[id] + 5,
        }));

    }

    function decreaseBudget(id) {

        if (budgets[id] <= 0) return;

        setBudgets((prev) => ({
            ...prev,
            [id]: prev[id] - 5,
        }));

    }
    // ==========================
    // คำนวณค่าต่าง ๆ ของเมือง
    // ==========================


    // ==========================
    // Event ทั้งหมด
    // ==========================

    const events = [
        {
            type: "flood",
            title: "🌧 น้ำท่วม",

            description:
                "ฝนตกหนัก ระบบระบายน้ำของเมืองไม่เพียงพอ",

            effect:
                "ถ้างบระบบน้ำต่ำ ประชาชนจะเดือดร้อน",
        },

        {
            type: "virus",
            title: "🦠 โรคระบาด",

            description:
                "จำนวนผู้ป่วยเพิ่มขึ้นอย่างรวดเร็ว",

            effect:
                "หากโรงพยาบาลได้รับงบน้อย สุขภาพของประชาชนจะลดลง",
        },

        {
            type: "festival",
            title: "🎉 เทศกาลเมือง",

            description:
                "สวนสาธารณะจัดกิจกรรมประจำปี",

            effect:
                "หากสวนได้รับงบเพียงพอ ความสุขจะเพิ่มขึ้น",
        },

        {
            type: "fire",
            title: "🔥 เหตุเพลิงไหม้",

            description:
                "เกิดเหตุไฟไหม้ในเขตชุมชน",

            effect:
                "หากสถานีดับเพลิงงบน้อย การช่วยเหลือจะล่าช้า",
        },
    ];

    // ==========================
    // สุ่ม Event ระหว่างเล่น
    // ==========================

    useEffect(() => {

        if (remainingBudget !== 50) return;

        const random =
            events[
            Math.floor(Math.random() * events.length)
            ];

        setCurrentEvent(random);

        setShowEvent(true);

    }, [remainingBudget]);

    // ==========================
    // งบหมด เปิดหน้าสรุป
    // ==========================

    useEffect(() => {

        if (remainingBudget === 0) {

            setTimeout(() => {

                setShowResult(true);

            }, 1000);

        }

    }, [remainingBudget]);

    // ==========================
    // ปิด Event
    // ==========================

    function closeEvent() {

        setShowEvent(false);

    }

    // ==========================
    // เตรียมข้อมูลส่งให้การ์ด
    // ==========================

    // ==========================
    // สรุปผล: ส่งงบ → จบเกม → หน้า Result
    // ==========================

    async function handleSummary() {
        if (!playId || submitting) return;

        if (remainingBudget > 0) {
            alert(`ยังเหลืองบอีก ${remainingBudget} เหรียญ\nกรุณาจัดสรรให้ครบก่อนสรุปผล`);
            return;
        }

        setSubmitting(true);
        setSubmitError("");

        try {
            const submitRes = await fetch(`${API_URL}/api/budget-game/submit`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ playId, budgets }),
            });

            if (submitRes.status === 401) {
                navigate("/", { replace: true });
                return;
            }

            const submitData = await submitRes.json();

            if (!submitRes.ok) {
                throw new Error(submitData.message || "บันทึกงบประมาณไม่สำเร็จ");
            }

            const completeRes = await fetch(`${API_URL}/api/game-play/complete`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ play_id: playId }),
            });

            const completeData = await completeRes.json();

            if (!completeRes.ok) {
                throw new Error(completeData.message || "บันทึกผลไม่สำเร็จ");
            }

            navigate(`/unit5/result?playId=${playId}`);
        } catch (error) {
            console.error("Submit budget error:", error);
            setSubmitError(error.message || "บันทึกผลไม่สำเร็จ ลองอีกครั้ง");
        } finally {
            setSubmitting(false);
        }
    }

    const buildingList = buildings.map((building) => ({

        ...building,

        budget: budgets[building.id],

    }));
    return (
        <>

            {/* Main */}

            <div
                className="
    unit5-embedded-menu h-dvh
    bg-cover
    bg-center
    bg-no-repeat
    p-4
    overflow-x-hidden
    overflow-y-auto
  "
                style={{
                    backgroundImage: `url(${bg})`,
                }}
            >

                <div className="mx-auto mr-[56px] mb-4 [@media(max-height:820px)]:mb-2 flex max-w-[1540px] items-center justify-between rounded-[22px] border-2 border-amber-200/55 bg-[#2b170e]/80 px-6 py-3 [@media(max-height:820px)]:py-2 text-[#fff1c7] shadow-[0_6px_0_rgba(48,22,9,.3)] backdrop-blur-md">
                    <div>
                        <div className="text-xs font-black tracking-[0.3em] text-amber-200/80">INTEGRITY TOWN · CITY PLAN</div>
                        <h1 className="mt-1 text-2xl [@media(max-height:820px)]:text-xl font-black drop-shadow-[2px_2px_0_rgba(0,0,0,.25)]">ภารกิจจัดสรรงบประมาณ</h1>
                    </div>
                    <div className="hidden rounded-full border border-amber-200/40 bg-amber-100/10 px-5 py-2 text-sm font-bold md:block">วางแผนเมืองให้สมดุลที่สุด</div>
                </div>

                <div className="mx-auto grid w-full max-w-[1540px] min-w-0 grid-cols-1 gap-5 [@media(max-height:820px)]:gap-3 [@media(min-width:1000px)]:grid-cols-[minmax(190px,220px)_minmax(0,1fr)_minmax(210px,240px)] [@media(min-width:1280px)]:grid-cols-[minmax(220px,260px)_minmax(0,1fr)_minmax(240px,300px)]">

                    {/* Left */}

                    <BudgetPanel

                        totalBudget={TOTAL_BUDGET}

                        remainingBudget={remainingBudget}

                    />

                    {/* Center */}

                    <div className="min-w-0">

                        <div className="grid grid-cols-1 gap-4 [@media(max-height:820px)]:gap-3 md:grid-cols-2">

                            {buildingList.map((building) => (

                                <BuildingCard

                                    key={building.id}

                                    building={building}

                                    budget={building.budget}

                                    remaining={remainingBudget}

                                    onIncrease={increaseBudget}

                                    onDecrease={decreaseBudget}

                                />

                            ))}
                        </div>

                    </div>

                    {/* Right */}

                    <StatusPanel
                        budgets={budgets}
                        remainingBudget={remainingBudget}
                        onSummary={handleSummary}
                    />

                </div>

            </div >

            {(submitting || submitError) && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold shadow-lg">
                    {submitting ? (
                        <span className="text-gray-700">กำลังบันทึกผล...</span>
                    ) : (
                        <>
                            <span className="text-red-700">{submitError}</span>
                            <button
                                type="button"
                                onClick={handleSummary}
                                className="rounded-lg bg-red-600 px-3 py-1 text-white"
                            >
                                ลองอีกครั้ง
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Event Popup */}

            < EventPopup
                open={showEvent}
                event={currentEvent}
                onClose={closeEvent}
            />
        </>
    );
}

/* =====================================
   Summary Card
===================================== */

function SummaryCard({ title, value }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="
        bg-white
        rounded-xl
        border-2
        border-[#d8c7b2]
        p-4
        shadow
      "
        >
            <div className="text-sm text-gray-500">
                {title}
            </div>

            <div className="mt-2 flex items-end gap-1">

                <span className="text-3xl font-black text-[#2b1b12]">
                    {value}
                </span>

                <span className="text-gray-500 mb-1">
                    เหรียญ
                </span>

            </div>

            <div className="mt-3 h-2 rounded-full bg-gray-200 overflow-hidden">

                <motion.div
                    animate={{
                        width: `${value}%`,
                    }}
                    transition={{
                        duration: .25,
                    }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-600"
                />

            </div>
        </motion.div>
    );
}