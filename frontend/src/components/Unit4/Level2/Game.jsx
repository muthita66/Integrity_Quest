import { useCallback, useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import BookLayout from "../BookLayout";
import { useSound } from "../../../hooks/useSound";
import useGameMuted from "../../../hooks/useGameMuted";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import casinoAmbience from "../../../assets/sounds/Unit4/unit4-level2-casino-ambience.mp3";
import spinSound from "../../../assets/sounds/Unit4/unit4-slot-spin-loop.wav";
import winSound from "../../../assets/sounds/Unit4/unit4-slot-win.mp3";
import useUnit4Chapter, { Unit4Checking } from "../useUnit4Chapter";
import "../../../styles/theme.css";
import "./level2.css";

// ============================================================
// Unit 4 Level 2 : Slot (กับดักพนัน)
// ------------------------------------------------------------
// Backend เป็นคนตัดสินผล + คุมเครดิต + บันทึกทุกครั้งที่หมุน
//   เข้าเกม     → POST /api/game-play/start   { level_id }
//   กดหมุน      → POST /api/slot-game/spin    { playId, bet }
//   เครดิตหมด   → POST /api/game-play/complete { play_id } → PASS + IP
// ============================================================

const API_URL = "http://localhost:5000";
const SYMBOLS = ["🍒", "🍋", "🔔", "💎", "7️⃣"];
const DEFAULT_BETS = [1000, 2000, 5000];
const DEFAULT_BALANCE = 5000;
const MIN_SPIN_TICKS = 36; // Keep the reels and their sound spinning for about two seconds.

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

export default function Game() {
    const [muted] = useGameMuted();
    const { play: playWinSound, stop: stopWinSound } = useSound(winSound, { volume: 0.65, preload: true });
    useEffect(() => stopWinSound, [stopWinSound]);
    useEffect(() => { if (muted) stopWinSound(); }, [muted, stopWinSound]);
    const [winReward, setWinReward] = useState(0);
    useEffect(() => {
        if (!winReward) return;
        const timer = setTimeout(() => setWinReward(0), 2400);
        return () => clearTimeout(timer);
    }, [winReward]);
    const ambienceRef = useBackgroundMusic(casinoAmbience, { volume: 0.35, muted });
    const { play: playSpinSound, stop: stopSpinSound } = useSound(spinSound, { volume: 0.85, loop: true, preload: true });
    useEffect(() => stopSpinSound, [stopSpinSound]);
    useEffect(() => { if (muted) stopSpinSound(); }, [muted, stopSpinSound]);
    const navigate = useNavigate();

    // กันเข้าทาง URL ตรง ๆ ตอนบทนี้ยังไม่ปลดล็อก + ได้ level_id จาก DB
    const { checking, level } = useUnit4Chapter(1);

    const [playId, setPlayId] = useState(null);
    const [starting, setStarting] = useState(true);
    const [bets, setBets] = useState(DEFAULT_BETS);
    const [balance, setBalance] = useState(DEFAULT_BALANCE);
    const [bet, setBet] = useState(1000);
    const [reels, setReels] = useState(["7️⃣", "7️⃣", "7️⃣"]);
    const [spinning, setSpinning] = useState(false);
    useEffect(() => {
        if (ambienceRef.current) ambienceRef.current.volume = spinning || winReward ? 0.1 : 0.35;
    }, [spinning, winReward, ambienceRef]);
    const [message, setMessage] = useState("กำลังเตรียมตู้สล็อต...");
    const [showReality, setShowReality] = useState(false);
    const [result, setResult] = useState(null); // ผลจาก complete
    const [completeError, setCompleteError] = useState("");

    const startingRef = useRef(false); // กัน StrictMode เริ่มเกมซ้ำ
    const intervalRef = useRef(null);
    const revealTimerRef = useRef(null);

    useEffect(
        () => () => {
            clearInterval(intervalRef.current);
            clearTimeout(revealTimerRef.current);
        },
        []
    );

    const handleAuthError = (response) => {
        if (response.status === 401) {
            navigate("/", { replace: true });
            return true;
        }
        return false;
    };

    // --------------------------------------------------------
    // เริ่มรอบใหม่ (ได้ play_id ใหม่ทุกครั้ง)
    // --------------------------------------------------------
    const startPlay = useCallback(async () => {
        if (!level || startingRef.current) return;
        startingRef.current = true;
        setStarting(true);

        try {
            const response = await fetch(`${API_URL}/api/game-play/start`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ level_id: level.level_id }),
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "เริ่มเกมไม่ได้");
                navigate("/unit4/book", { replace: true });
                return;
            }

            const startBalance = data.data.start_balance ?? DEFAULT_BALANCE;

            setPlayId(data.data.play_id);
            setBets(data.data.bets ?? DEFAULT_BETS);
            setBalance(startBalance);
            setBet(1000);
            setReels(["7️⃣", "7️⃣", "7️⃣"]);
            setMessage("เลือกเดิมพัน แล้วลองหมุนดู");
            setShowReality(false);
            setResult(null);
            setCompleteError("");
        } catch (error) {
            console.error("Start slot game error:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            navigate("/unit4/book", { replace: true });
        } finally {
            startingRef.current = false;
            setStarting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level, navigate]);

    useEffect(() => {
        if (level) startPlay();
    }, [level, startPlay]);

    // --------------------------------------------------------
    // จบรอบ (เครดิตหมด) → บันทึกผล + ปลดล็อกบทถัดไป
    // --------------------------------------------------------
    const completePlay = async (id) => {
        try {
            setCompleteError("");

            const response = await fetch(`${API_URL}/api/game-play/complete`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ play_id: id }),
            });

            if (handleAuthError(response)) return false;

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "บันทึกผลไม่สำเร็จ");
            }

            setResult(data.data ?? null);
            return true;
        } catch (error) {
            console.error("Complete slot game error:", error);
            setCompleteError(error.message || "บันทึกผลไม่สำเร็จ");
            return false;
        }
    };

    // --------------------------------------------------------
    // หมุน: วงล้อหมุนระหว่างรอผลจาก backend
    // --------------------------------------------------------
    const spin = async () => {
        if (!playId || spinning || starting || balance < bet) return;

        const balanceBefore = balance;

        setSpinning(true);
        setWinReward(0);
        stopWinSound();
        if (!muted) playSpinSound();
        setMessage("ระบบกำลังหมุน...");
        setBalance(balanceBefore - bet);

        let ticks = 0;
        intervalRef.current = setInterval(() => {
            setReels([randomSymbol(), randomSymbol(), randomSymbol()]);
            ticks += 1;
        }, 55);

        const waitMinSpin = () =>
            new Promise((resolve) => {
                const check = () =>
                    ticks >= MIN_SPIN_TICKS ? resolve() : setTimeout(check, 30);
                check();
            });

        try {
            const request = fetch(`${API_URL}/api/slot-game/spin`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ playId, bet }),
            });

            const [response] = await Promise.all([request, waitMinSpin()]);

            if (handleAuthError(response)) return;

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "หมุนไม่สำเร็จ");
            }

            const round = data.data;

            clearInterval(intervalRef.current);
            setReels(round.symbols);
            stopSpinSound();
            setBalance(round.balance_after);

            if (round.reward > 0) {
                setWinReward(round.reward);
                if (!muted) playWinSound();
                setMessage(`ชนะ ฿${round.reward.toLocaleString()} — เล่นต่อสิ!`);
            } else if (round.is_broke) {
                setMessage("เครดิตหมดแล้ว");
                await completePlay(playId);
                revealTimerRef.current = setTimeout(() => setShowReality(true), 800);
            } else {
                setMessage("เกือบชนะแล้ว ลองอีกครั้งไหม?");
            }

            // เครดิตเหลือน้อยกว่าเดิมพันที่เลือกไว้ → ลดเดิมพันให้อัตโนมัติ
            if (!round.is_broke && round.balance_after < bet) {
                const affordable = [...bets]
                    .reverse()
                    .find((amount) => amount <= round.balance_after);
                if (affordable) setBet(affordable);
            }
        } catch (error) {
            console.error("Slot spin error:", error);
            clearInterval(intervalRef.current);
            setBalance(balanceBefore);
            setMessage(error.message || "หมุนไม่สำเร็จ ลองอีกครั้ง");
        } finally {
            clearInterval(intervalRef.current);
            stopSpinSound();
            setSpinning(false);
        }
    };

    // "ลองสังเกตอีกครั้ง" = เริ่มรอบใหม่ (รอบเก่ายังเก็บไว้ในประวัติ)
    const reset = () => {
        setWinReward(0);
        stopWinSound();
        clearTimeout(revealTimerRef.current);
        startPlay();
    };

    // "บทต่อไป" — ผลถูกบันทึกไปแล้วตอนเครดิตหมด
    // (ถ้าตอนนั้นบันทึกไม่สำเร็จ ลองบันทึกใหม่อีกครั้งก่อน)
    const finishLevel = async () => {
        if (!result && playId) {
            const ok = await completePlay(playId);
            if (!ok) return;
        }
        navigate("/unit4/book");
    };

    if (checking) return <Unit4Checking />;

    const busy = spinning || starting || !playId;

    return (
        <BookLayout
            title="บทที่ 2 — กับดักพนัน"
            subtitle="ทดลองเล่นเพื่อจับกลไกของระบบ"
            rightLabel="VIP SLOTS"
            rightNote=""
            onBack={() => navigate("/unit4/level2/intro")}
            leftPage={
                <div className="level2-game-brief">
                    <span className="level2-game-kicker">CASE FILE 02</span>
                    <h2>ตู้สล็อตที่ดูเหมือนยุติธรรม</h2>
                    <p>หมุนให้สุด แล้วสังเกตว่าระบบค่อย ๆ ดึงเราให้เล่นต่ออย่างไร</p>
                    <div className="level2-game-checklist">
                        <strong>สังเกตให้ดี</strong>
                        <span>• รางวัลก้อนใหญ่ในช่วงแรก</span>
                        <span>• คำว่า “เกือบชนะ”</span>
                        <span>• เครดิตที่หายไปเรื่อย ๆ</span>
                    </div>
                    <div className="level2-game-tip">เมื่อเครดิตหมด จะมีหน้าต่างเปิดเผยกลลวงของระบบ</div>
                </div>
            }
            rightPage={
                <div className="slot3-page">
                    <div className={`slot3-machine ${winReward ? 'slot3-machine--win' : ''}`}>
                        {winReward > 0 && <div className="slot3-win-effect" aria-hidden="true">
                            <strong>+฿{winReward.toLocaleString()}</strong>
                            {Array.from({ length: 14 }, (_, i) => <span key={i} style={{ left: `${6 + i * 6.7}%`, animationDelay: `${(i % 5) * 0.08}s` }}>✦</span>)}
                        </div>}
                        <div className="slot3-topline"><span>CASE 02</span><span>RIGGED MACHINE</span></div>
                        <div className="slot3-heading">
                            <h2>THE GOLDEN LOOP</h2>
                            <p>ลองสังเกตจังหวะของระบบ</p>
                        </div>

                        <div className="slot3-scoreboard">
                            <div><small>เครดิตคงเหลือ</small><strong className="slot3-credit">฿{balance.toLocaleString()}</strong></div>
                            <div><small>เดิมพันรอบนี้</small><strong className="slot3-bet">฿{bet.toLocaleString()}</strong></div>
                        </div>

                        <div className={`slot3-reels ${spinning ? "is-spinning" : ""}`}>
                            {reels.map((symbol, index) => <div className="slot3-reel" key={index}><span>{symbol}</span></div>)}
                        </div>

                        <div className="slot3-message"><span className="slot3-message-dot" />{message}</div>

                        <div className="slot3-bets">
                            {bets.map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={bet === amount ? "is-selected" : ""}
                                    disabled={busy || balance < amount}
                                    onClick={() => setBet(amount)}
                                >
                                    ฿{amount}
                                </button>
                            ))}
                        </div>

                        <button type="button" className="slot3-spin" disabled={busy || balance < bet} onClick={spin}>
                            <FaPlay size={13} /> {spinning ? "กำลังหมุน..." : starting ? "กำลังเตรียม..." : "หมุนวงล้อ"}
                        </button>
                    </div>
                    {showReality && (
                        <div className="slot3-reality">
                            <div className="slot3-reality-card">
                                <div className="slot3-reality-mark">!</div>
                                <span className="slot3-reality-kicker">SYSTEM REVEALED</span>
                                <h3>ตาสว่างแล้วหรือยัง?</h3>
                                <p>สล็อตไม่ได้รอให้คุณชนะ แต่มันรอให้คุณเล่นต่อจนเครดิตหมด</p>
                                <div className="slot3-loop">
                                    <div><b>01</b><span>แจกชัยชนะ</span></div>
                                    <i>→</i>
                                    <div><b>02</b><span>สร้างความหวัง</span></div>
                                    <i>→</i>
                                    <div><b>03</b><span>ดูดเงินคืน</span></div>
                                </div>
                                {result && (
                                    <p>
                                        หมุนไป {result.spins} ครั้ง · เคยมีเครดิตสูงสุด ฿
                                        {Number(result.peak_balance).toLocaleString()} · ได้รับ +{result.earned_ip} IP
                                    </p>
                                )}
                                {completeError && (
                                    <p style={{ color: "#B91C1C" }}>
                                        {completeError} — กด “ด่านถัดไป” เพื่อลองบันทึกอีกครั้ง
                                    </p>
                                )}
                                <div className="slot3-reality-actions">
                                    <button type="button" onClick={reset} disabled={starting}>ลองสังเกตอีกครั้ง</button>
                                    <button type="button" onClick={finishLevel}>ด่านถัดไป</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
}
