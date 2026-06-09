import { useState } from "react";

export default function FinalMission() {
    const [hp, setHp] = useState(100);
    const [score, setScore] = useState(0);

    const enemies = [
        "🦠 Virus",
        "🔗 Fake Link",
        "📧 Phishing",
        "💰 Scam",
    ];

    const defend = () => {
        setScore(score + 10);

        if (score >= 90) {
            alert(
                "🏆 คุณเป็น Cyber Guardian!"
            );
        }
    };

    const attackBase = () => {
        setHp(Math.max(0, hp - 10));
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#0f172a",
                color: "white",
                padding: "30px",
            }}
        >
            <h1
                style={{
                    textAlign: "center",
                }}
            >
                🛡 Firewall Defense
            </h1>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginTop: "30px",
                }}
            >
                <div>
                    <h2>🏦 Database HP</h2>
                    <h1>{hp}</h1>
                </div>

                <div>
                    <h2>⭐ Score</h2>
                    <h1>{score}</h1>
                </div>
            </div>

            <div
                style={{
                    marginTop: "50px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >
                {enemies.map((enemy) => (
                    <div
                        key={enemy}
                        style={{
                            width: "220px",
                            background: "#1e293b",
                            padding: "20px",
                            borderRadius: "15px",
                            textAlign: "center",
                        }}
                    >
                        <h2>{enemy}</h2>

                        <button
                            onClick={defend}
                            style={{
                                background: "#22c55e",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: "pointer",
                            }}
                        >
                            ป้องกัน
                        </button>

                        <button
                            onClick={attackBase}
                            style={{
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "10px",
                                cursor: "pointer",
                                marginLeft: "10px",
                            }}
                        >
                            โจมตี
                        </button>
                    </div>
                ))}
            </div>

            {hp <= 0 && (
                <h1
                    style={{
                        color: "red",
                        textAlign: "center",
                        marginTop: "40px",
                    }}
                >
                    GAME OVER
                </h1>
            )}

            {score >= 100 && (
                <h1
                    style={{
                        color: "#22c55e",
                        textAlign: "center",
                        marginTop: "40px",
                    }}
                >
                    🏆 CYBER GUARDIAN
                </h1>
            )}
        </div>
    );
}