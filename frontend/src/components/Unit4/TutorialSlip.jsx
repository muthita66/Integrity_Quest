import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VscDebugContinue } from "react-icons/vsc";

import deskBg from "../../assets/unit4/teach.jpg";
import jane from "../../assets/unit4/jane.png";

import fontImg from "../../assets/unit4/font.png";
import qrImg from "../../assets/unit4/qr.png";
import timeImg from "../../assets/unit4/time.png";

const lessons = [
    {
        image: null,
        text: `ก่อนจะเริ่มตรวจสลิปจริง ๆ
พี่จะสอนวิธีสังเกตสลิปปลอมให้ก่อนนะ`,
    },

    {
        image: null,
        text: `สลิปปลอมมักมีจุดผิดปกติหลายอย่าง
ถ้าสังเกตดี ๆ จะจับได้ไม่ยาก`,
    },

    {
        image: fontImg,
        text: `จุดสังเกตที่ 1
ฟอนต์แปลก ตัวอักษรไม่ตรงกับของธนาคาร
• ขนาดตัวอักษรไม่เท่ากัน
• ระยะห่างระหว่างตัวอักษรผิดปกติ
• ตัวเลขดูเบลอหรือไม่คมชัด`,
    },

    {
        image: qrImg,
        text: `จุดสังเกตที่ 2
QR Code ใช้งานไม่ได้
• สแกนไม่ติด
• ไม่มีข้อมูลธุรกรรม
• พาไปยังเว็บไซต์แปลก ๆ`,
    },

    {
        image: timeImg,
        text: `จุดสังเกตที่ 3
เวลาโอน ยอดเงิน หรือวันที่ผิดปกติ
• วันเวลาไม่สมเหตุสมผล
• รูปแบบไม่ตรงกับธนาคาร
• ยอดเงินดูผิดปกติ`,
    },

    {
        image: null,
        text: `เยี่ยมเลย!
ตอนนี้เธอพร้อมช่วยพี่เจนตรวจสลิปแล้ว
ไปเริ่มภารกิจกันเลย!`,
    },
];

export default function TutorialSlip() {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [text, setText] = useState("");
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        let index = 0;

        setText("");
        setFinished(false);

        const timer = setInterval(() => {
            setText(lessons[step].text.slice(0, index + 1));
            index++;

            if (index >= lessons[step].text.length) {
                clearInterval(timer);
                setFinished(true);
            }
        }, 30);

        return () => clearInterval(timer);
    }, [step]);

    const nextDialog = () => {
        if (step < lessons.length - 1) {
            setStep(step + 1);
        }
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundImage: `url(${deskBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(rgba(0,0,0,0.15), rgba(0,0,0,0.35))",
                }}
            />

            {/* รูปประกอบ */}
            {lessons[step].image && (
                <div
                    style={{
                        position: "absolute",
                        top: "70px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 3,
                    }}
                >
                    <img
                        src={lessons[step].image}
                        alt="tutorial"
                        style={{
                            width: "650px",
                            borderRadius: "20px",
                            border: "4px solid white",
                            boxShadow:
                                "0 10px 30px rgba(0,0,0,0.35)",
                        }}
                    />
                </div>
            )}

            {/* กล่องบทสนทนา */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "30px",
                    transform: "translateX(-50%)",
                    width: "750px",

                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",

                    border: "2px solid rgba(255,255,255,0.4)",
                    borderRadius: "24px",

                    boxShadow:
                        "0 10px 40px rgba(0,0,0,0.35)",

                    padding: "28px 30px",

                    zIndex: 5,
                }}
            >
                {/* รูปพี่เจน */}
                <img
                    src={jane}
                    alt="Jane"
                    style={{
                        position: "absolute",
                        top: "-155px",
                        left: "20px",

                        width: "180px",

                        filter:
                            "drop-shadow(0 10px 20px rgba(0,0,0,0.4))",
                    }}
                />

                {/* ชื่อ */}
                <div
                    style={{
                        marginLeft: "1px",
                        marginBottom: "12px",
                        textAlign: "left",
                    }}
                >
                    <div
                        style={{
                            color: "#ffffff",
                            fontSize: "30px",
                            fontWeight: "800",
                            fontFamily: "'Trebuchet MS', sans-serif",
                            letterSpacing: "1px",
                            textShadow:
                                "0 2px 10px rgba(0,0,0,0.4)",
                        }}
                    >
                        พี่เจน
                    </div>

                    <div
                        style={{
                            color: "#FFD166",
                            fontSize: "18px",
                            fontWeight: "600",
                            letterSpacing: "0.5px",
                            fontFamily: "'Segoe UI', sans-serif",
                        }}
                    >
                        เจ้าหน้าที่ฝ่ายการเงิน
                    </div>
                </div>

                {/* ข้อความ */}
                <div
                    style={{
                        marginLeft: "100px",

                        color: "#452419ff",

                        fontSize: "24px",
                        fontWeight: "600",

                        lineHeight: "1.5",

                        textAlign: "left",

                        minHeight: "120px",

                        fontFamily:
                            "'Noto Sans Thai', 'Prompt', 'Sarabun', sans-serif",

                        letterSpacing: "0.1px",

                        textShadow:
                            "0 2px 6px rgba(0,0,0,0.35)",

                        maxWidth: "620px",

                        whiteSpace: "pre-line",
                    }}
                >
                    {text}

                    {!finished && (
                        <span
                            style={{
                                animation:
                                    "blink 0.8s infinite",
                            }}
                        >
                            |
                        </span>
                    )}
                </div>

                {/* ปุ่ม */}
                <div
                    style={{
                        textAlign: "right",
                        marginTop: "20px",
                    }}
                >
                    {step < lessons.length - 1 ? (
                        finished && (
                            <button
                                onClick={nextDialog}
                                className="cursor-pointer p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/40 transition"
                                style={{
                                    color: "white",
                                }}
                            >
                                <VscDebugContinue size={26} />
                            </button>
                        )
                    ) : (
                        finished && (
                            <button
                                onClick={() =>
                                    navigate("/unit4/slipMission")
                                }
                                style={{
                                    background: "#48D1CC",

                                    color: "white",
                                    border: "none",

                                    padding:
                                        "16px 38px",

                                    borderRadius: "15px",

                                    fontSize: "20px",
                                    fontWeight: "bold",

                                    cursor: "pointer",

                                    boxShadow:
                                        "0 6px 20px rgba(125,227,162,0.39)",
                                }}
                            >
                                เริ่มตรวจสลิป
                            </button>
                        )
                    )}
                </div>
            </div>

            <style>
                {`
                @keyframes blink {
                    50% {
                        opacity: 0;
                    }
                }
                `}
            </style>
        </div>
    );
}