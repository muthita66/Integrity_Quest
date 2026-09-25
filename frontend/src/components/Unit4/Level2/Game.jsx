import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import BookLayout from "../BookLayout";
import "../../../styles/theme.css";
import "./level2.css";

const SYMBOLS = ["🍒", "🍋", "🔔", "💎", "7️⃣"];

export default function Game() {
    const navigate = useNavigate();
    const [balance, setBalance] = useState(1500);
    const [bet, setBet] = useState(500);
    const [reels, setReels] = useState(["7️⃣", "7️⃣", "7️⃣"]);
    const [round, setRound] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [message, setMessage] = useState("เลือกเดิมพัน แล้วลองหมุนดู");
    const [showReality, setShowReality] = useState(false);

    useEffect(() => () => clearTimeout(window.__slotTimer), []);

    const randomSymbol = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

    const spin = () => {
        if (spinning || balance < bet) return;

        setSpinning(true);
        setMessage("ระบบกำลังหมุน...");
        setBalance((current) => current - bet);

        let ticks = 0;
        const timer = setInterval(() => {
            setReels([randomSymbol(), randomSymbol(), randomSymbol()]);
            ticks += 1;

            if (ticks >= 16) {
                clearInterval(timer);
                const isHookRound = round === 0;
                const isSecondWin = round === 1;
                const result = isHookRound
                    ? ["💎", "💎", "💎"]
                    : isSecondWin
                        ? ["7️⃣", "7️⃣", "7️⃣"]
                        : ["🍒", "🔔", "🍋"];
                const reward = isHookRound ? bet * 5 : isSecondWin ? bet * 3 : 0;
                const nextBalance = balance - bet + reward;

                setReels(result);
                setBalance(nextBalance);
                setRound((current) => current + 1);
                setSpinning(false);

                if (reward > 0) {
                    setMessage(`ชนะ ฿${reward.toLocaleString()} — เล่นต่อสิ!`);
                } else if (nextBalance <= 0) {
                    setMessage("เครดิตหมดแล้ว");
                    window.__slotTimer = setTimeout(() => setShowReality(true), 800);
                } else {
                    setMessage("เกือบชนะแล้ว ลองอีกครั้งไหม?");
                }
            }
        }, 55);
    };

    const reset = () => {
        setBalance(1500);
        setBet(500);
        setReels(["7️⃣", "7️⃣", "7️⃣"]);
        setRound(0);
        setMessage("เลือกเดิมพัน แล้วลองหมุนดู");
        setShowReality(false);
    };

    const finishLevel = () => {
        // บทนี้เป็นบทเรียนเพื่อทำความเข้าใจ จบภารกิจแล้วได้รับแต้มเต็ม
        const level2Points = 150;
        try {
            const save = JSON.parse(localStorage.getItem("unit4")) || {};
            localStorage.setItem("unit4", JSON.stringify({ ...save, level2: true, level3: true, level2Points }));
        } catch {
            localStorage.setItem("unit4", JSON.stringify({ level1: true, level2: true, level3: true, level2Points }));
        }
        navigate("/unit4/book");
    };

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
                    <div className="slot3-machine">
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
                            {[100, 500, 1000].map((amount) => (
                                <button
                                    key={amount}
                                    type="button"
                                    className={bet === amount ? "is-selected" : ""}
                                    disabled={spinning || balance < amount}
                                    onClick={() => setBet(amount)}
                                >
                                    ฿{amount}
                                </button>
                            ))}
                        </div>

                        <button type="button" className="slot3-spin" disabled={spinning || balance < bet} onClick={spin}>
                            <FaPlay size={13} /> {spinning ? "กำลังหมุน..." : "หมุนวงล้อ"}
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
                                <div className="slot3-reality-actions">
                                    <button type="button" onClick={reset}>ลองสังเกตอีกครั้ง</button>
                                    <button type="button" onClick={finishLevel}>บทต่อไป</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            }
        />
    );
}
