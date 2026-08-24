import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import slotbg from "../../../assets/unit4/Slot.png"; // รองรับไฟล์ภาพพื้นหลังของคุณ

const EMOJIS = ["🍒", "🍇", "🍋", "🔔", "💎", "7️⃣"];

export default function RiggedSlotMachine() {
    const [balance, setBalance] = useState(1500);
    const [bet, setBet] = useState(500);
    const [slots, setSlots] = useState(["7️⃣", "7️⃣", "7️⃣"]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinCount, setSpinCount] = useState(0);
    const [message, setMessage] = useState("🔥 ยินดีต้อนรับสู่ VIP SLOTS! 🔥");
    const [winAmount, setWinAmount] = useState(0);
    const [showGameOver, setShowGameOver] = useState(false);
    const [isBigWin, setIsBigWin] = useState(false);
    const [bigWinText, setBigWinText] = useState("");
    const navigate = useNavigate();

    const getRandomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    const changeBet = (amount) => {
        if (isSpinning) return;
        setBet(amount);
    };

    const spin = () => {
        if (isSpinning || balance < bet) return;

        setIsSpinning(true);
        setWinAmount(0);
        setIsBigWin(false);
        setMessage("กำลังสุ่มรางวัล...");

        const currentBalance = balance - bet;
        setBalance(currentBalance);

        let finalSlots = [];
        let spinWin = 0;
        let nextMessage = "";
        let winType = "";

        if (spinCount === 0) {
            finalSlots = ["💎", "💎", "💎"];
            spinWin = bet * 5;
            nextMessage = "🎉 BIG WIN!! แตกหนักมาก คุณคือผู้โชคดี! 🎉";
            winType = "BIG WIN";
        } else if (spinCount === 1) {
            finalSlots = ["7️⃣", "7️⃣", "7️⃣"];
            spinWin = bet * 3;
            nextMessage = "🔥 MEGA WIN!! วันนี้วันของคุณจริงๆ! 🔥";
            winType = "MEGA WIN";
        } else if (spinCount === 3) {
            finalSlots = ["🍒", "🍒", "🍇"];
            spinWin = Math.floor(bet * 0.5);
            nextMessage = `เกือบแจ็คพอต! ได้รางวัลปลอบใจ ฿${spinWin}`;
        } else {
            do {
                finalSlots = [getRandomEmoji(), getRandomEmoji(), getRandomEmoji()];
            } while (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]);

            spinWin = 0;
            const loseMessages = [
                "ว้าาา เอาใหม่นะ กำลังจะแตกแล้ว!",
                "เพิ่มเบ็ตสิ แจ็คพอตรออยู่!",
                "อย่าเพิ่งยอมแพ้ ระบบกำลังสะสมรอบ!",
                "เฉียดไปนิดเดียว หมุนต่อเลย!",
            ];
            nextMessage = loseMessages[Math.floor(Math.random() * loseMessages.length)];
        }

        const newBalance = currentBalance + spinWin;

        let counter = 0;
        const spinInterval = setInterval(() => {
            setSlots([getRandomEmoji(), getRandomEmoji(), getRandomEmoji()]);
            counter++;

            if (counter > 25) {
                clearInterval(spinInterval);
                setSlots(finalSlots);

                if (spinWin > 0) {
                    setWinAmount(spinWin);
                    setBalance(newBalance);

                    if (winType) {
                        setBigWinText(winType);
                        setIsBigWin(true);
                        setTimeout(() => setIsBigWin(false), 3000);
                    }
                }

                setMessage(nextMessage);
                setSpinCount(prev => prev + 1);
                setIsSpinning(false);

                if (newBalance <= 0) {
                    setTimeout(() => setShowGameOver(true), 1200);
                } else if (newBalance < bet) {
                    setBet(newBalance);
                }
            }
        }, 60);
    };

    const resetGame = () => {
        setBalance(1500);
        setBet(500);
        setSpinCount(0);
        setSlots(["7️⃣", "7️⃣", "7️⃣"]);
        setMessage("🔥 ปรับเบ็ตแล้วลุยเลย แตกหนักแน่นอน! 🔥");
        setWinAmount(0);
        setShowGameOver(false);
        setIsBigWin(false);
    };

    return (
        <div className={`slot-machine-container ${isBigWin ? 'screen-shake' : ''}`}>

            {/* 🪙 อนิเมชันตอนแจ็คพอตแตก */}
            {isBigWin && (
                <div className="big-win-overlay">
                    <div className="flash-light"></div>
                    <div className="sunburst"></div>
                    <h1 className="win-type-text">{bigWinText}!!</h1>
                    <div className="massive-amount">+฿{winAmount.toLocaleString()}</div>
                    <div className="coin-shower">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="falling-coin" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 1.5}s` }}>💰</div>
                        ))}
                    </div>
                </div>
            )}

            <div className="main-card-glass">
                {/* 🎰 ส่วนหัวตู้สล็อต */}
                <div className="slot-header">
                    <div className="badge">LIVE CASINO VIP</div>
                    <h1>VEGAS <span>GOLDEN</span> SLOTS</h1>
                    <p className="sub-tag">👑 ระบบอัตโนมัติ มั่นคง ปลอดภัย 100% 👑</p>
                </div>

                {/* 💰 บอร์ดแสดงยอดเงิน */}
                <div className="status-panel">
                    <div className="info-node">
                        <span className="label">CREDIT (ยอดเงินคงเหลือ)</span>
                        <div className={`amount-value ${winAmount > 0 ? 'highlight-win' : ''}`}>
                            ฿{balance.toLocaleString()}
                        </div>
                    </div>
                    <div className="info-node border-left">
                        <span className="label">CURRENT BET (เดิมพันรวม)</span>
                        <div className="bet-value">฿{bet.toLocaleString()}</div>
                    </div>
                </div>

                {/* 🛑 ตัวตู้สล็อตทองคำ 3D */}
                <div className="golden-machine-wrapper">
                    <div className="machine-dome-crown">
                        <div className="led-light pink"></div>
                        <div className="led-light blue"></div>
                        <div className="led-light green"></div>
                    </div>

                    <div className={`slot-lever ${isSpinning ? 'lever-pulled' : ''}`}>
                        <div className="lever-base"></div>
                        <div className="lever-rod"></div>
                        <div className="lever-ball"></div>
                    </div>

                    <div className={`slot-reels-container ${isSpinning ? 'reels-shaking' : ''}`}>
                        <div className="reel-window-overlay"></div>
                        <div className="reel">
                            <span className={`realistic-icon ${isSpinning ? 'blur-text' : ''}`}>{slots[0]}</span>
                        </div>
                        <div className="reel">
                            <span className={`realistic-icon ${isSpinning ? 'blur-text' : ''}`}>{slots[1]}</span>
                        </div>
                        <div className="reel">
                            <span className={`realistic-icon ${isSpinning ? 'blur-text' : ''}`}>{slots[2]}</span>
                        </div>
                    </div>
                </div>

                {/* 📣 กล่องข้อความแจ้งเตือน */}
                <div className={`message-display ${winAmount > 0 ? 'win-text' : ''}`}>
                    <div className="marquee-text">{message}</div>
                </div>

                {/* 🕹️ แผงควบคุม */}
                <div className="control-wrapper">
                    <div className="bet-selector-grid">
                        {[100, 500, 1000].map((amt) => (
                            <button
                                key={amt}
                                disabled={isSpinning || balance < amt}
                                onClick={() => changeBet(amt)}
                                className={`bet-chip ${bet === amt ? 'active-chip' : ''}`}
                            >
                                ฿{amt}
                            </button>
                        ))}
                        <button
                            disabled={isSpinning || balance === 0}
                            onClick={() => changeBet(balance)}
                            className={`bet-chip max-chip ${bet === balance ? 'active-max' : ''}`}
                        >
                            MAX BET
                        </button>
                    </div>

                    <button
                        className={`modern-spin-btn ${isSpinning || balance < bet ? 'disabled' : ''}`}
                        onClick={spin}
                        disabled={isSpinning || balance < bet}
                    >
                        {isSpinning ? (
                            <span className="spinner-arc">หมุนชะตา...</span>
                        ) : (
                            <>กดสปิน <span className="btn-subtext">SPIN NOW</span></>
                        )}
                    </button>
                </div>
            </div>

            {/* หน้าต่างแจ้งเตือน*/}
            {showGameOver && (
                <div className="reality-overlay">
                    <div className="reality-modal">
                        <div className="danger-glow-bar"></div>

                        <div className="modal-header">
                            <h2>ตาสว่างแล้วหรือยัง?</h2>
                        </div>

                        <div className="reality-content">
                            <p className="main-warning-desc">
                                นี่ไม่ใช่เรื่องของความซวย แต่มันคือ <span>"อัลกอริทึมคณิตศาสตร์"</span> ที่ถูกเขียนโปรแกรมล็อกผลไว้ตั้งแต่แรกเพื่อสูบเงินคุณ!
                            </p>

                            <div className="trick-box">
                                <h4 className="trick-title">🔒 ถอดรหัสกลลวงเจ้ามือ (Rigged Loop)</h4>
                                <div className="timeline-steps">
                                    <div className="step-item">
                                        <div className="step-badge step-1">รอบที่ 1</div>
                                        <p><strong>แจกแจ็คพอตใหญ่ล่อให้ตายใจ (Hook)</strong> <br />เพื่อกระตุ้นสารโดปามีนให้คุณรู้สึกว่า "เกมนี้แตกง่าย"</p>
                                    </div>
                                    <div className="step-item">
                                        <div className="step-badge step-2">รอบที่ 2</div>
                                        <p><strong>เลี้ยงไข้ด้วยรางวัลต่อเนื่อง (Illusion)</strong> <br />สร้างภาพลวงตาให้คุณเกิดความโลภและยอมเพิ่มเงินเดิมพัน</p>
                                    </div>
                                    <div className="step-item alert-step">
                                        <div className="step-badge step-3">หลังจากนั้น</div>
                                        <p><strong>ปรับล็อกโอกาสชนะเป็น 0%</strong><br />ระบบจะเริ่มดูดเงินคืนอย่างเยือกเย็นจนคุณหมดตัวในที่สุด</p>
                                    </div>
                                </div>
                            </div>

                            <div className="system-never-loses">
                                💡 จำไว้ให้ขึ้นใจ: ในโลกพนันออนไลน์... <span>ระบบไม่มีวันแพ้มนุษย์</span>
                            </div>
                        </div>

                        {/* 🕹️ แผงปุ่มทางเลือกคู่ (เพิ่มปุ่มไปด่านต่อไป) */}
                        <div className="modal-action-row">
                            <button className="reset-loop-btn" onClick={resetGame}>
                                ลองใหม่อีกรอบเพื่อศึกษาลูปโกง
                            </button>
                            <button className="next-stage-btn" onClick={() => navigate("/unit4/introCall")}>
                                เข้าใจความจริงแล้ว ไปด่านต่อไป
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;800;900&display=swap');

                .slot-machine-container {
                    min-height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'Kanit', sans-serif;
                    padding: 20px;
                    color: white;
                    overflow-x: hidden;
                    position: relative;
                    box-sizing: border-box;
                    background: linear-gradient(180deg, rgba(13, 10, 28, 0.82) 0%, rgba(5, 3, 13, 0.94) 100%), 
                                url(${slotbg}) no-repeat center center/cover;
                }

                .main-card-glass {
                    background: rgba(18, 14, 36, 0.75);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 215, 0, 0.25);
                    border-radius: 32px;
                    padding: 35px 40px;
                    width: 100%;
                    max-width: 580px;
                    box-shadow: 0 30px 70px rgba(0,0,0,0.8);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                }

                /* ---- ส่วนหัวและแผงแต้มเดิม ---- */
                .slot-header { text-align: center; margin-bottom: 25px; }
                .badge { display: inline-block; background: linear-gradient(90deg, #ff0055, #990033); padding: 4px 14px; border-radius: 50px; font-size: 0.75rem; font-weight: 800; letter-spacing: 1.5px; margin-bottom: 8px; box-shadow: 0 0 10px rgba(255, 0, 85, 0.5); }
                .slot-header h1 { font-size: 2.5rem; font-weight: 900; margin: 0; background: linear-gradient(to bottom, #ffffff 0%, #e1e1e1 40%, #a1a1a1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .slot-header span { background: linear-gradient(to bottom, #fff6b1 0%, #ffd700 50%, #ff8c00 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 10px rgba(255,215,0,0.5)); }
                .sub-tag { color: #00ffcc; font-size: 0.95rem; margin: 6px 0 0 0; font-weight: 400; }
                .status-panel { display: flex; width: 100%; background: rgba(10, 7, 20, 0.85); border-radius: 16px; padding: 15px 0; margin-bottom: 25px; border: 1px solid rgba(255,255,255,0.05); }
                .info-node { flex: 1; text-align: center; }
                .border-left { border-left: 1px solid rgba(255,255,255,0.1); }
                .label { font-size: 0.75rem; color: #8c86a5; font-weight: 600; display: block; margin-bottom: 4px;}
                .amount-value { font-size: 2.1rem; font-weight: 900; color: #00ff66; text-shadow: 0 0 15px rgba(0,255,102,0.4); }
                .bet-value { font-size: 2.1rem; font-weight: 900; color: #ffd700; }
                .highlight-win { color: #ffeb3b; transform: scale(1.08); }

                /* ---- ตัวตู้ทองคำสล็อต ---- */
                .golden-machine-wrapper { position: relative; background: linear-gradient(135deg, #fceabb 0%, #f8b500 30%, #dd9b00 70%, #8a5f00 100%); padding: 22px 26px; border-radius: 24px; border: 4px solid #fff5a5; box-shadow: 0 20px 45px rgba(0,0,0,0.8); margin-bottom: 20px; width: 90%; box-sizing: border-box; }
                .machine-dome-crown { position: absolute; top: -24px; left: 50%; transform: translateX(-50%); width: 40%; height: 24px; background: linear-gradient(to right, #dd9b00, #fceabb, #dd9b00); border-radius: 50px 50px 0 0; border: 3px solid #fff5a5; border-bottom: none; display: flex; justify-content: center; align-items: center; gap: 8px; }
                .led-light { width: 6px; height: 6px; border-radius: 50%; }
                .led-light.pink { background: #ff0055; box-shadow: 0 0 8px #ff0055; }
                .led-light.blue { background: #00e5ff; box-shadow: 0 0 8px #00e5ff; }
                .led-light.green { background: #00ff66; box-shadow: 0 0 8px #00ff66; }
                .slot-lever { position: absolute; right: -32px; top: 40%; width: 30px; height: 120px; }
                .lever-base { position: absolute; bottom: 0; left: 0; width: 14px; height: 30px; background: #444; border-radius: 4px; }
                .lever-rod { position: absolute; left: 4px; bottom: 15px; width: 6px; height: 75px; background: linear-gradient(90deg, #bbb, #fff, #777); transform-origin: bottom center; transition: transform 0.2s; }
                .lever-ball { position: absolute; left: -6px; top: 12px; width: 26px; height: 26px; border-radius: 50%; background: radial-gradient(circle at 8px 8px, #ff3b30, #990000); box-shadow: 0 4px 8px rgba(0,0,0,0.4); }
                .lever-pulled .lever-rod { transform: rotateX(150deg); }
                .lever-pulled .lever-ball { transform: translateY(70px); }
                .slot-reels-container { display: flex; gap: 12px; background: #09070f; padding: 16px; border-radius: 16px; position: relative; box-shadow: inset 0 10px 25px #000; border: 3px solid #6b4c00; }
                .reel-window-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(rgba(0,0,0,0.4) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.4) 100%); pointer-events: none; z-index: 3; }
                .reel { flex: 1; height: 130px; background: linear-gradient(to bottom, #ffffff 0%, #f1f1f1 25%, #ffffff 50%, #f1f1f1 75%, #ffffff 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 4.5rem; position: relative; z-index: 1; box-shadow: inset 0 12px 15px rgba(0,0,0,0.5); border: 1px solid #cbb281; }
                .blur-text { animation: scrollFast 0.07s linear infinite; filter: blur(3px); }
                @keyframes scrollFast { 0% { transform: translateY(-40%); } 100% { transform: translateY(40%); } }
                .reels-shaking { animation: vibrate 0.08s linear infinite; }
                @keyframes vibrate { 0% { transform: translate(0); } 50% { transform: translate(1px, 1px); } 100% { transform: translate(-1px, -1px); } }
                .message-display { width: 100%; height: 40px; background: rgba(0,0,0,0.6); border-radius: 8px; border: 1px solid #31274f; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .marquee-text { color: #b3aed2; font-size: 1rem; }
                .win-text .marquee-text { color: #ffeb3b; font-weight: 700; }

                /* ---- ปุ่มกดสปินเดิม ---- */
                .control-wrapper { width: 100%; margin-top: 20px; }
                .bet-selector-grid { display: flex; gap: 10px; margin-bottom: 15px; }
                .bet-chip { flex: 1; background: #1f1a3a; border: 1px solid #453b75; color: #a39ec4; padding: 12px 0; border-radius: 12px; font-family: 'Kanit'; font-size: 1.1rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 0 #131026; }
                .bet-chip.active-chip { background: linear-gradient(180deg, #ffea00 0%, #d49200 100%); color: #1a0f00; border-color: #fff; box-shadow: 0 0 15px rgba(255,215,0,0.4), 0 3px 0 #8a5f00; }
                .max-chip { border-color: #ff0055; color: #ff4081; }
                .active-max { background: linear-gradient(180deg, #ff0055 0%, #b3003b 100%) !important; color: white !important; box-shadow: 0 0 15px rgba(255,0,85,0.5), 0 3px 0 #660022 !important; }
                .modern-spin-btn { width: 100%; background: linear-gradient(180deg, #00ff87 0%, #60efff 100%); border: 3px solid #fff; padding: 14px 0; border-radius: 16px; font-size: 1.8rem; font-weight: 900; font-family: 'Kanit'; color: #05140b; cursor: pointer; box-shadow: 0 6px 0 #00a852; display: flex; flex-direction: column; align-items: center; }
                .modern-spin-btn.disabled { background: linear-gradient(180deg, #3c384f, #252233); color: #625d7a; border-color: #4a4563; box-shadow: none; cursor: not-allowed; }

                /* ---- แอนิเมชันแจ็คพอต ---- */
                .big-win-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 8000; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(4, 2, 10, 0.85); }
                .flash-light { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle, rgba(255,215,0,0.4) 0%, rgba(0,0,0,0) 70%); animation: strobe 0.15s infinite alternate; }
                .sunburst { position: absolute; width: 200vw; height: 200vw; background: repeating-conic-gradient(rgba(255,215,0,0.15) 0 15deg, transparent 15deg 30deg); animation: rotateSun 8s linear infinite; }
                @keyframes rotateSun { to { transform: rotate(360deg); } }
                .win-type-text { font-size: 6rem; color: #fff; text-shadow: 0 0 20px #ff0055; }
                .massive-amount { font-size: 5.5rem; color: #00ff66; font-weight: 900; }
                .falling-coin { position: absolute; top: -10%; font-size: 3.5rem; animation: coinFall 1.8s linear infinite; }
                @keyframes coinFall { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(105vh); opacity: 0; } }

                /* ================================================================= */
                /* 🚨 สไตล์หน้าต่างแจ้งเตือนความจริง (Reality Check) ดีไซน์ใหม่หมดจด 🚨 */
                /* ================================================================= */
                .reality-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(6, 4, 14, 0.94);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 20px;
                    animation: fadeIn 0.4s ease-out forwards;
                }

                .reality-modal {
                    background: linear-gradient(145deg, rgba(28, 20, 48, 0.95) 0%, rgba(15, 10, 28, 0.98) 100%);
                    border: 1px solid rgba(255, 51, 102, 0.35);
                    padding: 40px;
                    border-radius: 28px;
                    max-width: 620px;
                    width: 100%;
                    box-shadow: 0 25px 60px rgba(0,0,0,0.8), 
                                0 0 40px rgba(255, 51, 102, 0.15);
                    position: relative;
                    overflow: hidden;
                    box-sizing: border-box;
                    animation: scaleUp 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
                }

                /* แถบไฟนีออนสีแดงวิ่งแจ้งเตือนด้านบนสุดของกล่อง */
                .danger-glow-bar {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 5px;
                    background: linear-gradient(90deg, #ff0055, #ff3366, #ff0055);
                    box-shadow: 0 2px 15px #ff0055;
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    margin-bottom: 22px;
                }

                .warning-icon {
                    font-size: 2.6rem;
                    filter: drop-shadow(0 0 10px rgba(255,193,7,0.6));
                    animation: pulseGlow 1.5s infinite ease-in-out;
                }

                .reality-modal h2 {
                    color: #ff3366;
                    font-size: 2.4rem;
                    font-weight: 900;
                    margin: 0;
                    letter-spacing: 0.5px;
                    text-shadow: 0 0 15px rgba(255,51,102,0.3);
                }

                .reality-content {
                    color: #d1caec;
                    font-size: 1.05rem;
                    line-height: 1.6;
                }

                .main-warning-desc {
                    text-align: center;
                    font-size: 1.2rem;
                    margin-bottom: 25px;
                    color: #e2ddf7;
                }

                .main-warning-desc span {
                    color: #ff3366;
                    font-weight: 800;
                    text-decoration: underline;
                }

                /* กล่องผังกลลวงเจ้ามือ (สไตล์เรียบหรู อ่านง่าย เป็นขั้นตอน) */
                .trick-box {
                    background: rgba(10, 7, 20, 0.7);
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 16px;
                    padding: 22px 25px;
                    margin-bottom: 25px;
                    box-shadow: inset 0 4px 20px rgba(0,0,0,0.5);
                }

                .trick-title {
                    margin: 0 0 18px 0;
                    color: #ffb703;
                    font-size: 1.15rem;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    padding-bottom: 8px;
                }

                .timeline-steps {
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                }

                .step-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 15px;
                    font-size: 0.95rem;
                }

                .step-badge {
                    padding: 3px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    white-space: nowrap;
                    margin-top: 3px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }

                .step-1 { background: #00f0ff; color: #030a16; }
                .step-2 { background: #ff00aa; color: #ffffff; }
                .step-3 { background: #ff3366; color: #ffffff; }

                .step-item p { margin: 0; color: #c0b9dd; }
                .step-item strong { color: #ffffff; font-weight: 600; }
                
                .alert-step {
                    background: rgba(255, 51, 102, 0.08);
                    padding: 8px 12px;
                    border-radius: 10px;
                    border-left: 3px solid #ff3366;
                    margin-left: -10px;
                }

                .system-never-loses {
                    background: rgba(0, 255, 135, 0.06);
                    border: 1px dashed rgba(0, 255, 135, 0.3);
                    padding: 12px;
                    border-radius: 12px;
                    text-align: center;
                    color: #00ff87;
                    font-size: 1.15rem;
                    font-weight: 600;
                    margin-bottom: 30px;
                }

                .system-never-loses span {
                    font-weight: 900;
                    text-shadow: 0 0 10px rgba(0,255,135,0.4);
                }

                /* 🕹️ แผงควบคุมปุ่มกดแบบคู่ (วางคู่ขนานซ้ายขวาอย่างสมดุล) */
                .modal-action-row {
                    display: flex;
                    gap: 16px;
                    width: 100%;
                }

                /* ปุ่มรอง: วนกลับไปทดสอบระบบโกงอีกรอบ */
                .reset-loop-btn {
                    flex: 1;
                    background: rgba(31, 26, 58, 0.8);
                    border: 1px solid rgba(163, 158, 196, 0.2);
                    color: #a39ec4;
                    padding: 15px 0;
                    font-size: 1rem;
                    font-weight: 600;
                    border-radius: 14px;
                    cursor: pointer;
                    font-family: 'Kanit';
                    transition: all 0.2s ease;
                }

                .reset-loop-btn:hover {
                    background: #251f46;
                    color: white;
                    border-color: rgba(163, 158, 196, 0.5);
                }

                /* 🌟 ปุ่มหลัก: ไปด่านต่อไป (สไตล์สดใส นำสายตา ชวนให้กดก้าวหน้าเพิ่มบทเรียน) */
                .next-stage-btn {
                    flex: 1.3;
                    background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%);
                    border: none;
                    color: white;
                    padding: 15px 0;
                    font-size: 1.15rem;
                    font-weight: 800;
                    border-radius: 14px;
                    cursor: pointer;
                    font-family: 'Kanit';
                    box-shadow: 0 8px 20px rgba(0, 114, 255, 0.35);
                    transition: all 0.2s ease;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .next-stage-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 25px rgba(0, 240, 255, 0.5);
                    filter: brightness(1.1);
                }

                .next-stage-btn:active {
                    transform: translateY(1px);
                }

                /* ---- Keyframes Animations ---- */
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                @keyframes pulseGlow { 0%, 100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.1); filter: brightness(1.3); } }

                /* รองรับการแสดงผลบนสมาร์ทโฟนให้ปุ่มซ้อนกันแนวตั้งอัตโนมัติ */
                @media (max-width: 500px) {
                    .modal-action-row { flex-direction: column-reverse; gap: 10px; }
                    .reality-modal { padding: 25px; }
                    .reality-modal h2 { font-size: 1.8rem; }
                }
            `}</style>
        </div>
    );
}