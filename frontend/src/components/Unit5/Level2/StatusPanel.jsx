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

    if (score >= 91) {
        rank = "S";
        rankText = "คุณสามารถบริหารได้สุดยอดมาก!";
        stars = 5;
    }
    else if (score >= 81) {
        rank = "A";
        rankText = "คุณบริหารเมืองได้ยอดเยี่ยม";
        stars = 4;
    }
    else if (score >= 71) {
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
    }) => (

        <motion.div
            layout
            className="
        bg-[#f5ecdf]
        border-2
        border-[#ccb79d]
        rounded-xl
        p-4
        shadow
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
                    className={`h-full ${color.replace("text", "bg")}`}
                />

            </div>

        </motion.div>

    );

    return (

        <div
            className="
        w-[320px]
        flex
        flex-col
        gap-4
      "
        >

            <h2
                className="
          text-2xl
          font-black
          text-white
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
            />

            <Item
                icon={<FaHeart size={22} />}
                title="สุขภาพ"
                value={health}
                color="text-red-500"
            />

            <Item
                icon={<FaBook size={22} />}
                title="การศึกษา"
                value={education}
                color="text-blue-600"
            />

            <Item
                icon={<FaRoad size={22} />}
                title="คมนาคม"
                value={transport}
                color="text-green-600"
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
        rounded-xl
        bg-gradient-to-r
        from-amber-500
        to-yellow-400
        text-[#2b1b12]
        text-2xl
        font-black
        shadow-xl

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