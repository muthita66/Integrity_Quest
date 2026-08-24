import {
    Award,
    CheckCircle2,
    Sparkles,
    XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CASES } from "../data/cases";
import { useEffect, useRef } from "react";
import Star from "../../../../assets/unit1/finalLevel/star.png";
import BgGame from "../../../../assets/unit1/finalLevel/bgGame1.png"

// ── Fireworks canvas ───────────────────────────────────────────────
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

// ── Rank stamp label ───────────────────────────────────────────────
const RANK_STYLES = {
    "นักสืบการเงินระดับปรมาจารย์": { border: "#B8863B", color: "#8A6D3B" },
    "นักสืบการเงินมือฉมัง": { border: "#2F6B4F", color: "#2F6B4F" },
    "นักสืบเริ่มต้น": { border: "#A32638", color: "#A32638" },
    default: { border: "#A32638", color: "#A32638" },
};

// ── Stars per rank ─────────────────────────────────────────────────
const RANK_STARS = {
    "นักสืบการเงินระดับปรมาจารย์": 3,
    "นักสืบการเงินมือฉมัง": 2,
    "นักสืบเริ่มต้น": 1,
};

const RANK_REFLECTIONS = {
    "นักสืบการเงินระดับปรมาจารย์": {
        reflection: "คุณสามารถวิเคราะห์หลักฐานและตัดสินใจได้อย่างรอบคอบตั้งแต่ครั้งแรก แสดงให้เห็นถึงการใช้เหตุผลบนพื้นฐานของข้อเท็จจริง และยึดมั่นในหลักความโปร่งใสในการจัดการทางการเงิน",
        development: "รักษานิสัยการตรวจสอบข้อมูลและหลักฐานอย่างรอบคอบ พร้อมเป็นแบบอย่างในการส่งเสริมความซื่อสัตย์และความรับผิดชอบในการใช้ทรัพยากรส่วนรวม"
    },
    "นักสืบการเงินมือฉมัง": {
        reflection: "คุณสามารถเรียนรู้จากข้อสังเกตและปรับการตัดสินใจได้อย่างเหมาะสม แม้บางสถานการณ์จะต้องทบทวนหลักฐานเพิ่มเติม แต่คุณไม่ด่วนสรุปและพร้อมแก้ไขเมื่อพบข้อมูลใหม่",
        development: "ลองสังเกตรายละเอียดของหลักฐานให้มากขึ้น และเปรียบเทียบข้อมูลจากหลายแหล่งก่อนตัดสินใจ เพื่อเพิ่มความแม่นยำในการวิเคราะห์"
    },
    "นักสืบเริ่มต้น": {
        reflection: "คุณได้เรียนรู้ว่าการตัดสินใจที่ถูกต้องต้องอาศัยการตรวจสอบข้อมูลและหลักฐานอย่างรอบคอบ ทุกความผิดพลาดคือโอกาสในการพัฒนาทักษะการวิเคราะห์และการตัดสินใจ",
        development: "ก่อนสรุปผลในแต่ละสถานการณ์ ลองพิจารณาหลักฐานให้ครบถ้วน เปรียบเทียบข้อมูลจากหลายแหล่ง และใช้เหตุผลประกอบการตัดสินใจมากขึ้น"
    }
};

