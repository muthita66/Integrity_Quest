import { useNavigate } from "react-router-dom";

export default function Intro() {
    const navigate = useNavigate();

    const cardStyle = {
        width: "260px",
        height: "340px",
        background: "#fff",
        border: "2px solid #8B4513",
        borderRadius: "20px",
        padding: "20px",
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1516321497487-e288fb19713f')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: "1100px",
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: "30px",
                    border: "3px solid black",
                    padding: "40px",
                }}
            >
                <div
                    style={{
                        background: "#ff5b00",
                        color: "white",
                        display: "inline-block",
                        padding: "12px 30px",
                        borderRadius: "15px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                    }}
                >
                    Unit 4: Cyber Trap
                </div>

                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "30px",
                    }}
                >
                    DIGITAL SAFETY & FRAUD
                </h1>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "20px",
                    }}
                >
                    {/* Card 1 */}
                    <div style={cardStyle}>
                        <h2>🚨 Investment Scam</h2>

                        <div
                            style={{
                                fontSize: "90px",
                                margin: "20px 0",
                            }}
                        >
                            💸
                        </div>

                        <p>
                            High Return,
                            <br />
                            Zero Risk
                        </p>

                        <h3 style={{ color: "red" }}>= SCAM</h3>

                        <p>
                            ผลตอบแทนสูง
                            <br />
                            ไม่มีความเสี่ยง
                            <br />
                            เป็นสัญญาณของมิจฉาชีพ
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div style={cardStyle}>
                        <h2>⚖️ Mule Account</h2>

                        <div
                            style={{
                                fontSize: "90px",
                                margin: "20px 0",
                            }}
                        >
                            🏦
                        </div>

                        <p>
                            การเปิดบัญชีให้คนอื่นใช้
                            <br />
                            หรือขายบัญชีธนาคาร
                        </p>

                        <h3 style={{ color: "red" }}>
                            จำคุกสูงสุด 3 ปี
                        </h3>
                    </div>

                    {/* Card 3 */}
                    <div style={cardStyle}>
                        <h2>🔍 Fake Slip</h2>

                        <div
                            style={{
                                fontSize: "90px",
                                margin: "20px 0",
                            }}
                        >
                            📄
                        </div>

                        <p>
                            ฟอนต์เพี้ยน
                            <br />
                            QR ใช้งานไม่ได้
                            <br />
                            เวลาโอนไม่ตรง
                        </p>

                        <h3 style={{ color: "green" }}>
                            เช็กยอดในแอปเสมอ
                        </h3>
                    </div>
                </div>

                <div
                    style={{
                        textAlign: "center",
                        marginTop: "30px",
                    }}
                >
                    <button
                        onClick={() => navigate("/unit4/level1")}
                        style={{
                            background: "#ff5b00",
                            color: "white",
                            border: "none",
                            padding: "15px 80px",
                            fontSize: "24px",
                            borderRadius: "20px",
                            cursor: "pointer",
                            fontWeight: "bold",
                        }}
                    >
                        START
                    </button>
                </div>
            </div>
        </div>
    );
}