import { useMemo } from "react";
import { createPortal } from "react-dom";
import starIcon from "../../assets/star.png";

// สีพลุกระดาษ (สุ่มใช้ตอนเด้ง popup)
const CONFETTI_COLORS = [
    "#f59e0b",
    "#fbbf24",
    "#f472b6",
    "#34d399",
    "#60a5fa",
    "#a78bfa",
];

const makeConfettiPieces = (count = 36) =>
    Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 3,
        duration: 2.5 + Math.random() * 2,
        drift: Math.round((Math.random() - 0.5) * 160),
        size: 6 + Math.random() * 6,
        rotate: Math.round(Math.random() * 360),
    }));

function StreakRewardModal({ reward, onClose }) {
    // สุ่มพลุกระดาษใหม่ทุกครั้งที่ reward เปลี่ยน (เปิด popup ใหม่)
    const confetti = useMemo(
        () => (reward?.justEarned ? makeConfettiPieces() : []),
        [reward]
    );

    if (!reward?.justEarned) return null;

    return createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                overflow: "hidden",
            }}
            onClick={onClose}
        >

            <style>{`
                @keyframes streakConfettiFall {
                    0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
                    100% { transform: translate(var(--drift), 120vh) rotate(540deg); opacity: 0; }
                }
                @keyframes streakStarGlow {
                    0%, 100% {
                        filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.55))
                                drop-shadow(0 0 0px rgba(250, 204, 21, 0));
                    }
                    50% {
                        filter: drop-shadow(0 0 22px rgba(245, 158, 11, 0.95))
                                drop-shadow(0 0 42px rgba(250, 204, 21, 0.65));
                    }
                }
            `}</style>

            {confetti.map((piece) => (
                <div
                    key={piece.id}
                    style={{
                        position: "absolute",
                        top: "-10%",
                        left: `${piece.left}%`,
                        width: piece.size,
                        height: piece.size * 1.6,
                        background: piece.color,
                        borderRadius: 2,
                        transform: `rotate(${piece.rotate}deg)`,
                        "--drift": `${piece.drift}px`,
                        animation: `streakConfettiFall ${piece.duration}s linear ${piece.delay}s infinite`,
                        pointerEvents: "none",
                    }}
                />
            ))}

            <div
                style={{
                    position: "relative",
                    background: "rgba(255, 255, 255, 0.18)",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(6px)",
                    borderRadius: 20,
                    padding: "32px 28px",
                    maxWidth: 360,
                    width: "90%",
                    textAlign: "center",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="ปิด"
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        border: "none",
                        background: "rgba(0,0,0,0.12)",
                        color: "#5a4632",
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    ✕
                </button>

                <img
                    src={starIcon}
                    alt="ดาวความขยัน"
                    style={{
                        width: 72,
                        height: 72,
                        margin: "0 auto",
                        animation: "streakStarGlow 1.6s ease-in-out infinite",
                    }}
                />

                <h2 style={{ margin: "14px 0 4px", color: "#000000ff" }}>
                    ได้รับดาวความขยัน!
                </h2>

                <p style={{ margin: "0 0 10px", color: "#000000ff", fontSize: 14 }}>
                    เข้าสู่ระบบต่อเนื่อง {reward.streak} วัน
                    <br />
                    สะสมดาวความขยันได้แล้ว {reward.stars} ดวง
                </p>

                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#0a8e0eff",
                    }}
                >
                    ได้รับ Integrity Point {reward.ip} คะแนน
                </div>
            </div>
        </div>,
        document.body
    );
}

export default StreakRewardModal;