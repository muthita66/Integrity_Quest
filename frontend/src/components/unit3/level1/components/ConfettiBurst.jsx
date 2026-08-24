import { useMemo } from "react";
import "../../../../../src/styles/unit3/level1/confetti.css";

const CONFETTI_COLORS = [
    "#2F6B4F",
    "#B4802E",
    "#A63D2F",
    "#F8F3E3",
    "#3E7CB1",
    "#D4AF37",
];

export default function ConfettiBurst() {
    const particles = useMemo(() => {
        const COUNT = 80;
        return Array.from({ length: COUNT }).map((_, i) => {
            // แบ่งมุมเท่าๆ กันรอบวง แล้วสุ่มเบี่ยงเล็กน้อยให้ดูธรรมชาติ
            const baseAngle = (360 / COUNT) * i;
            const angle = baseAngle + (Math.random() * 6 - 3);
            const distance = 260 + Math.random() * 180; // ระยะกระเด็นออกไกลขึ้น
            const dx = Math.cos((angle * Math.PI) / 180) * distance;
            const dy = Math.sin((angle * Math.PI) / 180) * distance;
            const size = 6 + Math.random() * 8;
            const isCircle = Math.random() > 0.5;
            return {
                id: i,
                dx,
                dy,
                size,
                isCircle,
                color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
                delay: Math.random() * 0.1,
                duration: 2.2 + Math.random() * 1, // นานขึ้นจากเดิม 0.9-1.5s
                rotate: Math.random() * 1080 - 540,
            };
        });
    }, []);

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            {particles.map((p) => (
                <span
                    key={p.id}
                    className="absolute"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        borderRadius: p.isCircle ? "50%" : "2px",
                        opacity: 0,
                        animation: `confetti-pop ${p.duration}s cubic-bezier(0.15, 0.6, 0.4, 1) ${p.delay}s forwards`,
                        "--dx": `${p.dx}px`,
                        "--dy": `${p.dy}px`,
                        "--rot": `${p.rotate}deg`,
                    }}
                />
            ))}
        </div>
    );
}