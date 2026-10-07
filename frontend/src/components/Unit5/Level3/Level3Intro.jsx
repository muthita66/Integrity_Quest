import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    FaArrowRight,
    FaCheckCircle,
    FaFileAlt,
    FaSearch,
    FaShieldAlt,
    FaExclamationTriangle,
} from "react-icons/fa";
import gameBg from "../../../assets/unit5/build.png";

const tips = [
    {
        icon: <FaSearch />,
        title: "อ่านเอกสารให้ครบ",
        text: "ตรวจงบประมาณ ผู้รับเหมา ประวัติ และหลักฐานประกอบโครงการ",
        color: "text-amber-300",
    },
    {
        icon: <FaExclamationTriangle />,
        title: "จับพิรุธให้ทัน",
        text: "สังเกตตัวเลขผิดปกติ เอกสารไม่ตรงกัน และข้อเสนอที่ดูดีเกินจริง",
        color: "text-orange-300",
    },
    {
        icon: <FaCheckCircle />,
        title: "เลือกคำตัดสิน",
        text: "อนุมัติโครงการที่โปร่งใส หรือปฏิเสธโครงการที่มีความเสี่ยง",
        color: "text-emerald-300",
    },
    {
        icon: <FaShieldAlt />,
        title: "รักษาความซื่อสัตย์",
        text: "ห้ามรับสินบน เพราะจะทำให้คะแนนและ Integrity ลดลง",
        color: "text-sky-300",
    },
];

export default function Level3Intro() {
    const navigate = useNavigate();

    return (
        <main
            className="flex h-dvh overflow-x-hidden overflow-y-auto bg-cover bg-center bg-no-repeat p-3 text-[#fff4d6]"
            style={{
                backgroundImage: `linear-gradient(rgba(24, 12, 6, .68), rgba(24, 12, 6, .84)), url(${gameBg})`,
            }}
        >
            <div className="m-auto w-full max-w-4xl overflow-hidden rounded-[20px] border-2 border-amber-200/45 bg-[#24140c]/90 shadow-[10px_12px_0_rgba(43,20,8,.35),0_24px_70px_rgba(0,0,0,.4)] backdrop-blur-md">
                <div className="relative border-b border-amber-200/20 bg-gradient-to-r from-[#70431f] via-[#4b2b18] to-[#29160d] px-5 py-5 [@media(max-height:820px)]:py-3 text-center md:px-8">
                    <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300" />
                    <div className="mx-auto mb-3 [@media(max-height:820px)]:mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200/50 bg-amber-100/10 px-4 py-2 text-xs font-black tracking-[0.25em] text-amber-100">
                        CASE FILE 03 · FIELD BRIEFING
                    </div>
                    <h1 className="text-2xl font-black drop-shadow-[3px_3px_0_rgba(0,0,0,.3)] md:text-4xl [@media(max-height:820px)]:md:text-3xl">
                        ภารกิจผู้ตรวจสอบความโปร่งใส
                    </h1>
                    <p className="mt-2 text-sm text-amber-100/80 md:text-base">
                        ตรวจแฟ้มโครงการ ตัดสินใจด้วยหลักฐาน และปกป้องเงินของประชาชน
                    </p>
                </div>

                <div className="px-5 py-5 md:px-8 md:py-6 [@media(max-height:820px)]:py-3 [@media(max-height:820px)]:md:py-3">
                    <div className="mb-4 [@media(max-height:820px)]:mb-2 flex items-center gap-3">
                        <FaFileAlt className="text-2xl text-amber-300" />
                        <div>
                            <h2 className="text-xl font-black mb-2">วิธีเล่นและจุดสังเกต</h2>
                            <p className="text-xs text-amber-100/65">คุณมีเวลา 120 วินาทีในการตรวจสอบแต่ละแฟ้มคดี</p>
                        </div>
                    </div>

                    <div className="grid gap-4 [@media(max-height:820px)]:gap-3 md:grid-cols-2">
                        {tips.map((tip, index) => (
                            <motion.div
                                key={tip.title}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                                className="rounded-[18px] border border-amber-100/20 bg-white/[0.08] p-4 [@media(max-height:820px)]:p-3 shadow-[4px_5px_0_rgba(0,0,0,.16)]"
                            >
                                <div className="mb-3 [@media(max-height:820px)]:mb-2 flex items-center gap-3">
                                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 text-xl ${tip.color}`}>
                                        {tip.icon}
                                    </span>
                                    <div>
                                        <span className="text-[10px] font-black tracking-[0.2em] text-amber-100/50">STEP 0{index + 1}</span>
                                        <h3 className="text-lg font-black">{tip.title}</h3>
                                    </div>
                                </div>
                                <p className="text-sm leading-6 text-amber-50/75">{tip.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-4 [@media(max-height:820px)]:mt-3 rounded-[18px] border-2 border-red-300/30 bg-red-950/30 p-3 [@media(max-height:820px)]:p-2 text-center">
                        <p className="text-sm font-bold text-red-100">จำไว้: หลักฐานสำคัญกว่าคำพูด และความซื่อสัตย์สำคัญกว่าผลประโยชน์</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.03, y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate("/unit5/level3/game")}
                        className="mx-auto mt-5 [@media(max-height:820px)]:mt-3 flex items-center justify-center gap-3 rounded-[16px] border-b-[5px] border-[#8f4b12] bg-gradient-to-r from-[#f3c64d] via-[#e79421] to-[#c86416] px-8 py-3 text-lg font-black text-[#3d210f] shadow-[6px_7px_0_rgba(80,38,10,.28)]"
                    >
                        เปิดแฟ้มคดีและเริ่มสืบสวน <FaArrowRight />
                    </motion.button>
                </div>
            </div>
        </main>
    );
}