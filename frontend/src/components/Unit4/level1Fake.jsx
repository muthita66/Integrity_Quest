import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { VscDebugContinue } from "react-icons/vsc";

import officeBg from "../../assets/unit4/work.jpg";
import jane from "../../assets/unit4/jane.png";

const dialogs = [
    `เดี๋ยวนี้สลิปเงินเข้าบริษัทเยอะจนแยกไม่ออกแล้ว...
อันไหนเป็นสลิปจริง อันไหนเป็นสลิปปลอม`,

    `มีมิจฉาชีพส่งสลิปปลอมมาหลอกว่าโอนเงินแล้วอยู่บ่อย ๆ
บางทีส่งสลิปมาเหมือนจริงมากจนดูแทบไม่ออก
ช่วยพี่ตรวจสอบสลิปพวกนี้หน่อยนะ`,
];

export default function Level1Fake() {
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [text, setText] = useState("");
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        let index = 0;

        setText("");
        setFinished(false);

        const timer = setInterval(() => {
            setText(dialogs[step].slice(0, index + 1));
            index++;

            if (index >= dialogs[step].length) {
                clearInterval(timer);
                setFinished(true);
            }
        }, 35);

        return () => clearInterval(timer);
    }, [step]);

    const nextDialog = () => {
        if (step < dialogs.length - 1) {
            setStep(step + 1);
        }
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundImage: `url(${officeBg})`,
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

            {/* กล่องบทสนทนา */}
            <div
                style={{
                    position: "absolute",
                    left: "50%",
                    bottom: "30px",
                    transform: "translateX(-50%)",
                    width: "850px",
                    minHeight: "150px",

                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(12px)",

                    border: "2px solid rgba(255,255,255,0.4)",
                    borderRadius: "24px",

                    boxShadow:
                        "0 10px 40px rgba(0,0,0,0.35)",

                    padding: "28px 35px",

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

                        color: "#F8FAFC",

                        fontSize: "24px",
                        fontWeight: "600",

                        lineHeight: "1.5",

                        textAlign: "left",


                        minHeight: "55px",

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
                    {step < dialogs.length - 1 ? (
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
                                    navigate("/unit4/tutorialSlip")
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
                                        "0 6px 20px rgba(125, 227, 162, 0.39)",
                                }}
                            >
                                เข้าไปช่วยพี่เจน
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