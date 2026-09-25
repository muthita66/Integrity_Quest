import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Star from "../../../../assets/unit1/finalLevel/star.png";

import bonusSound from "../../../../assets/sounds/BackgroundGame/Bonus.mp3";
import goodSound from "../../../../assets/sounds/BackgroundGame/Good.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

const LEVEL_ID = 3;

// เสียงตาม Rank
// ปรมาจารย์ / มือฉมัง → Bonus
// เริ่มต้น / ฝึกหัด    → Good
const RANK_SOUNDS = {
    MASTER: bonusSound,
    EXPERT: bonusSound,
    NOVICE: goodSound,
    TRAINEE: goodSound,
};

// Fireworks canvas
function FireworksCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const COLORS = [
            "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1",
            "#96CEB4", "#FFEAA7", "#DDA0DD", "#98FB98",
            "#FFA07A", "#87CEEB", "#B8863B", "#2F6B4F",
        ];

        class Particle {
            constructor(x, y, color) {
                this.x = x;
                this.y = y;
                this.color = color;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 6 + 2;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 1;
                this.radius = Math.random() * 3 + 1.5;
                this.gravity = 0.12;
                this.decay = Math.random() * 0.015 + 0.012;
            }
            update() {
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.alpha);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const particles = [];

        const burst = (x, y) => {
            const color = COLORS[Math.floor(Math.random() * COLORS.length)];
            const color2 = COLORS[Math.floor(Math.random() * COLORS.length)];
            for (let i = 0; i < 80; i++) {
                particles.push(new Particle(x, y, i % 2 === 0 ? color : color2));
            }
        };

        // Fire multiple bursts with staggered timing
        const positions = [
            { x: canvas.width * 0.2, y: canvas.height * 0.3 },
            { x: canvas.width * 0.8, y: canvas.height * 0.25 },
            { x: canvas.width * 0.5, y: canvas.height * 0.2 },
            { x: canvas.width * 0.15, y: canvas.height * 0.55 },
            { x: canvas.width * 0.85, y: canvas.height * 0.5 },
            { x: canvas.width * 0.35, y: canvas.height * 0.15 },
            { x: canvas.width * 0.65, y: canvas.height * 0.18 },
        ];

        const timers = positions.map((pos, i) =>
            setTimeout(() => burst(pos.x, pos.y), i * 220)
        );

        let animId;
        const loop = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].update();
                particles[i].draw();
                if (particles[i].alpha <= 0) particles.splice(i, 1);
            }
            if (particles.length > 0) {
                animId = requestAnimationFrame(loop);
            }
        };
        // Start loop after a tiny delay so first burst is visible
        const startTimer = setTimeout(() => {
            animId = requestAnimationFrame(loop);
        }, 50);

        return () => {
            timers.forEach(clearTimeout);
            clearTimeout(startTimer);
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                zIndex: 9999,
            }}
        />
    );
}

const RANK_STYLES = {
    MASTER: { border: "#B8863B", color: "#8A6D3B" },
    EXPERT: { border: "#2F6B4F", color: "#2F6B4F" },
    NOVICE: { border: "#A32638", color: "#A32638" },
    TRAINEE: { border: "#7A2E2E", color: "#7A2E2E" },
    default: { border: "#A32638", color: "#A32638" },
};

const RANK_STARS = {
    MASTER: 3,
    EXPERT: 2,
    NOVICE: 1,
    TRAINEE: 1,
};

