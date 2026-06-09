import { useState } from "react";
import { useNavigate } from "react-router-dom";

import SlipCard from "./SlipCard";

import officeBg from "../../assets/unit4/work.jpg";

const slips = [
    {
        id: 1,
        fake: false,

        bank: "SCB",

        sender: "Smart Tech Co.,Ltd",

        receiver: "Integrity Quest",

        amount: "12,500.00 ฿",

        date: "08/06/2026",

        time: "14:25:18",

        transaction: "TRX92451872",
    },

    {
        id: 2,
        fake: true,

        bank: "SCB",

        sender: "Fast Money",

        receiver: "Integrity Quest",

        amount: "8,900.00 ฿",

        date: "08/06/2026",

        time: "25:78:99",

        transaction: "TRX11223344",
    },

    {
        id: 3,
        fake: false,

        bank: "KBank",

        sender: "ABC Company",

        receiver: "Integrity Quest",

        amount: "15,000.00 ฿",

        date: "08/06/2026",

        time: "09:18:31",

        transaction: "TRX55555555",
    },

    {
        id: 4,
        fake: true,

        bank: "KBank",

        sender: "Online Shop",

        receiver: "Integrity Quest",

        amount: "5,200.00 ฿",

        date: "08/06/2026",

        time: "18:44:10",

        transaction: "TRX88888888",
    },

    {
        id: 5,
        fake: false,

        bank: "Krungsri",

        sender: "Tech Plus",

        receiver: "Integrity Quest",

        amount: "7,500.00 ฿",

        date: "08/06/2026",

        time: "11:24:59",

        transaction: "TRX99999999",
    },
];

export default function SlipMission() {
    const navigate = useNavigate();

    const [selected, setSelected] = useState([]);

    const [result, setResult] = useState(null);

    const toggleSlip = (id) => {
        if (selected.includes(id)) {
            setSelected(
                selected.filter(
                    (item) => item !== id
                )
            );
        } else {
            if (selected.length < 2) {
                setSelected([
                    ...selected,
                    id,
                ]);
            }
        }
    };

    const checkAnswer = () => {
        const correct = [2, 4];

        const isCorrect =
            JSON.stringify(
                [...selected].sort()
            ) ===
            JSON.stringify(correct);

        setResult(isCorrect);
    };

    return (
        <div
            style={{
                minHeight: "100vh",

                backgroundImage: `url(${officeBg})`,

                backgroundSize: "cover",

                backgroundPosition: "center",

                padding: "40px",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",

                    margin: "0 auto",

                    background:
                        "rgba(255,255,255,0.9)",

                    borderRadius: "25px",

                    padding: "30px",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                    }}
                >
                    🔍 ภารกิจตรวจสลิป
                </h1>

                <p
                    style={{
                        textAlign: "center",

                        fontSize: "20px",
                    }}
                >
                    มีสลิปปลอม 2 ใบ
                    <br />
                    เลือกให้ถูกต้อง
                </p>

                {/* แถวบน */}
                <div
                    style={{
                        display: "flex",

                        justifyContent:
                            "center",

                        gap: "25px",

                        marginTop: "40px",
                    }}
                >
                    {slips
                        .slice(0, 3)
                        .map((slip) => (
                            <SlipCard
                                key={slip.id}
                                {...slip}
                                selected={selected.includes(
                                    slip.id
                                )}
                                onClick={() =>
                                    toggleSlip(
                                        slip.id
                                    )
                                }
                            />
                        ))}
                </div>

                {/* แถวล่าง */}
                <div
                    style={{
                        display: "flex",

                        justifyContent:
                            "center",

                        gap: "25px",

                        marginTop: "25px",
                    }}
                >
                    {slips
                        .slice(3, 5)
                        .map((slip) => (
                            <SlipCard
                                key={slip.id}
                                {...slip}
                                selected={selected.includes(
                                    slip.id
                                )}
                                onClick={() =>
                                    toggleSlip(
                                        slip.id
                                    )
                                }
                            />
                        ))}
                </div>

                {!result && (
                    <div
                        style={{
                            textAlign: "center",

                            marginTop: "40px",
                        }}
                    >
                        <button
                            onClick={checkAnswer}
                            disabled={
                                selected.length !==
                                2
                            }
                            style={{
                                background:
                                    "#06b6d4",

                                color: "white",

                                border: "none",

                                padding:
                                    "15px 40px",

                                borderRadius:
                                    "15px",

                                fontSize:
                                    "22px",

                                fontWeight:
                                    "bold",

                                cursor:
                                    "pointer",
                            }}
                        >
                            ตรวจคำตอบ
                        </button>
                    </div>
                )}

                {result === true && (
                    <div
                        style={{
                            textAlign: "center",

                            marginTop: "35px",
                        }}
                    >
                        <h2
                            style={{
                                color:
                                    "#16a34a",
                            }}
                        >
                            ✅ ถูกต้อง
                        </h2>

                        <p>
                            คุณหาสลิปปลอมครบ
                            2 ใบแล้ว
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/unit4/level2Slot"
                                )
                            }
                            style={{
                                background:
                                    "#22c55e",

                                color:
                                    "white",

                                border:
                                    "none",

                                padding:
                                    "15px 40px",

                                borderRadius:
                                    "15px",

                                fontSize:
                                    "20px",

                                fontWeight:
                                    "bold",
                            }}
                        >
                            ไปด่านถัดไป →
                        </button>
                    </div>
                )}

                {result === false && (
                    <div
                        style={{
                            textAlign: "center",

                            marginTop: "35px",
                        }}
                    >
                        <h2
                            style={{
                                color:
                                    "#dc2626",
                            }}
                        >
                            ❌ ยังไม่ถูก
                        </h2>

                        <p>
                            ลองสังเกต QR Code
                            และเวลาโอนอีกครั้ง
                        </p>

                        <button
                            onClick={() => {
                                setSelected(
                                    []
                                );
                                setResult(
                                    null
                                );
                            }}
                            style={{
                                background:
                                    "#ef4444",

                                color:
                                    "white",

                                border:
                                    "none",

                                padding:
                                    "15px 40px",

                                borderRadius:
                                    "15px",

                                fontSize:
                                    "20px",

                                fontWeight:
                                    "bold",
                            }}
                        >
                            ลองใหม่
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}