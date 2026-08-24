import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function BookContents({

    progress,

}) {

    const navigate = useNavigate();

    const chapters = [

        {

            id: 1,

            title: "Chapter I",

            subtitle: "Fake Slip Investigation",

            difficulty: 5,

            unlocked: true,

            description:

                "เรียนรู้การตรวจสอบสลิปปลอมจากจุดสังเกตต่าง ๆ",

            route: "/unit4/level1/intro",

        },

        {

            id: 2,

            title: "Chapter II",

            subtitle: "Tax Investigation",

            difficulty: 5,

            unlocked: progress.level2,

            description:

                "ปลดล็อกหลังผ่าน Chapter I",

            route: "/unit4/level2/intro",

        },

        {

            id: 3,

            title: "Chapter III",

            subtitle: "Final Investigation",

            difficulty: 5,

            unlocked: progress.level3,

            description:

                "ปลดล็อกหลังผ่าน Chapter II",

            route: "/unit4/level3/intro",

        },

    ];

    return (

        <div

            style={{

                width: "100%",

                height: "100%",

                display: "flex",

                flexDirection: "column",

                fontFamily: "'Noto Serif Thai','Cormorant Garamond',serif",

            }}

        >

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Noto+Serif+Thai:wght@400;500;600;700&display=swap');
            `}</style>

            <div

                style={{

                    color: "#A9761D",

                    fontWeight: 700,

                    letterSpacing: 4,

                    fontSize: 12,

                    fontFamily: "'Cinzel',serif",

                }}

            >

                CONTENTS

            </div>

            <h1

                style={{

                    marginTop: 15,

                    color: "#4C3315",

                    fontSize: 40,

                    fontFamily: "'Cinzel',serif",

                    fontWeight: 700,

                }}

            >

                Cyber Trap

            </h1>

            <p

                style={{

                    color: "#7B623E",

                    lineHeight: 1.8,

                    marginBottom: 35,

                }}

            >

                เลือกภารกิจที่ต้องการเล่น

                ผ่านแต่ละด่านเพื่อปลดล็อก

                ภารกิจถัดไป

            </p>

            <div

                style={{

                    display: "flex",

                    flexDirection: "column",

                    gap: 20,

                }}

            ></div>
            {chapters.map((chapter) => (

                <motion.div

                    key={chapter.id}

                    whileHover={
                        chapter.unlocked
                            ? {
                                scale: 1.02,
                                x: 6,
                            }
                            : {}
                    }

                    whileTap={
                        chapter.unlocked
                            ? {
                                scale: .98,
                            }
                            : {}
                    }

                    onClick={() => {

                        if (chapter.unlocked) {

                            navigate(chapter.route);

                        }

                    }}

                    style={{

                        cursor:
                            chapter.unlocked
                                ? "pointer"
                                : "default",

                        borderRadius: 22,

                        padding: 24,

                        background: "#FFF8EA",

                        border: "2px solid #E7C985",

                        boxShadow:
                            "0 12px 28px rgba(0,0,0,.08)",

                    }}

                >

                    {/* Header */}

                    <div

                        style={{

                            display: "flex",

                            justifyContent: "space-between",

                            alignItems: "center",

                        }}

                    >

                        <div>

                            <div

                                style={{

                                    color: "#A9761D",

                                    fontWeight: 700,

                                    letterSpacing: 3,

                                    fontSize: 12,

                                    fontFamily: "'Cinzel',serif",

                                }}

                            >

                                {chapter.title}

                            </div>

                            <h2

                                style={{

                                    marginTop: 8,

                                    color: "#4B3215",

                                    fontSize: 26,

                                    fontFamily: "'Noto Serif Thai','Cormorant Garamond',serif",

                                    fontWeight: 700,

                                }}

                            >

                                {chapter.subtitle}

                            </h2>

                        </div>

                        <div

                            style={{

                                fontSize: 42,

                            }}

                        >

                            {

                                chapter.unlocked

                                    ? "📖"

                                    : "🔒"

                            }

                        </div>

                    </div>

                    {/* Description */}

                    <p

                        style={{

                            marginTop: 18,

                            color: "#735C39",

                            lineHeight: 1.8,

                        }}

                    >

                        {chapter.description}

                    </p>

                    {/* Difficulty */}

                    <div

                        style={{

                            marginTop: 20,

                            display: "flex",

                            gap: 4,

                            fontSize: 22,

                        }}

                    >

                        {

                            Array.from({

                                length: chapter.difficulty

                            }).map((_, i) => (

                                <span key={i}>

                                    ⭐

                                </span>

                            ))

                        }

                    </div>
                    {/* Action */}

                    <div

                        style={{

                            marginTop: 24,

                            display: "flex",

                            justifyContent: "space-between",

                            alignItems: "center",

                        }}

                    >

                        {/* Status */}

                        <div>

                            {

                                chapter.id === 1 && progress.level1 && (

                                    <div

                                        style={{

                                            display: "inline-flex",

                                            alignItems: "center",

                                            gap: 8,

                                            padding: "10px 18px",

                                            borderRadius: 999,

                                            background: "#E9FFF2",

                                            color: "#169B62",

                                            fontWeight: "bold",

                                        }}

                                    >

                                        ✔ COMPLETE

                                    </div>

                                )

                            }

                            {

                                chapter.id !== 1 && !chapter.unlocked && (

                                    <div

                                        style={{

                                            display: "inline-flex",

                                            alignItems: "center",

                                            gap: 8,

                                            padding: "10px 18px",

                                            borderRadius: 999,

                                            background: "#ECECEC",

                                            color: "#888",

                                            fontWeight: "bold",

                                        }}

                                    >

                                        🔒 LOCKED

                                    </div>

                                )

                            }

                            {

                                chapter.unlocked &&

                                !(chapter.id === 1 && progress.level1) && (

                                    <div

                                        style={{

                                            display: "inline-flex",

                                            alignItems: "center",

                                            gap: 8,

                                            padding: "10px 18px",

                                            borderRadius: 999,

                                            background: "#FFF4D5",

                                            color: "#9A6A00",

                                            fontWeight: "bold",

                                        }}

                                    >

                                        READY

                                    </div>

                                )

                            }

                        </div>

                        {/* Button */}

                        {

                            chapter.unlocked && (

                                <motion.button

                                    whileHover={{

                                        scale: 1.05,

                                    }}

                                    whileTap={{

                                        scale: .95,

                                    }}

                                    onClick={(e) => {

                                        e.stopPropagation();

                                        navigate(chapter.route);

                                    }}

                                    style={{

                                        border: "none",

                                        cursor: "pointer",

                                        padding: "14px 28px",

                                        borderRadius: 14,

                                        background:

                                            "linear-gradient(135deg,#FCE8A8 0%,#E8C15E 32%,#D4AF37 68%,#A9761D 100%)",

                                        color: "#4B3214",

                                        fontWeight: "bold",

                                        fontSize: 16,

                                        boxShadow:

                                            "0 10px 25px rgba(154,110,14,.35), inset 0 1px 0 rgba(255,255,255,.55), inset 0 -2px 3px rgba(0,0,0,.14)",

                                    }}

                                >

                                    ▶ START

                                </motion.button>

                            )

                        }

                    </div>

                </motion.div>

            ))}

            {/* ================= PROGRESS ================= */}

            <div

                style={{

                    marginTop: 35,

                    padding: 22,

                    borderRadius: 18,

                    background: "#FFFDF5",

                    border: "2px solid #E6D1A2",

                }}

            >

                <div

                    style={{

                        color: "#A9761D",

                        fontWeight: 700,

                        marginBottom: 12,

                        letterSpacing: 2,

                        fontSize: 12,

                        fontFamily: "'Cinzel',serif",

                    }}

                >

                    UNIT PROGRESS

                </div>

                <div

                    style={{

                        display: "flex",

                        gap: 12,

                        alignItems: "center",

                    }}

                >

                    <div

                        style={{

                            flex: 1,

                            height: 12,

                            borderRadius: 999,

                            background: "#E8E8E8",

                            overflow: "hidden",

                        }}

                    >

                        <motion.div

                            animate={{

                                width: `${(
                                    (progress.level1 ? 1 : 0) +
                                    (progress.level2 ? 1 : 0) +
                                    (progress.level3 ? 1 : 0)
                                ) / 3 * 100
                                    }%`

                            }}

                            transition={{

                                duration: .6,

                            }}

                            style={{

                                height: "100%",

                                background:
                                    "linear-gradient(90deg,#E8C15E,#D4AF37 50%,#A9761D)",

                            }}

                        />

                    </div>

                    <span

                        style={{

                            color: "#6F5A37",

                            fontWeight: "bold",

                        }}

                    >

                        {
                            (progress.level1 ? 1 : 0) +
                            (progress.level2 ? 1 : 0) +
                            (progress.level3 ? 1 : 0)
                        } / 3

                    </span>

                </div>

            </div>
            {/* ================= TIPS ================= */}

            <motion.div

                initial={{

                    opacity: 0,

                    y: 20,

                }}

                animate={{

                    opacity: 1,

                    y: 0,

                }}

                transition={{

                    delay: .3,

                }}

                style={{

                    marginTop: 30,

                    padding: 22,

                    borderRadius: 18,

                    background:
                        "linear-gradient(135deg,#FFF8E7,#F5E8C8)",

                    border: "2px solid #E7C985",

                }}

            >

                <div

                    style={{

                        color: "#A67C22",

                        fontWeight: "bold",

                        marginBottom: 12,

                        fontSize: 18,

                    }}

                >

                    📚 Detective's Note

                </div>

                <p

                    style={{

                        color: "#6E5735",

                        lineHeight: 1.8,

                        margin: 0,

                    }}

                >

                    ผ่านภารกิจแต่ละด่านเพื่อปลดล็อก
                    ด่านถัดไป

                    <br />

                    ทุก Chapter จะสอนทักษะใหม่
                    เกี่ยวกับการป้องกันการทุจริต
                    และการใช้เทคโนโลยีอย่างปลอดภัย

                </p>

            </motion.div>

            {/* ================= FOOTER ================= */}

            <div

                style={{

                    marginTop: "auto",

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    paddingTop: 25,

                }}

            >

                <button

                    onClick={() => navigate("/map")}

                    style={{

                        border: "none",

                        cursor: "pointer",

                        padding: "14px 26px",

                        borderRadius: 14,

                        background: "#ECECEC",

                        color: "#555",

                        fontWeight: "bold",

                    }}

                >

                    ← กลับแผนที่

                </button>

                <div

                    style={{

                        color: "#9B7A42",

                        fontWeight: 700,

                        letterSpacing: 2,

                        fontSize: 12,

                        fontFamily: "'Cinzel',serif",

                    }}

                >

                    CYBER TRAP • UNIT IV

                </div>

            </div>

        </div>

    );

}