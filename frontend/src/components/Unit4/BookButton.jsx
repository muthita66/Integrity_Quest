import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaArrowRight,
    FaLock,
    FaPlay,
} from "react-icons/fa";

const chapters = [
    {
        id: 1,
        title: "วันแรกของการทำงาน",
        subtitle: "Chapter I",
        icon: "🏢",
        locked: false,
        description:
            "เริ่มต้นชีวิตการทำงานและเรียนรู้การตรวจสอบสลิปโอนเงิน",
    },
    {
        id: 2,
        title: "Slot Machine",
        subtitle: "Chapter II",
        icon: "🎰",
        locked: true,
        description:
            "ปลดล็อกหลังผ่านด่านแรก",
    },
    {
        id: 3,
        title: "Final Mission",
        subtitle: "Chapter III",
        icon: "👑",
        locked: true,
        description:
            "ภารกิจสุดท้ายของ Cyber Trap",
    },
];

export default function ChapterMenu({
    selected,
    setSelected,
    onBack,
    onStart,
}) {

    const current =
        chapters.find(c => c.id === selected) || chapters[0];

    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: .9,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            style={{
                width: 1180,
                maxWidth: "95%",
                height: 680,
                display: "flex",
                borderRadius: 26,
                overflow: "hidden",
                background: "#f8f2e7",
                boxShadow:
                    "0 40px 80px rgba(0,0,0,.45)",
                position: "relative",
                zIndex: 1,
                fontFamily: "'Noto Serif Thai','Cormorant Garamond',serif",
            }}
        >

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Noto+Serif+Thai:wght@400;500;600;700&display=swap');
            `}</style>

            {/* LEFT PAGE */}

            <div
                style={{
                    flex: 1,
                    padding: 45,
                    display: "flex",
                    flexDirection: "column",
                    background:
                        "linear-gradient(90deg,#f8f1df,#efe3c8)",
                }}
            >

                <span
                    style={{
                        color: "#A9761D",
                        fontWeight: 700,
                        letterSpacing: 4,
                        fontSize: 12,
                        fontFamily: "'Cinzel',serif",
                    }}
                >
                    CYBER TRAP
                </span>

                <h1
                    style={{
                        marginTop: 10,
                        fontSize: 42,
                        color: "#49351d",
                        fontFamily: "'Cinzel',serif",
                        fontWeight: 700,
                    }}
                >
                    Interactive Story
                </h1>

                <div
                    style={{
                        width: 120,
                        height: 3,
                        background: "linear-gradient(90deg,#D4AF37,#E8C15E,transparent)",
                        margin: "25px 0",
                    }}
                />

                {chapters.map((chapter) => (
                    <motion.div

                        key={chapter.id}

                        whileHover={{
                            scale: 1.03,
                            x: 8,
                        }}

                        onClick={() => {
                            if (!chapter.locked) {
                                setSelected(chapter.id);
                            }
                        }}

                        style={{
                            cursor:
                                chapter.locked
                                    ? "not-allowed"
                                    : "pointer",

                            padding: 20,
                            borderRadius: 18,

                            marginBottom: 18,

                            background:
                                selected === chapter.id
                                    ? "#fff8e8"
                                    : "#f6eedc",

                            border:
                                selected === chapter.id
                                    ? "2px solid #d7b159"
                                    : "2px solid transparent",

                            display: "flex",
                            alignItems: "center",
                            gap: 18,
                        }}
                    >

                        <div
                            style={{
                                fontSize: 42,
                            }}
                        >
                            {chapter.icon}
                        </div>

                        <div
                            style={{
                                flex: 1,
                            }}
                        >
                            <div
                                style={{
                                    fontWeight: 700,
                                    color: "#A9761D",
                                    letterSpacing: 2,
                                    fontSize: 11,
                                    fontFamily: "'Cinzel',serif",
                                }}
                            >
                                {chapter.subtitle}
                            </div>

                            <div
                                style={{
                                    marginTop: 5,
                                    fontSize: 22,
                                    color: "#49351d",
                                    fontFamily: "'Noto Serif Thai','Cormorant Garamond',serif",
                                    fontWeight: 700,
                                }}
                            >
                                {chapter.title}
                            </div>

                        </div>

                        {chapter.locked && (
                            <FaLock
                                color="#777"
                                size={20}
                            />
                        )}

                    </motion.div>
                ))}
                {/* Bottom */}

                <div
                    style={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <button
                        onClick={onBack}
                        style={{
                            padding: "14px 24px",
                            borderRadius: 12,
                            border: "none",
                            cursor: "pointer",
                            background: "#ddd",
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            fontWeight: "bold",
                        }}
                    >
                        <FaArrowLeft />
                        กลับ
                    </button>

                    <button
                        disabled={current.locked}
                        onClick={() => onStart(current)}
                        style={{
                            padding: "16px 34px",
                            borderRadius: 14,
                            border: "none",
                            cursor: current.locked
                                ? "not-allowed"
                                : "pointer",

                            background: current.locked
                                ? "#bdbdbd"
                                : "linear-gradient(135deg,#FCE8A8 0%,#E8C15E 32%,#D4AF37 68%,#A9761D 100%)",
                            boxShadow: current.locked
                                ? "none"
                                : "0 10px 25px rgba(154,110,14,.35), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 3px rgba(0,0,0,.14)",

                            color: "#4b2d00",
                            fontWeight: 700,
                            fontSize: 16,
                            letterSpacing: 1,
                            fontFamily: "'Cinzel',serif",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <FaPlay />
                        เริ่มภารกิจ
                    </button>
                </div>

            </div>

            {/* BOOK SPINE */}

            <div
                style={{
                    width: 18,
                    background:
                        "linear-gradient(90deg,#8d7146,#bea47b,#8d7146)",
                }}
            />

            {/* RIGHT PAGE */}

            <div
                style={{
                    flex: 1,
                    background:
                        "linear-gradient(90deg,#fffdf8,#f7f0e3)",
                    padding: 45,
                    display: "flex",
                    flexDirection: "column",
                }}
            >

                <motion.div
                    key={current.id}
                    initial={{
                        opacity: 0,
                        x: 30,
                    }}
                    animate={{
                        opacity: 1,
                        x: 0,
                    }}
                    transition={{
                        duration: .35,
                    }}
                >

                    <div
                        style={{
                            width: "100%",
                            height: 240,
                            borderRadius: 20,
                            background:
                                "linear-gradient(145deg,#d8c29a,#f5e8c9)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: 110,
                        }}
                    >
                        {current.icon}
                    </div>

                    <div
                        style={{
                            marginTop: 30,
                            color: "#B48B36",
                            fontWeight: "bold",
                            letterSpacing: 2,
                        }}
                    >
                        {current.subtitle}
                    </div>

                    <h1
                        style={{
                            marginTop: 10,
                            color: "#4a3215",
                        }}
                    >
                        {current.title}
                    </h1>

                    <p
                        style={{
                            marginTop: 25,
                            lineHeight: 2,
                            fontSize: 18,
                            color: "#555",
                        }}
                    >
                        {current.description}
                    </p>

                    <div
                        style={{
                            marginTop: 35,
                            padding: 18,
                            borderRadius: 16,
                            background: "#fff7e7",
                            border: "1px solid #e5d4a8",
                        }}
                    >
                        <div
                            style={{
                                fontWeight: "bold",
                                color: "#8a6a2b",
                                marginBottom: 10,
                            }}
                        >
                            🎯 เป้าหมาย
                        </div>

                        {current.id === 1 && (
                            <ul
                                style={{
                                    lineHeight: 2,
                                    paddingLeft: 20,
                                }}
                            >
                                <li>พูดคุยกับพี่เจน</li>
                                <li>เรียนรู้การตรวจสอบสลิป</li>
                                <li>เตรียมเข้าสู่ภารกิจแรก</li>
                            </ul>
                        )}

                        {current.id === 2 && (
                            <ul
                                style={{
                                    lineHeight: 2,
                                    paddingLeft: 20,
                                }}
                            >
                                <li>ผ่านด่านที่ 1 ก่อน</li>
                            </ul>
                        )}

                        {current.id === 3 && (
                            <ul
                                style={{
                                    lineHeight: 2,
                                    paddingLeft: 20,
                                }}
                            >
                                <li>ผ่านทุก Chapter ก่อน</li>
                            </ul>
                        )}

                    </div>

                </motion.div>

            </div>

        </motion.div>
    );
}