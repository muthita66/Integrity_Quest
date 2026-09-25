import { useEffect, useMemo, useState } from "react";
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
import bg from '../../../assets/unit5/map.png'

import BuildingCard from "./BuildingCard";
import BudgetPanel from "./BudgetPanel";
import StatusPanel from "./StatusPanel";
import EventPopup from "./EventPopup";

export default function GameLevel2() {
    const navigate = useNavigate();

    const TOTAL_BUDGET = 100;

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

    const buildingList = buildings.map((building) => ({

        ...building,

        budget: budgets[building.id],

    }));
    return (
        <>

            {/* Main */}

            <div
                className="
    min-h-screen
    bg-cover
    bg-center
    bg-no-repeat
    p-6
  "
                style={{
                    backgroundImage: `url(${bg})`,
                }}
            >

                <div className="grid grid-cols-[280px_1fr_320px] gap-8">

                    {/* Left */}

                    <BudgetPanel

                        totalBudget={TOTAL_BUDGET}

                        remainingBudget={remainingBudget}

                    />

                    {/* Center */}

                    <div>

                        <div className="grid grid-cols-2 gap-6">

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
                        onSummary={() =>
                            navigate("/unit5/result", {
                                state: {
                                    budgets,
                                    totalBudget: TOTAL_BUDGET,
                                    remainingBudget,
                                },
                            })
                        }
                    />

                </div>

            </div >
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