// Main component
export default function EndSummary({ finalLevelResult, cases, onRestart }) {
    const navigate = useNavigate();

    const rank = finalLevelResult?.rank;
    const stampStyle = RANK_STYLES[rank] ?? RANK_STYLES.default;
    const [resultText, setResultText] = useState(null);
    const [messageError, setMessageError] = useState(false);

    useEffect(() => {
        if (!rank) return;

        const fetchResultMessage = async () => {
            try {
                setMessageError(false);

                const response = await fetch(
                    `http://localhost:5000/api/level-result/${LEVEL_ID}/${rank}`
                );

                if (!response.ok) {
                    throw new Error("โหลดข้อความผลลัพธ์ไม่สำเร็จ");
                }

                const data = await response.json();

                setResultText(data.data);
            } catch (error) {
                console.error("Fetch Result Message Error:", error);
                setMessageError(true);
            }
        };

        fetchResultMessage();
    }, [rank]);

    // เล่นเสียงผลลัพธ์ครั้งเดียวตอนหน้าสรุปแสดงขึ้นมา ไม่วน
    const [muted] = useGameMuted();
    const soundPlayedRef = useRef(false);

    useEffect(() => {
        if (!resultText || soundPlayedRef.current) return;
        soundPlayedRef.current = true;

        const src = RANK_SOUNDS[rank];
        if (muted || !src) return;

        const audio = new Audio(src);
        audio.volume = 0.6;
        audio.play().catch(() => { });
    }, [resultText, rank, muted]);

    if (!finalLevelResult || !resultText) {
        return (
            <div className="cid-paper h-full p-4 border-4 border-black text-center flex flex-col items-center justify-center">
                <p className="text-xl sarabun-bold" style={{ color: "#2B2118" }}>
                    {messageError
                        ? "ไม่สามารถโหลดข้อมูลผลลัพธ์ได้"
                        : "กำลังโหลดผลลัพธ์..."}
                </p>
            </div>
        );
    }

    const {
        case_answer_ip: caseAnswerIP,
        bonus_ip: bonusIP,
        earned_ip: earnedIP,
        max_case_ip: maxCaseIP,
        total_integrity_points: totalIntegrityPoints,
    } = finalLevelResult;

    const caseLessons = (cases || []).filter(
        (item) => item.lessonTitle || item.lessonDescription
    );

    return (
        <>
            <style>
                {`
                @keyframes scrapbookPop {
                    0% {
                        opacity: 0;
                        transform: scale(1.5) rotate(-15deg);
                        filter: brightness(1.2);
                    }
                    60% {
                        opacity: 1;
                        transform: scale(0.9) rotate(5deg);
                        filter: brightness(1);
                    }
                    100% {
                        opacity: 1;
                        transform: scale(1) rotate(0deg);
                    }
                }
                `}
            </style>
            {/* Fireworks overlay */}
            <FireworksCanvas />

            <div
                className="cid-paper h-full p-4 border-4 border-black text-center cid-pop flex flex-col"
            >
                <h2
                    className="cid-display text-2xl font-bold shrink-0 mb-2"
                    style={{ color: "#2B2118" }}
                >
                    สรุปผลการสืบคดี
                </h2>

                {/* ── IP ที่ได้ ── */}
                <div className="flex justify-center gap-4 shrink-0 mb-1">
                    <div className="bg-[#F3E9D2] px-4 py-2 flex flex-col items-center min-w[100px]">
                        <p className="text-sm font-semibold" style={{ color: "#8A6D3B" }}>
                            Integrity Points ที่ได้
                        </p>
                        <p className="cid-display text-2xl font-black" style={{ color: "#2F6B4F" }}>
                            +{earnedIP} IP
                        </p>
                        {bonusIP > 0 && (
                            <p className="text-xs font-semibold" style={{ color: "#B8863B" }}>
                                (คำตอบ {caseAnswerIP} + โบนัส Rank {bonusIP})
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Rank Stamp + Stars ── */}
                <div className="flex flex-col items-center mb-2 gap-2 shrink-0">
                    <div
                        className="inline-block px-6 py-2 rounded-lg border-4 cid-stamp-anim"
                        style={{
                            borderColor: stampStyle.border,
                            color: stampStyle.color,
                        }}
                    >
                        <p className="text-base font-black tracking-widest">
                            {resultText.title}
                        </p>
                    </div>

                    {/* Stars */}
                    <div className="flex items-center justify-center gap-3">
                        {Array.from({ length: RANK_STARS[rank] ?? 1 }).map((_, i) => (
                            <img
                                key={i}
                                src={Star}
                                alt="star"
                                style={{
                                    width: 48,
                                    height: 48,
                                    animation: `cidPop 0.35s cubic-bezier(.34,1.56,.64,1) ${0.55 + i * 0.15}s both`,
                                    filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.45)) drop-shadow(0px 2px 2px rgba(184,134,59,0.5))",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* ── Reflection & Lessons ── */}
                <div className="flex flex-col gap-2 mb-2 text-left flex-1 min-h-0 relative mt-6">
                    {/* Character Image (จาก DB ตาม Rank — ไม่ import รูปตรง ๆ อีกต่อไป) */}
                    {resultText.character_image && (
                        <img
                            src={resultText.character_image}
                            alt="Character"
                            className="absolute -top-54 right-2 w-64 h-64 object-contain z-10 drop-shadow-md pointer-events-none"
                            style={{
                                animation: "scrapbookPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s both"
                            }}
                        />
                    )}

                    {/* Reflection (จาก DB) */}
                    <div className="bg-[#F3E9D2] border border-[#C9BB98] rounded-xl p-3 shrink-0 shadow-sm relative">
                        <h3 className="cid-display text-base font-bold mb-1 text-[#8A6D3B]">การสะท้อนผลการเรียนรู้</h3>
                        <p className="text-sm text-[#5A4B30] mb-3 leading-relaxed font-medium">
                            {resultText.description}
                        </p>

                        <h3 className="cid-display text-base font-bold mb-1 text-[#8A6D3B]">สิ่งที่ควรพัฒนาต่อ</h3>
                        <p className="text-sm text-[#5A4B30] leading-relaxed font-medium">
                            {resultText.message}
                        </p>
                    </div>

                    {/* Lessons */}
                    <div className="bg-[#EDE1C4] border border-[#D9C9A1] rounded-xl p-3 flex flex-col min-h-0 flex-1 shadow-sm">
                        <h3 className="cid-display text-base font-bold mb-2 text-[#2F6B4F] shrink-0">
                            บทเรียนจากแต่ละ CASE
                        </h3>
                        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                            <div className="flex flex-col gap-2">
                                {caseLessons.map((item) => (
                                    <div key={item.id} className="border-b border-[#D9C9A1] pb-2 last:border-0 last:pb-0 shrink-0">
                                        <p className="text-sm font-bold text-[#2B2118] mb-1">
                                            {item.code}: <span className="text-[#8A6D3B]"> {item.lessonTitle}</span>
                                        </p>
                                        <p className="text-xs text-[#5A4B30] leading-relaxed font-medium">
                                            {item.lessonDescription}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 shrink-0 mt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/map")}
                        className="result-button result-button-amber"
                    >
                        <span className="result-button-top">กลับหน้าหลัก</span>
                    </button>

                    {rank !== "MASTER" && (
                        <button
                            type="button"
                            onClick={onRestart}
                            className="result-button result-button-red"
                        >
                            <span className="result-button-top">เล่นอีกครั้ง</span>
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/unit2/intro")}
                        className="result-button result-button-green"
                    >
                        <span className="result-button-top">ไปบทถัดไป</span>
                    </button>
                </div>
            </div>
        </>
    );
}