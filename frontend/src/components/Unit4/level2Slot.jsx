import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Level2Slot() {
    const navigate = useNavigate();

    const [money, setMoney] = useState(1000);
    const [message, setMessage] = useState("");

    const spin = () => {
        if (money <= 0) {
            navigate("/unit4/final");
            return;
        }

        const rand = Math.random();

        if (rand < 0.7) {
            setMoney((m) => Math.max(0, m - 200));
            setMessage("❌ แพ้");
        } else if (rand < 0.95) {
            setMoney((m) => m + 50);
            setMessage("🙂 ได้คืนเล็กน้อย");
        } else {
            setMoney((m) => m + 300);
            setMessage("🎉 ชนะ!");
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#111827",
                color: "white",
                textAlign: "center",
                paddingTop: "60px",
            }}
        >
            <h1>🎰 Level 2 : Gambling Trap</h1>

            <h2
                style={{
                    marginTop: "40px",
                    fontSize: "40px",
                }}
            >
                เงินคงเหลือ
            </h2>

            <div
                style={{
                    fontSize: "80px",
                    color: "#facc15",
                    marginTop: "20px",
                }}
            >
                ฿ {money}
            </div>

            <button
                onClick={spin}
                style={{
                    marginTop: "40px",
                    padding: "20px 60px",
                    fontSize: "28px",
                    borderRadius: "20px",
                    border: "none",
                    background: "#f97316",
                    color: "white",
                    cursor: "pointer",
                }}
            >
                🎰 SPIN
            </button>

            <h2 style={{ marginTop: "30px" }}>
                {message}
            </h2>

            {money <= 0 && (
                <div
                    style={{
                        marginTop: "50px",
                    }}
                >
                    <h2>
                        ระบบถูกออกแบบให้เจ้ามือได้เปรียบ
                    </h2>

                    <button
                        onClick={() =>
                            navigate("/unit4/final")
                        }
                        style={{
                            padding: "15px 40px",
                            fontSize: "20px",
                            borderRadius: "15px",
                            border: "none",
                            background: "#22c55e",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        ไป Final Mission
                    </button>
                </div>
            )}
        </div>
    );
}