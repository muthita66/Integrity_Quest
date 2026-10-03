import { motion } from "framer-motion";
import { ChartColumnBig } from 'lucide-react';
import {
    FaSmile,
    FaHeart,
    FaBook,
    FaRoad,
} from "react-icons/fa";

export default function StatusPanel({
    budgets = {
        school: 0,
        hospital: 0,
        road: 0,
        fire: 0,
        park: 0,
        water: 0,
    },
    onSummary,
    remainingBudget,
}) {

    // คำนวณค่าต่างๆ
    const education =
        Math.min(
            100,
            budgets.school / 20 * 100
        );

    const health =
        Math.min(
            100,
            budgets.hospital / 20 * 100
        );

    const transport =
        Math.min(
            100,
            budgets.road / 20 * 100
        );

    const safety =
        Math.min(
            100,
            budgets.fire / 15 * 100
        );

    const environment =
        Math.min(
            100,
            (
                budgets.park / 10 * 50
            ) +
            (
                budgets.water / 15 * 50
            )
        );

    const happiness =
        Math.round(
            (
                education +
                health +
                transport +
                safety +
                environment
            ) / 5
        );

    const score = Math.round(
        (
            education * 0.25 +
            health * 0.25 +
            transport * 0.15 +
            safety * 0.15 +
            environment * 0.20
        )
    );

    let rank = "D";
    let rankText = "คุณต้องปรับปรุงแผนการใช้งบประมาณ";
    let stars = 1;

    if (score >= 90) {
        rank = "S";
        rankText = "คุณสามารถบริหารได้สุดยอดมาก!";
        stars = 5;
    }
    else if (score >= 80) {
        rank = "A";
        rankText = "คุณบริหารเมืองได้ยอดเยี่ยม";
        stars = 4;
    }
    else if (score >= 70) {
        rank = "B";
        rankText = "คุณใช้งบในการบบริหารได้ดี";
        stars = 3;
    }
    else if (score >= 61) {
        rank = "C";
        rankText = "คุณควรปรับแก้แผนการบริหารนิดหน่อย";
        stars = 2;
    }

    const hpReward = Math.floor(
        score / 5
    );

    const Item = ({
        icon,
        title,
        value,
        color,
        barColor,
    }) => (

        <motion.div
            layout
            className="
        bg-[#fff8e7]/95
        border-2
        border-[#e0a33d]
        rounded-[22px]
        p-4
        shadow-[5px_6px_0_rgba(70,38,15,.18)]
      "
        >

            <div className="flex justify-between items-center">

                <div className="flex items-center gap-3">

                    <div className={color}>
                        {icon}
                    </div>

                    <span className="font-bold text-[#2b1b12]">
                        {title}
                    </span>

                </div>

                <span className="font-black text-2xl text-[#2b1b12]">
                    {value}%
                </span>

            </div>

            <div className="mt-3 h-3 rounded-full bg-gray-200 overflow-hidden">

                <motion.div
                    animate={{
                        width: `${value}%`
                    }}
                    transition={{
                        duration: .25
                    }}
                    className={`h-full ${barColor}`}
                />

            </div>

        </motion.div>

    );

    return (

        <div
            className="
        w-full
        max-w-[320px]
        flex
        flex-col
        gap-3
      "
        >

            <h2
                className="
          text-2xl
          font-black
                inline-block rounded-full border border-amber-200/60 bg-[#2b170e]/75 px-5 py-2 text-amber-100
          text-center
        "
            >
                สถานะเมือง
            </h2>

            <Item
                icon={<FaSmile size={24} />}
                title="ความสุข"
                value={happiness}
                color="text-yellow-500"
                barColor="bg-yellow-500"
            />

            <Item
                icon={<FaHeart size={22} />}
                title="สุขภาพ"
                value={health}
                color="text-red-500"
                barColor="bg-red-500"
            />

            <Item
                icon={<FaBook size={22} />}
                title="การศึกษา"
                value={education}
                color="text-blue-600"
                barColor="bg-blue-600"
            />

            <Item
                icon={<FaRoad size={22} />}
                title="คมนาคม"
                value={transport}
                color="text-green-600"
                barColor="bg-green-600"
            />
            <motion.button
                whileHover={
                    remainingBudget === 0
                        ? { scale: 1.03 }
                        : {}
                }
                whileTap={
                    remainingBudget === 0
                        ? { scale: 0.95 }
                        : {}
                }
                disabled={remainingBudget > 0}
                onClick={onSummary}
                className={`
        w-full
        py-5
        rounded-[20px]
        bg-gradient-to-r
        from-amber-500
        to-yellow-400
        text-[#2b1b12]
        text-2xl
        font-black
        shadow-[6px_7px_0_rgba(70,38,15,.28),0_12px_20px_rgba(50,25,8,.2)]

        ${remainingBudget > 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
    `}
            >
                <ChartColumnBig className="inline" size={50} />

                {remainingBudget > 0
                    ? ` เหลืองบอีก ${remainingBudget}`
                    : " สรุปผล"}
            </motion.button>
        </div>

    );

}
