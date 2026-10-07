import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import WordCard from "./Wordcard";
import ClueCard from "./ClueCard";
import MissionComplete from "./MissionComplete";
import { isUnit5Paused } from '../Unit5Navigation';
import { useSound } from "../../../hooks/useSound";
import useGameMuted from "../../../hooks/useGameMuted";
import evidenceFoundSound from "../../../assets/sounds/Unit5/level1-evidence-found.mp3";
import folderOpenSound from "../../../assets/sounds/Unit5/level1-case-folder-open.mp3";
import investigationMusic from "../../../assets/sounds/Unit5/level1-investigation-piano.mp3";

// ============================================================
// Unit 5 Level 1 : ตามหาคำจากคำใบ้
// ------------------------------------------------------------
// คำศัพท์อยู่ใน DB (level_words) — หน้าเว็บได้แค่คำใบ้ + ตัวที่เปิดให้
//   เข้าเกม    → POST /api/game-play/start    { level_id } → play_id + words
//   กด Enter   → POST /api/word-game/answer   { playId, wordId, text }
//   หาครบ      → POST /api/game-play/complete { play_id } → IP จริง
// ============================================================

const API_URL = "http://localhost:5000";
const LEVEL_ID = 14;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function GameLevel1() {
    const [muted] = useGameMuted();
    const { play: playFolderOpen, stop: stopFolderOpen } = useSound(folderOpenSound, { volume: 0.4, loop: true, preload: true });
    const { play: playEvidenceFound, stop: stopEvidenceFound } = useSound(evidenceFoundSound, { volume: 0.4, preload: true });
    useEffect(() => stopEvidenceFound, [stopEvidenceFound]);
    useEffect(() => { if (muted) stopEvidenceFound(); }, [muted, stopEvidenceFound]);
    const navigate = useNavigate();

    const [playId, setPlayId] = useState(null);
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (loading && !muted) playFolderOpen();
        else stopFolderOpen();
        return stopFolderOpen;
    }, [loading, muted, playFolderOpen, stopFolderOpen]);
    const [result, setResult] = useState(null); // ผลจาก complete
    const [finishError, setFinishError] = useState("");

    const startingRef = useRef(false);   // กัน StrictMode เริ่มเกมซ้ำ
    const finishingRef = useRef(false);  // กันเรียก complete ซ้ำ

    const [completed, setCompleted] = useState({});
    const [seconds, setSeconds] = useState(0);
    const [showComplete, setShowComplete] = useState(false);
    const { play: playMusic, stop: stopMusic } = useSound(investigationMusic, {
        volume: 0.3, loop: true, preload: true, retryOnInteract: true,
    });
    useEffect(() => {
        if (!loading && !showComplete && !muted) playMusic();
        else stopMusic();
        return stopMusic;
    }, [loading, showComplete, muted, playMusic, stopMusic]);
    const [lines, setLines] = useState([]);

    // refs สำหรับวัดตำแหน่งจริงของการ์ด แทนพิกัด pixel ที่ hardcode ไว้เดิม
    const boardRef = useRef(null);
    const answerRefs = useRef({});
    const clueRefs = useRef({});

    const correctCount = useMemo(
        () => Object.values(completed).filter(Boolean).length,
        [completed]
    );

    const progress = words.length ? (correctCount / words.length) * 100 : 0;

    const handleAuthError = (response) => {
        if (response.status === 401) {
            navigate("/", { replace: true });
            return true;
        }
        return false;
    };

    // --------------------------------------------------------
    // เริ่มเกม: ดึงคำใบ้จาก backend
    // --------------------------------------------------------
    useEffect(() => {
        if (startingRef.current) return;
        startingRef.current = true;

        const start = async () => {
            try {
                const response = await fetch(`${API_URL}/api/game-play/start`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ level_id: LEVEL_ID }),
                });

                if (handleAuthError(response)) return;

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "เริ่มเกมไม่ได้");
                    navigate("/map", { replace: true });
                    return;
                }

                setPlayId(data.data.play_id);
                setWords(
                    (data.data.words || []).map((w) => ({
                        id: w.word_order, // ใช้กับ rotations ใน WordCard / ClueCard
                        word_id: w.word_id,
                        clue: w.clue,
                        totalChars: w.total_chars,
                        revealedChars: w.revealed_chars || [],
                    }))
                );
            } catch (error) {
                console.error("Start word game error:", error);
                alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
                navigate("/map", { replace: true });
            } finally {
                setLoading(false);
            }
        };

        start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --------------------------------------------------------
    // ส่งคำตอบ 1 ครั้ง (WordCard เรียกตอนกด Enter) → คืน true/false
    // --------------------------------------------------------
    const handleSubmit = useCallback(
        async (word, text) => {
            if (!playId) return false;

            const response = await fetch(`${API_URL}/api/word-game/answer`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ playId, wordId: word.word_id, text }),
            });

            if (handleAuthError(response)) return false;

            const data = await response.json();

            // คำนี้ตอบถูกไปแล้ว (เช่น กดซ้ำ) → ถือว่าผ่าน
            if (response.status === 409 && /ตอบถูกไปแล้ว/.test(data.message || "")) {
                setCompleted((prev) => ({ ...prev, [word.id]: true }));
                return true;
            }

            if (!response.ok) {
                throw new Error(data.message || "ตรวจคำตอบไม่สำเร็จ");
            }

            if (data.data.is_correct) {
                if (!muted) playEvidenceFound();
                setCompleted((prev) => (prev[word.id] ? prev : { ...prev, [word.id]: true }));
            }

            return data.data.is_correct;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [playId, muted, playEvidenceFound]
    );

    // --------------------------------------------------------
    // หาครบทุกคำ → บันทึกผล แล้วเปิดหน้าต่าง Mission Complete
    // --------------------------------------------------------
    const finish = useCallback(async () => {
        if (!playId || finishingRef.current) return;
        finishingRef.current = true;
        setFinishError("");

        try {
            const response = await fetch(`${API_URL}/api/game-play/complete`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ play_id: playId }),
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "บันทึกผลไม่สำเร็จ");
            }

            setResult(data.data ?? null);
            setShowComplete(true);
        } catch (error) {
            console.error("Complete word game error:", error);
            setFinishError(error.message || "บันทึกผลไม่สำเร็จ");
        } finally {
            finishingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playId]);

    // นาฬิกานับเวลา — หยุดทันทีเมื่อภารกิจสำเร็จ (บั๊กเดิม: นับต่อไปเรื่อย ๆ ไม่หยุด)
    useEffect(() => {
        if (showComplete || loading) return;
        const timer = setInterval(() => {
            if (isUnit5Paused()) return;
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [showComplete, loading]);

    // บั๊กเดิม: words.lenght (พิมพ์ผิด) ทำให้ dependency array ไม่ทำงานตามที่ตั้งใจ
    useEffect(() => {
        if (words.length > 0 && correctCount === words.length) {
            const t = setTimeout(finish, 800);
            return () => clearTimeout(t);
        }
    }, [correctCount, words.length, finish]);

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
    }, [completed, words]);

    if (loading) {
        return (
            <div className="h-dvh flex items-center justify-center bg-[#241408] text-[#f4eae1] text-lg">
                กำลังเปิดแฟ้มหลักฐาน...
            </div>
        );
    }

    return (
        <div className="unit5-game-content h-dvh flex flex-col p-4 bg-[#241408] text-[#f4eae1] select-none overflow-hidden relative">

            {/* พื้นผิวไม้/คอร์กบอร์ดแบบ subtle เพิ่มมิติให้พื้นหลัง */}
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_10%,rgba(255,180,80,0.06),transparent_40%),radial-gradient(circle_at_80%_90%,rgba(255,140,60,0.05),transparent_45%)]" />

            <div className="w-full h-full flex flex-col mx-auto max-w-[1440px] relative">

                {/* --- Header Area --- */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="relative bg-[#362116] rounded-[20px] px-5 lg:px-10 py-3 lg:py-4 [@media(max-height:820px)]:py-2 mb-3 [@media(max-height:820px)]:mb-2 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border border-[#4a3022]"
                >
                    <div className="absolute top-2 left-2 w-3 h-3 bg-amber-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

                    <div className="flex items-center gap-4 lg:gap-8 px-2 lg:px-4 font-mono">
                        <div className="whitespace-nowrap text-lg lg:text-xl tracking-wider lg:tracking-widest text-[#c2b0a2]">
                            TIME: <span className="font-bold text-amber-400 tabular-nums">{formatTime()}</span>
                        </div>

                        <div className="whitespace-nowrap text-lg lg:text-xl tracking-wider lg:tracking-widest text-[#c2b0a2]">
                            EVIDENCE: <span className="font-bold text-amber-500 tabular-nums">{correctCount}/{words.length}</span>
                        </div>

                        <div className="min-w-[60px] flex-1">
                            <div className="h-3 bg-[#21130c] rounded-full overflow-hidden border border-[#4a3022]">
                                <motion.div
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                                    className="h-full bg-gradient-to-r from-amber-700 to-amber-500 shadow-[0_0_10px_#f59e0b]"
                                />
                            </div>
                        </div>

                        <div className="hidden lg:block text-lg font-bold tracking-widest text-amber-600 border border-amber-600 px-4 py-0.5 rounded bg-[#21130c]/50">
                            CONFIDENTIAL
                        </div>
                    </div>
                </motion.div>

                {/* --- Board Area --- */}
                <div
                    className="w-full flex-1 min-h-0 relative overflow-x-hidden overflow-y-auto rounded-[20px] shadow-[inset_0_0_60px_rgba(0,0,0,0.7)] border-4 border-[#261710]"
                    style={{
                        backgroundColor: "#3a251a",
                        backgroundImage:
                            "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 26px)," +
                            "radial-gradient(circle at 15% 15%, rgba(255,255,255,0.04), transparent 30%)",
                    }}
                >
                    <div ref={boardRef} className="relative w-full min-h-full min-w-0 px-5 py-4 [@media(max-height:820px)]:py-2 flex flex-col">

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
                        <div className="relative z-20 mb-3 [@media(max-height:820px)]:mb-2 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-700/30 bg-[#ecdcc9]/95 px-4 py-2 [@media(max-height:820px)]:py-1 text-sm [@media(max-height:820px)]:text-xs font-bold text-[#4a2b17] shadow-sm">
                            <span>พิมพ์คำตอบจากคำใบ้ให้ครบทุกช่อง</span>
                            <span className="text-amber-800">ตัวเข้ม = หลักฐานที่เปิดให้แล้ว</span>
                        </div>
                        <div className="relative z-20 flex flex-wrap justify-between items-start gap-3 mb-4 [@media(max-height:820px)]:mb-2">
                            <h2 className="text-2xl [@media(max-height:820px)]:text-xl font-black text-[#1a0c02] bg-[#ecdcc9] px-5 py-2 [@media(max-height:820px)]:py-1 rounded shadow-md border border-[#cfbfa8] -rotate-1">
                                หลักฐานที่พบ
                            </h2>
                            <h2 className="text-2xl [@media(max-height:820px)]:text-xl font-black text-[#1a0c02] bg-[#ecdcc9] px-5 py-2 [@media(max-height:820px)]:py-1 rounded shadow-md border border-[#cfbfa8] rotate-1">
                                เบาะแสคดี
                            </h2>
                        </div>

                        {/* การ์ดตัวช่วย + เบาะแส จัดด้วย grid ที่ยืดหยุ่นตามหน้าจอ */}
                        <div className="relative z-20 flex-1 grid grid-cols-2 items-center gap-4 lg:gap-6 xl:gap-8 pb-2">

                            <div className="min-w-0 grid grid-cols-2 justify-items-center gap-x-3 gap-y-3 [@media(max-height:820px)]:gap-y-2">
                                {words.map((word, i) => (
                                    <motion.div
                                        key={word.id}
                                        ref={(el) => { answerRefs.current[word.id] = el; }}
                                        initial={{ opacity: 0, y: 16, rotate: i % 2 === 0 ? -1.5 : 1.5 }}
                                        animate={{ opacity: 1, y: 0, rotate: i % 2 === 0 ? -1 : 1 }}
                                        transition={{ delay: i * 0.06, duration: 0.4 }}
                                    >
                                        <WordCard word={word} completed={completed[word.id]} onSubmit={handleSubmit} />
                                    </motion.div>
                                ))}
                            </div>

                            <div className="min-w-0 grid grid-cols-2 justify-items-center gap-x-3 gap-y-3 [@media(max-height:820px)]:gap-y-2">
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

            {finishError && !showComplete && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-700 shadow-lg">
                    {finishError}
                    <button type="button" onClick={finish} className="rounded-lg bg-red-600 px-3 py-1 text-white">
                        ลองบันทึกอีกครั้ง
                    </button>
                </div>
            )}

            {showComplete && (
                <MissionComplete
                    nextPath="/unit5/2Intro"
                    earnedIP={result?.earned_ip}
                />
            )}
        </div>
    );
}