const CASE_LESSONS = [
    {
        case: "CASE-01",
        title: "เงินทุกบาทควรตรวจสอบได้",
        desc: "การตัดสินใจควรอ้างอิงจากหลักฐานที่ตรวจสอบได้ ไม่ใช่คำบอกเล่าเพียงอย่างเดียว"
    },
    {
        case: "CASE-02",
        title: "ใบเสร็จคือหลักฐานสำคัญ",
        desc: "ก่อนอนุมัติการเบิกจ่าย ควรตรวจสอบรายละเอียดให้ครบถ้วนทุกครั้ง"
    },
    {
        case: "CASE-03",
        title: "ความซื่อสัตย์เริ่มจากเรื่องเล็ก ๆ",
        desc: "การคืนเงินทอนให้ถูกต้องและบันทึกข้อมูลอย่างครบถ้วนช่วยสร้างความไว้วางใจ"
    },
    {
        case: "CASE-04",
        title: "เปรียบเทียบข้อมูลจากหลายหลักฐาน",
        desc: "การตรวจสอบความสอดคล้องของข้อมูลช่วยป้องกันการเบิกจ่ายที่ไม่ถูกต้อง"
    },
    {
        case: "CASE-05",
        title: "ใช้งบประมาณให้ตรงวัตถุประสงค์",
        desc: "การใช้เงินตามวัตถุประสงค์ที่กำหนดไว้ เป็นพื้นฐานของความรับผิดชอบและความโปร่งใส"
    }
];

// ── Main component ─────────────────────────────────────────────────
export default function EndSummary({
    passCount,
    evidencePassCount,
    totalScore,
    results,
    evidenceResults,
    rank,
    onRestart,
}) {
    const navigate = useNavigate();

    const stampStyle = RANK_STYLES[rank] ?? RANK_STYLES.default;

    // คำนวณเปอร์เซ็นต์รวม (จากคำถามและหลักฐาน)
    const maxScore = CASES.length * 2;
    const currentScore = passCount + evidencePassCount;
    const percentage = Math.round((currentScore / maxScore) * 100);

    return (
        <>
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

                {/* ── Summary Stats ── */}
                <div className="flex justify-center gap-4 shrink-0 mb-1">
                    <div className="bg-[#F3E9D2] px-4 py-2 flex flex-col items-center min-w[100px]">
                        <p className="text-sm font-semibold" style={{ color: "#8A6D3B" }}>Integrity Score</p>
                        <p className="cid-display text-2xl font-black" style={{ color: "#2F6B4F" }}>{percentage}%</p>
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
                            {rank}
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
                <div className="flex flex-col gap-2 mb-2 text-left flex-1 min-h-0">
                    {/* Reflection */}
                    <div className="bg-[#F3E9D2] border border-[#C9BB98] rounded-xl p-3 shrink-0 shadow-sm">
                        <h3 className="cid-display text-base font-bold mb-1 text-[#8A6D3B]">การสะท้อนผลการเรียนรู้</h3>
                        <p className="text-sm text-[#5A4B30] mb-3 leading-relaxed font-medium">
                            {RANK_REFLECTIONS[rank]?.reflection}
                        </p>

                        <h3 className="cid-display text-base font-bold mb-1 text-[#8A6D3B]">สิ่งที่ควรพัฒนาต่อ</h3>
                        <p className="text-sm text-[#5A4B30] leading-relaxed font-medium">
                            {RANK_REFLECTIONS[rank]?.development}
                        </p>
                    </div>

                    {/* Lessons */}
                    <div className="bg-[#EDE1C4] border border-[#D9C9A1] rounded-xl p-3 flex flex-col min-h-0 flex-1 shadow-sm">
                        <h3 className="cid-display text-base font-bold mb-2 text-[#2F6B4F] shrink-0">
                            บทเรียนจากแต่ละ CASE
                        </h3>
                        <div className="overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
                            <div className="flex flex-col gap-2">
                                {CASE_LESSONS.map((lesson, idx) => (
                                    <div key={idx} className="border-b border-[#D9C9A1] pb-2 last:border-0 last:pb-0 shrink-0">
                                        <p className="text-sm font-bold text-[#2B2118] mb-1">
                                            {lesson.case}: <span className="text-[#8A6D3B]"> {lesson.title}</span>
                                        </p>
                                        <p className="text-xs text-[#5A4B30] leading-relaxed font-medium">
                                            {lesson.desc}
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
                        className="result-button result-button-yellow"
                    >
                        <span className="result-button-top">กลับหน้าหลัก</span>
                    </button>

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
