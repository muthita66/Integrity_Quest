import { useState } from "react";
import bg_game from "../../assets/bg_game.png";

const questions = [
    "ฉันวางแผนการใช้เงินก่อนใช้จริง",
    "ฉันตั้งงบประมาณรายเดือนให้กับตัวเอง",
    "ฉันคิดว่าการออมเงินเป็นเรื่องสำคัญ",
    "ฉันมีการเก็บเงินอย่างสม่ำเสมอ",
    "ฉันมักใช้เงินตามอารมณ์",
    "ฉันซื้อของโดยไม่จำเป็นบ่อย",
    "ฉันติดตามรายรับ-รายจ่ายของตัวเอง",
    "ฉันสามารถควบคุมการใช้เงินไม่ให้เกินงบได้",
    "ฉันมั่นใจว่าสามารถบริหารเงินได้ดี",
    "ฉันเห็นว่าการมีวินัยทางการเงินสำคัญต่ออนาคต",
];

function PreTest() {
    const [answers, setAnswers] = useState({});

    const handleSelect = (questionIndex, score) => {
        setAnswers((prev) => ({
            ...prev,
            [questionIndex]: score,
        }));
    };

    const handleSubmit = () => {
        const totalScore = Object.values(answers).reduce(
            (sum, value) => sum + value,
            0
        );

        alert(`คะแนนรวม ${totalScore}`);
    };

    return (
        <div
            className="min-h-screen w-full py-10 px-4"
            style={{
                backgroundImage: `url(${bg_game})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="flex justify-center">
                <div
                    className="w-full max-w-6xl relative"
                    style={{
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(12px)",
                        border: "2px solid rgba(255,255,255,.3)",
                        borderRadius: "30px",
                        padding: "30px",
                        boxShadow: "0 8px 30px rgba(0,0,0,.25)",
                    }}
                >
                    {/* Unit */}
                    <div
                        className="absolute top-0 left-0"
                        style={{
                            background: "#ea580c",
                            color: "white",
                            fontWeight: "bold",
                            padding: "12px 24px",
                            borderBottomRightRadius: "20px",
                            fontSize: "18px",
                        }}
                    >
                        Unit 2: กับดักความอยาก
                    </div>

                    {/* Title */}
                    <h1
                        style={{
                            textAlign: "center",
                            color: "white",
                            fontSize: "42px",
                            fontWeight: "800",
                            marginTop: "20px",
                            marginBottom: "20px",
                            textShadow: "0 4px 12px rgba(0,0,0,.5)",
                        }}
                    >
                        📜 Pre-Test
                    </h1>

                    {/* Description */}
                    <div
                        style={{
                            textAlign: "center",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "20px",
                            marginBottom: "35px",
                            textShadow: "0 2px 8px rgba(0,0,0,.5)",
                        }}
                    >
                        กรุณาให้คะแนนตามระดับความคิดเห็นของท่าน
                        <br />
                        1 = ไม่เห็นด้วยอย่างยิ่ง |
                        2 = ไม่เห็นด้วย |
                        3 = ปานกลาง |
                        4 = เห็นด้วย |
                        5 = เห็นด้วยอย่างยิ่ง
                    </div>

                    {/* Questions */}
                    {questions.map((question, qIndex) => (
                        <div
                            key={qIndex}
                            style={{
                                background: "rgba(255,255,255,.12)",
                                border: "1px solid rgba(255,255,255,.2)",
                                borderRadius: "18px",
                                padding: "18px 24px",
                                marginBottom: "12px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                backdropFilter: "blur(5px)",
                            }}
                        >
                            <div
                                style={{
                                    color: "white",
                                    fontSize: "20px",
                                    fontWeight: "600",
                                    flex: 1,
                                    textAlign: "left",
                                    paddingRight: "30px",
                                    textShadow: "0 2px 8px rgba(0,0,0,.5)",
                                }}
                            >
                                {qIndex + 1}. {question}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "12px",
                                    minWidth: "320px",
                                    justifyContent: "flex-end",
                                }}
                            >
                                {[1, 2, 3, 4, 5].map((score) => (
                                    <button
                                        key={score}
                                        onClick={() =>
                                            handleSelect(qIndex, score)
                                        }
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "50%",
                                            border: "3px solid white",
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                            fontSize: "16px",
                                            transition: ".2s",

                                            color:
                                                answers[qIndex] === score
                                                    ? "white"
                                                    : "#444",

                                            background:
                                                answers[qIndex] === score
                                                    ? "linear-gradient(135deg,#34d399,#10b981)"
                                                    : "rgba(255,255,255,.85)",

                                            boxShadow:
                                                answers[qIndex] === score
                                                    ? "0 0 18px rgba(16,185,129,.9)"
                                                    : "none",
                                        }}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Submit */}
                    <div
                        style={{
                            textAlign: "center",
                            marginTop: "30px",
                        }}
                    >
                        <button
                            onClick={handleSubmit}
                            style={{
                                background:
                                    "linear-gradient(135deg,#ff9a00,#ff4d00)",
                                border: "none",
                                color: "white",
                                padding: "18px 60px",
                                borderRadius: "999px",
                                fontSize: "24px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                boxShadow:
                                    "0 10px 20px rgba(255,77,0,.4)",
                            }}
                        >
                            SUBMIT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PreTest;