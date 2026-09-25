import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import WordCard from "./Wordcard";
import ClueCard from "./ClueCard";
import MissionComplete from "./MissionComplete";

export default function GameLevel1() {
    const words = [
        { id: 1, answer: "สินบน", clue: "เงินหรือของที่ให้เพื่อแลกกับสิทธิพิเศษ", revealed: 2 },
        { id: 2, answer: "ใต้โต๊ะ", clue: "การจ่ายเงินแบบไม่เปิดเผย", revealed: 1 },
        { id: 3, answer: "โปร่งใส", clue: "การทำงานที่ตรวจสอบได้", revealed: 2 },
        { id: 4, answer: "ทุจริต", clue: "การทำผิดกฎเพื่อผลประโยชน์ส่วนตัว", revealed: 1 },
        { id: 5, answer: "ยักยอก", clue: "การนำเงินของผู้อื่นไปใช้โดยมิชอบ", revealed: 1 },
        { id: 6, answer: "ร้องเรียน", clue: "การแจ้งเมื่อพบการกระทำที่ไม่ถูกต้อง", revealed: 1 },
    ];

    const [completed, setCompleted] = useState({});
    const [seconds, setSeconds] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const [lines, setLines] = useState([]);

    // refs สำหรับวัดตำแหน่งจริงของการ์ด แทนพิกัด pixel ที่ hardcode ไว้เดิม
    const boardRef = useRef(null);
    const answerRefs = useRef({});
    const clueRefs = useRef({});

    const correctCount = useMemo(
        () => Object.values(completed).filter(Boolean).length,
        [completed]
    );

    const progress = (correctCount / words.length) * 100;

    // นาฬิกานับเวลา — หยุดทันทีเมื่อภารกิจสำเร็จ (บั๊กเดิม: นับต่อไปเรื่อย ๆ ไม่หยุด)
    useEffect(() => {
        if (showComplete) return;
        const timer = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [showComplete]);

    // บั๊กเดิม: words.lenght (พิมพ์ผิด) ทำให้ dependency array ไม่ทำงานตามที่ตั้งใจ
    useEffect(() => {
        if (correctCount === words.length) {
            const t = setTimeout(() => setShowComplete(true), 800);
            return () => clearTimeout(t);
        }
    }, [correctCount, words.length]);

    const handleCorrect = (id) => {
        setCompleted((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    };

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    // คำนวณเส้นเชื่อมจากตำแหน่งจริงของการ์ด (แก้บั๊กเส้นไม่ตรง/ไม่ครบเมื่อขนาดการ์ดหรือหน้าจอไม่ตรงกับพิกัดที่ hardcode ไว้)
    const recomputeLines = () => {
        const boardEl = boardRef.current;
        if (!boardEl) return;
        const boardRect = boardEl.getBoundingClientRect();

        const next = words
            .map((word) => {
                const a = answerRefs.current[word.id];
                const c = clueRefs.current[word.id];
                if (!a || !c) return null;
                const aRect = a.getBoundingClientRect();
                const cRect = c.getBoundingClientRect();
                return {
                    id: word.id,
                    x1: aRect.left + aRect.width / 2 - boardRect.left,
                    y1: aRect.top + 18 - boardRect.top,
                    x2: cRect.left + cRect.width / 2 - boardRect.left,
                    y2: cRect.top + 18 - boardRect.top,
                };
            })
            .filter(Boolean);

        setLines(next);
    };

    useLayoutEffect(() => {
        recomputeLines();
        // เผื่อฟอนต์โหลดช้าแล้วทำให้ขนาดการ์ดเปลี่ยนหลัง mount ครั้งแรก
        const raf = requestAnimationFrame(recomputeLines);
        const t = setTimeout(recomputeLines, 300);

        const ro = new ResizeObserver(recomputeLines);
        if (boardRef.current) ro.observe(boardRef.current);
        window.addEventListener("resize", recomputeLines);

        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(t);
            ro.disconnect();
            window.removeEventListener("resize", recomputeLines);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [completed]);

    return (
        <div className="h-screen flex flex-col p-4 bg-[#241408] text-[#f4eae1] select-none overflow-hidden relative">

            {/* พื้นผิวไม้/คอร์กบอร์ดแบบ subtle เพิ่มมิติให้พื้นหลัง */}
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_10%,rgba(255,180,80,0.06),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(255,140,60,0.05),transparent_45%)]" />

            <div className="w-full h-full flex flex-col mx-auto max-w-[1440px] relative">

                {/* --- Header Area --- */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative bg-[#362116] rounded-[20px] px-10 py-4 mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[#4a3022]"
                >
                    <div className="absolute top-2 left-2 w-3 h-3 bg-amber-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

                    <div className="flex items-center gap-8 px-4 font-mono">
                        <div className="text-xl tracking-widest text-[#c2b0a2]">
                            TIME: <span className="font-bold text-amber-400 tabular-nums">{formatTime()}</span>
                        </div>

                        <div className="text-xl tracking-widest text-[#c2b0a2]">
                            EVIDENCE: <span className="font-bold text-amber-500 tabular-nums">{correctCount}/{words.length}</span>
                        </div>

                        <div className="flex-1">
                            <div className="h-3 bg-[#21130c] rounded-full overflow-hidden border border-[#4a3022]">
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                    className="h-full bg-gradient-to-r from-amber-700 to-amber-500 shadow-[0_0_10px_#f59e0b]"
                                />
                            </div>
                        </div>

                        <div className="text-lg font-bold tracking-widest text-amber-600 border border-amber-600 px-4 py-0.5 rounded bg-[#21130c]/50">
                            CONFIDENTIAL
                        </div>
                    </div>
                </motion.div>

                {/* --- Board Area --- */}
                <div
                    className="w-full flex-1 relative overflow-hidden rounded-[20px] shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] border-4 border-[#261710]"
                    style={{
                        backgroundColor: "#3a251a",
                        backgroundImage:
                            "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 26px)," +
                            "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.04), transparent 30%)",
                    }}
                >
                    <div ref={boardRef} className="relative w-full h-full min-w-0 px-5 py-4 flex flex-col">

                        {/* vignette ด้านใน ให้ความรู้สึกเหมือนสปอตไลท์กลางกระดาน */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(20,10,5,0.55)_100%)] pointer-events-none z-10" />

                        {/* --- เส้นด้ายโยงเบาะแส (คำนวณจากตำแหน่งจริง) --- */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            {lines.map((line) => {
                                const isDone = completed[line.id];
                                return (
                                    <motion.line
                                        key={`line-${line.id}`}
                                        x1={line.x1}
                                        y1={line.y1}
                                        x2={line.x2}
                                        y2={line.y2}
                                        stroke={isDone ? "#e0a53f" : "#a24836"}
                                        strokeWidth={isDone ? 3.5 : 2.5}
                                        strokeLinecap="round"
                                        strokeDasharray={isDone ? "0" : "6, 7"}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: isDone ? 0.95 : 0.45 }}
                                        transition={{ duration: 0.4 }}
                                        className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                                    />
                                );
                            })}
                            {lines.map((line) => (
                                <g key={`pins-${line.id}`}>
                                    <circle cx={line.x1} cy={line.y1} r={5} fill="#2d8cff" stroke="#0b1f3a" strokeWidth="1.5" />
                                    <circle cx={line.x2} cy={line.y2} r={5} fill="#2d8cff" stroke="#0b1f3a" strokeWidth="1.5" />
                                </g>
                            ))}
                        </svg>

                        {/* หัวข้อ */}
                        <div className="relative z-20 mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-700/30 bg-[#ecdcc9]/95 px-4 py-2 text-sm font-bold text-[#4a2b17] shadow-sm">
                            <span>พิมพ์คำตอบจากคำใบ้ให้ครบทุกช่อง</span>
                            <span className="text-amber-800">ตัวเข้ม = หลักฐานที่เปิดให้แล้ว</span>
                        </div>
                        <div className="relative z-20 flex flex-wrap justify-between items-start gap-3 mb-4">
                            <h2 className="text-2xl font-black text-[#1a0c02] bg-[#ecdcc9] px-5 py-2 rounded shadow-md border border-[#cfbfa8] -rotate-1">
                                หลักฐานที่พบ
                            </h2>
                            <h2 className="text-2xl font-black text-[#1a0c02] bg-[#ecdcc9] px-5 py-2 rounded shadow-md border border-[#cfbfa8] rotate-1">
                                เบาะแสคดี
                            </h2>
                        </div>

                        {/* การ์ดตัวช่วย + เบาะแส จัดด้วย grid ที่ยืดหยุ่นตามหน้าจอ */}
                        <div className="relative z-20 flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-2 items-center gap-5 xl:gap-8 overflow-hidden">

                            <div className="min-w-0 grid grid-cols-2 justify-items-center gap-x-3 gap-y-3">
                                {words.map((word, i) => (
                                    <motion.div
                                        key={word.id}
                                        ref={(el) => { answerRefs.current[word.id] = el; }}
                                        initial={{ opacity: 0, y: 16, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                                        animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1 : 1 }}
                                        transition={{ delay: i * 0.06, duration: 0.4 }}
                                    >
                                        <WordCard word={word} completed={completed[word.id]} onCorrect={handleCorrect} />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="min-w-0 grid grid-cols-2 justify-items-center gap-x-3 gap-y-3">
                                {words.map((word, i) => (
                                    <motion.div
                                        key={`clue-${word.id}`}
                                        ref={(el) => { clueRefs.current[word.id] = el; }}
                                        initial={{ opacity: 0, y: 16, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
                                        animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? 1 : -1 }}
                                        transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
                                    >
                                        <ClueCard word={word} completed={completed[word.id]} />
                                    </motion.div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {showComplete && (
                <MissionComplete nextPath="/unit5/2Intro" />
            )}
        </div>
    );
}
