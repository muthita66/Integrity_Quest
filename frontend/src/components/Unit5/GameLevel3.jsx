import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaUserTie,
    FaFileAlt,
    FaCheck,
    FaTimes,
    FaClock,
    FaCoins,
    FaShieldAlt,
    FaStar,
    FaRedoAlt,
    FaPlay,
    FaHandHoldingUsd,
} from "react-icons/fa";

// ─────────────────────────────────────────────
// ข้อมูลโครงการตัวอย่าง — แก้ไข/เพิ่มได้ตามต้องการ
// correctAction: "approve" = โครงการดี ควรอนุมัติ
//                "reject"  = โครงการมีพิรุธ ควรปฏิเสธ
// bribe: true = จะมี pop-up เสนอสินบนก่อนตัดสินใจ
// ─────────────────────────────────────────────
const PROJECTS = [
    {
        name: "สร้างโรงเรียนบ้านหนองบัว",
        budget: "18 ล้านบาท",
        priceEstimate: "18 ล้านบาท",
        contractor: "สยามก่อสร้าง จำกัด",
        documents: "ครบถ้วน",
        history: "ไม่เคยมีประวัติปัญหา",
        correctAction: "approve",
        bribe: false,
    },
    {
        name: "ซ่อมแซมถนนสายหลัก",
        budget: "42 ล้านบาท",
        priceEstimate: "21 ล้านบาท",
        contractor: "ABC Construction",
        documents: "ครบถ้วน",
        history: "เคยถูกตรวจสอบ 1 ครั้ง",
        correctAction: "reject",
        bribe: false,
    },
    {
        name: "สร้างโรงพยาบาลชุมชน",
        budget: "25 ล้านบาท",
        priceEstimate: "24 ล้านบาท",
        contractor: "เมดคอน จำกัด",
        documents: "ครบถ้วน",
        history: "ขึ้นบัญชีดำ (Black List)",
        correctAction: "reject",
        bribe: false,
    },
    {
        name: "สร้างสวนสาธารณะกลางเมือง",
        budget: "12 ล้านบาท",
        priceEstimate: "12 ล้านบาท",
        contractor: "กรีนสเปซ จำกัด",
        documents: "ครบถ้วน",
        history: "เคยทำโครงการสำเร็จ 3 ครั้ง",
        correctAction: "approve",
        bribe: true,
        bribeAmount: "5 ล้านบาท",
    },
    {
        name: "ก่อสร้างสถานีดับเพลิงประจำเขต",
        budget: "30 ล้านบาท",
        priceEstimate: "14 ล้านบาท",
        contractor: "ผู้เสนอราคา 3 บริษัท (ที่อยู่เดียวกัน)",
        documents: "ครบถ้วน",
        history: "บริษัทเดิมชนะประมูล 5 ครั้งติด",
        correctAction: "reject",
        bribe: false,
    },
    {
        name: "ปรับปรุงระบบน้ำประปาหมู่บ้าน",
        budget: "16 ล้านบาท",
        priceEstimate: "15.5 ล้านบาท",
        contractor: "น้ำใสวิศวกรรม",
        documents: "ไม่มีลายเซ็นผู้อนุมัติ",
        history: "ไม่เคยมีประวัติปัญหา",
        correctAction: "reject",
        bribe: false,
    },
    {
        name: "สร้างห้องสมุดประชาชน",
        budget: "9 ล้านบาท",
        priceEstimate: "9 ล้านบาท",
        contractor: "ปัญญาก่อสร้าง จำกัด",
        documents: "ครบถ้วน",
        history: "ไม่เคยมีประวัติปัญหา",
        correctAction: "approve",
        bribe: false,
    },
    {
        name: "ขยายถนนเข้าหมู่บ้านสันติสุข",
        budget: "50 ล้านบาท",
        priceEstimate: "19 ล้านบาท",
        contractor: "ผู้รับเหมาไม่ทราบชื่อ",
        documents: "เลขที่หนังสือซ้ำกับโครงการอื่น",
        history: "เคยสร้างถนนพัง",
        correctAction: "reject",
        bribe: true,
        bribeAmount: "3 ล้านบาท",
    },
];

const GAME_SECONDS = 120;

export default function IntegrityInspector({ nextRoute = "/unit5/gamelevel1" }) {
    const navigate = useNavigate();

    const [index, setIndex] = useState(0);
    const [phase, setPhase] = useState("entering"); // entering | bribeOffer | deciding | stamping | result | leaving | summary
    const [stampType, setStampType] = useState(null); // "approved" | "rejected"
    const [feedback, setFeedback] = useState(null); // { correct, delta, integrityDelta, note }

    const [score, setScore] = useState(0);
    const [integrity, setIntegrity] = useState(100);
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);

    const timerRef = useRef(null);
    const project = PROJECTS[index];

    // ───────── นาฬิกานับถอยหลัง ─────────
    useEffect(() => {
        if (phase === "summary") return;
        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    setPhase("summary");
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase]);

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");

    // ───────── เมื่อการ์ดใหม่เดินเข้ามา ─────────
    useEffect(() => {
        if (phase !== "entering") return;
        const t = setTimeout(() => {
            setPhase(project.bribe ? "bribeOffer" : "deciding");
        }, 950);
        return () => clearTimeout(t);
    }, [phase, project]);

    const goNext = useCallback(() => {
        if (index + 1 < PROJECTS.length) {
            setIndex((i) => i + 1);
            setStampType(null);
            setFeedback(null);
            setPhase("entering");
        } else {
            setPhase("summary");
        }
    }, [index]);

    // ───────── ออกจากฉากหลังโชว์ผล ─────────
    useEffect(() => {
        if (phase !== "leaving") return;
        const t = setTimeout(goNext, 650);
        return () => clearTimeout(t);
    }, [phase, goNext]);

    // ───────── ซ่อนผลฟีดแบ็กแล้วให้คนเดินออก ─────────
    useEffect(() => {
        if (phase !== "result") return;
        const t = setTimeout(() => setPhase("leaving"), 1200);
        return () => clearTimeout(t);
    }, [phase]);

    function applyOutcome(action, { forcedBribe = false } = {}) {
        const correct = project.correctAction === action;
        let delta = 0;
        let integrityDelta = 0;
        let note = "";

        if (forcedBribe) {
            delta = -15;
            integrityDelta = -20;
            note = "รับสินบน";
        } else if (action === "approve" && correct) {
            delta = 10;
            note = "อนุมัติถูกต้อง";
        } else if (action === "reject" && correct) {
            delta = 15;
            note = "ปฏิเสธโครงการโกงได้ถูกต้อง";
        } else if (action === "approve" && !correct) {
            delta = -20;
            integrityDelta = -15;
            note = "อนุมัติโครงการที่มีพิรุธ";
        } else if (action === "reject" && !correct) {
            delta = -10;
            note = "ปฏิเสธโครงการที่ดี";
        }

        setScore((s) => Math.max(0, s + delta));
        setIntegrity((v) => Math.min(100, Math.max(0, v + integrityDelta)));
        if (correct && !forcedBribe) setCorrectCount((c) => c + 1);
        else setWrongCount((c) => c + 1);

        setFeedback({ correct: correct && !forcedBribe, delta, integrityDelta, note });
        setStampType(action === "approve" ? "approved" : "rejected");
        setPhase("stamping");
        setTimeout(() => setPhase("result"), 850);
    }

    function handleDecision(action) {
        if (phase !== "deciding") return;
        applyOutcome(action);
    }

    function handleBribe(accept) {
        if (phase !== "bribeOffer") return;
        if (accept) {
            applyOutcome("approve", { forcedBribe: true });
        } else {
            setPhase("deciding");
        }
    }

    function resetGame() {
        setIndex(0);
        setPhase("entering");
        setStampType(null);
        setFeedback(null);
        setScore(0);
        setIntegrity(100);
        setCorrectCount(0);
        setWrongCount(0);
        setTimeLeft(GAME_SECONDS);
    }

    const finalScore = Math.min(100, score);
    const { rank, rankText, flavor } = (() => {
        if (finalScore >= 90 && integrity >= 85) return { rank: "S", rankText: "ยอดเยี่ยม", flavor: "ประชาชนเชื่อมั่นในหน่วยงานของคุณ คุณปกป้องภาษีของประชาชนได้สำเร็จ" };
        if (finalScore >= 75) return { rank: "A", rankText: "ดีมาก", flavor: "คุณตรวจสอบได้อย่างละเอียดรอบคอบ" };
        if (finalScore >= 55) return { rank: "B", rankText: "ดี", flavor: "ยังมีบางจุดที่พลาดไปบ้าง แต่โดยรวมทำได้ดี" };
        if (finalScore >= 35) return { rank: "C", rankText: "พอใช้", flavor: "ควรตรวจสอบเอกสารให้ละเอียดขึ้น" };
        return { rank: "D", rankText: "ควรปรับปรุง", flavor: "งบประมาณของประชาชนเสียหายไปไม่น้อย ลองใหม่อีกครั้ง" };
    })();

    return (
        <>
            <style>{css}</style>

            <div className="inspector-stage">

                {phase === "summary" ? (
                    <div className="summary-card">
                        <h1>Integrity Inspector</h1>
                        <p className="summary-sub">ตรวจทั้งหมด {correctCount + wrongCount} โครงการ</p>

                        <div className="summary-grid">
                            <div className="summary-item good">
                                <FaCheck />
                                <strong>{correctCount}</strong>
                                <span>ถูกต้อง</span>
                            </div>
                            <div className="summary-item bad">
                                <FaTimes />
                                <strong>{wrongCount}</strong>
                                <span>ผิด</span>
                            </div>
                            <div className="summary-item">
                                <FaShieldAlt />
                                <strong>{integrity}%</strong>
                                <span>Integrity</span>
                            </div>
                            <div className="summary-item">
                                <FaStar />
                                <strong>{finalScore}</strong>
                                <span>คะแนน</span>
                            </div>
                        </div>

                        <div className="summary-rank">
                            <div className="rank-shield">{rank}</div>
                            <div className="rank-text">{rankText}</div>
                        </div>

                        <p className="summary-flavor">{flavor}</p>

                        <div className="summary-buttons">
                            <button className="btn blue" onClick={resetGame}>
                                <FaRedoAlt />
                                <div>
                                    <strong>เล่นใหม่</strong>
                                    <span>เริ่มใหม่อีกครั้ง</span>
                                </div>
                            </button>
                            <button className="btn green" onClick={() => navigate("/map")}>
                                <FaPlay />
                                <div>
                                    <strong>ด่านต่อไป</strong>
                                    <span>ไปยังภารกิจถัดไป</span>
                                </div>
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ───────── HUD บน ───────── */}
                        <div className="hud">
                            <div className="hud-chip">
                                <FaClock />
                                <span>{mm}:{ss}</span>
                            </div>
                            <div className="hud-chip">
                                <FaCoins />
                                <span>{100 - wrongCount * 5} ล้านบาท</span>
                            </div>
                            <div className="hud-chip">
                                <FaStar />
                                <span>คะแนน {score}</span>
                            </div>
                            <div className="hud-chip">
                                <FaShieldAlt />
                                <span>Integrity {integrity}%</span>
                            </div>
                        </div>

                        {/* ───────── ฉากตรวจเอกสาร ───────── */}
                        <div className="booth">

                            <div className="spotlight" />

                            <div className={`character ${phase === "leaving" ? "char-leave" : "char-enter"}`}>
                                <FaUserTie />
                            </div>

                            <div
                                className={
                                    "document " +
                                    (phase === "entering" ? "doc-enter" : "") +
                                    (phase === "leaving" ? " doc-leave" : "")
                                }
                            >
                                <div className="document-head">
                                    <FaFileAlt />
                                    เอกสารโครงการ
                                </div>

                                <div className="doc-row">
                                    <span>โครงการ</span>
                                    <strong>{project.name}</strong>
                                </div>
                                <div className="doc-row">
                                    <span>งบประมาณ</span>
                                    <strong>{project.budget}</strong>
                                </div>
                                <div className="doc-row">
                                    <span>ราคากลาง</span>
                                    <strong>{project.priceEstimate}</strong>
                                </div>
                                <div className="doc-row">
                                    <span>ผู้รับเหมา</span>
                                    <strong>{project.contractor}</strong>
                                </div>
                                <div className="doc-row">
                                    <span>เอกสาร</span>
                                    <strong>{project.documents}</strong>
                                </div>
                                <div className="doc-row">
                                    <span>ประวัติ</span>
                                    <strong>{project.history}</strong>
                                </div>

                                {stampType && (phase === "stamping" || phase === "result" || phase === "leaving") && (
                                    <div className={`stamp ${stampType} stamp-slam`}>
                                        <div className="stamp-ring">
                                            <span>{stampType === "approved" ? "APPROVED" : "REJECTED"}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {feedback && phase === "result" && (
                                <div className={`feedback ${feedback.correct ? "good" : "bad"}`}>
                                    {feedback.note} {feedback.delta >= 0 ? "+" : ""}{feedback.delta} คะแนน
                                    {feedback.integrityDelta !== 0 && `, Integrity ${feedback.integrityDelta}`}
                                </div>
                            )}

                            {phase === "bribeOffer" && (
                                <div className="bribe-modal">
                                    <FaHandHoldingUsd className="bribe-icon" />
                                    <p>ผู้รับเหมาเสนอเงิน <strong>{project.bribeAmount}</strong> หากอนุมัติโครงการนี้</p>
                                    <div className="bribe-buttons">
                                        <button className="btn small gray" onClick={() => handleBribe(false)}>ปฏิเสธ</button>
                                        <button className="btn small red" onClick={() => handleBribe(true)}>รับ</button>
                                    </div>
                                </div>
                            )}

                            <div className="counter" />
                        </div>

                        {/* ───────── ปุ่มตัดสินใจ (สลับ: ปฏิเสธซ้าย / อนุมัติขวา) ───────── */}
                        <div className="decision-buttons">
                            <button
                                className="btn big reject"
                                disabled={phase !== "deciding"}
                                onClick={() => handleDecision("reject")}
                            >
                                <FaTimes /> ปฏิเสธ
                            </button>
                            <button
                                className="btn big approve"
                                disabled={phase !== "deciding"}
                                onClick={() => handleDecision("approve")}
                            >
                                <FaCheck /> อนุมัติ
                            </button>
                        </div>
                    </>
                )}

            </div>
        </>
    );
}

const css = `
*{
box-sizing:border-box;
margin:0;
padding:0;
font-family:Inter,sans-serif;
}

html, body, #root{
height:100%;
}

/* ───────── กรอบเกมพอดีจอ ไม่มีสกอลล์ ───────── */
.inspector-stage{
height:100vh;
height:100dvh;
overflow:hidden;
padding:clamp(8px,1.5vh,18px) clamp(8px,2vw,18px);
display:flex;
flex-direction:column;
gap:clamp(6px,1.2vh,16px);
align-items:center;
justify-content:center;
background:
radial-gradient(circle at 50% 0%,#2a2015 0%,#0a0906 65%);
color:white;
}

/* ───────── HUD ───────── */
.hud{
width:min(96vw,900px);
flex-shrink:0;
display:flex;
justify-content:space-between;
gap:8px;
flex-wrap:wrap;
}

.hud-chip{
flex:1;
min-width:120px;
display:flex;
align-items:center;
justify-content:center;
gap:6px;
padding:clamp(6px,1vh,10px) 12px;
border-radius:12px;
background:#1a1712;
border:1px solid #3a3020;
font-weight:700;
font-size:clamp(11px,1.6vh,14px);
color:#f0d896;
}

.hud-chip svg{
color:#e6b93d;
}

/* ───────── ฉากตรวจเอกสาร ───────── */
.booth{
position:relative;
width:min(96vw,900px);
flex:1 1 auto;
min-height:0;
border-radius:20px;
overflow:hidden;
background:linear-gradient(#141110 0%,#141110 68%,#4a2f16 68%,#2b1a0c 100%);
border:2px solid #3a3020;
display:flex;
align-items:flex-end;
justify-content:center;
}

.spotlight{
position:absolute;
top:-15%;
left:50%;
transform:translateX(-50%);
width:60%;
aspect-ratio:1/1;
border-radius:50%;
background:radial-gradient(circle,rgba(255,230,170,.12),transparent 70%);
pointer-events:none;
}

.counter{
position:absolute;
bottom:26%;
left:0;
right:0;
height:6px;
background:linear-gradient(90deg,transparent,#7a5326,transparent);
opacity:.6;
}

.character{
position:absolute;
bottom:24%;
left:6%;
font-size:clamp(36px,7vh,70px);
color:#c9b58a;
filter:drop-shadow(0 8px 10px rgba(0,0,0,.5));
}

@keyframes charEnter{
from{ transform:translateX(-140px); opacity:0; }
to{ transform:translateX(0); opacity:1; }
}
@keyframes charLeave{
from{ transform:translateX(0); opacity:1; }
to{ transform:translateX(-140px); opacity:0; }
}

.char-enter{ animation:charEnter .8s ease-out; }
.char-leave{ animation:charLeave .6s ease-in forwards; }

.document{
position:relative;
width:min(80%,340px);
max-height:82%;
margin-bottom:22%;
padding:clamp(10px,2vh,18px) clamp(12px,2vw,20px);
background:#f3ecda;
color:#2c2416;
border-radius:6px;
box-shadow:
0 2px 0 #d8cca4,
0 18px 34px rgba(0,0,0,.55);
transform:rotate(-1.5deg);
overflow:auto;
}

@keyframes docEnter{
from{ transform:translate(-220px,10px) rotate(-8deg); opacity:0; }
to{ transform:translate(0,0) rotate(-1.5deg); opacity:1; }
}
@keyframes docLeave{
from{ transform:translate(0,0) rotate(-1.5deg); opacity:1; }
to{ transform:translate(-220px,10px) rotate(-8deg); opacity:0; }
}

.doc-enter{ animation:docEnter .8s ease-out; }
.doc-leave{ animation:docLeave .6s ease-in forwards; }

.document-head{
display:flex;
align-items:center;
gap:8px;
font-size:clamp(13px,1.8vh,16px);
font-weight:800;
padding-bottom:8px;
margin-bottom:8px;
border-bottom:2px dashed #b6a877;
color:#5a4520;
}

.doc-row{
display:flex;
justify-content:space-between;
gap:10px;
font-size:clamp(11px,1.5vh,13px);
padding:clamp(3px,0.7vh,6px) 0;
border-bottom:1px solid #e0d6b8;
}

.doc-row span{
color:#7a6b45;
flex-shrink:0;
}

.doc-row strong{
text-align:right;
font-weight:700;
}

/* ───────── ตราปั๊ม ───────── */
.stamp{
position:absolute;
top:38%;
left:50%;
width:38%;
aspect-ratio:1/1;
max-width:150px;
transform:translate(-50%,-50%) rotate(-14deg);
mix-blend-mode:multiply;
pointer-events:none;
}

.stamp-ring{
width:100%;
height:100%;
border-radius:50%;
border:5px double currentColor;
display:flex;
align-items:center;
justify-content:center;
text-align:center;
padding:10px;
}

.stamp-ring span{
font-size:clamp(13px,2.2vh,19px);
font-weight:900;
letter-spacing:1px;
line-height:1.15;
}

.stamp.approved{ color:#1f8a3b; }
.stamp.rejected{ color:#c62828; }

@keyframes stampSlam{
0%{ transform:translate(-50%,-50%) rotate(-14deg) scale(3.4); opacity:0; }
55%{ transform:translate(-50%,-50%) rotate(-10deg) scale(0.9); opacity:1; }
75%{ transform:translate(-50%,-50%) rotate(-13deg) scale(1.08); opacity:1; }
100%{ transform:translate(-50%,-50%) rotate(-12deg) scale(1); opacity:.9; }
}

.stamp-slam{ animation:stampSlam .55s cubic-bezier(.2,.9,.3,1) forwards; }

/* ───────── ฟีดแบ็ก ───────── */
.feedback{
position:absolute;
top:10px;
left:50%;
transform:translateX(-50%);
padding:8px 18px;
border-radius:999px;
font-weight:800;
font-size:clamp(11px,1.6vh,14px);
white-space:nowrap;
animation:fadeDown .3s ease-out;
z-index:6;
}

.feedback.good{ background:#1f8a3b; color:white; }
.feedback.bad{ background:#c62828; color:white; }

@keyframes fadeDown{
from{ opacity:0; transform:translate(-50%,-10px); }
to{ opacity:1; transform:translate(-50%,0); }
}

/* ───────── สินบน ───────── */
.bribe-modal{
position:absolute;
inset:0;
background:rgba(5,5,5,.78);
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:14px;
padding:24px;
text-align:center;
z-index:5;
}

.bribe-icon{
font-size:clamp(30px,5vh,44px);
color:#ffd54a;
}

.bribe-modal p{
font-size:clamp(13px,2vh,16px);
max-width:320px;
color:#f0e6cf;
}

.bribe-buttons{
display:flex;
gap:14px;
}

/* ───────── ปุ่ม ───────── */
.decision-buttons{
width:min(96vw,900px);
flex-shrink:0;
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.btn{
border:none;
border-radius:14px;
cursor:pointer;
color:white;
font-weight:800;
display:flex;
align-items:center;
justify-content:center;
gap:10px;
transition:.2s;
}

.btn:disabled{
opacity:.35;
cursor:not-allowed;
}

.btn.big{
height:clamp(46px,7vh,58px);
font-size:clamp(14px,2vh,18px);
}

.btn.small{
height:40px;
padding:0 22px;
font-size:14px;
}

.btn:not(:disabled):hover{
transform:translateY(-2px);
}

.approve{ background:linear-gradient(#30c84c,#15962b); }
.reject{ background:linear-gradient(#ff4d4d,#c62828); }
.red{ background:linear-gradient(#ff4d4d,#c62828); }
.gray{ background:linear-gradient(#5b6472,#3a4048); }
.blue{ background:linear-gradient(#2d8cff,#1450c6); }
.green{ background:linear-gradient(#30c84c,#15962b); }

/* ───────── หน้าสรุปผล ───────── */
.summary-card{
width:min(94vw,520px);
max-height:96vh;
overflow:auto;
background:#141110;
border:2px solid #c99833;
border-radius:22px;
padding:clamp(18px,3vh,32px) clamp(16px,3vw,28px);
text-align:center;
box-shadow:0 20px 50px rgba(0,0,0,.55);
}

.summary-card h1{
font-size:clamp(20px,3.2vh,28px);
color:#ffcb3f;
font-weight:900;
}

.summary-sub{
margin-top:6px;
color:#a9a186;
font-size:14px;
}

.summary-grid{
margin-top:22px;
display:grid;
grid-template-columns:repeat(4,1fr);
gap:10px;
}

.summary-item{
background:#1e1a14;
border:1px solid #3a3020;
border-radius:12px;
padding:12px 6px;
display:flex;
flex-direction:column;
align-items:center;
gap:4px;
font-size:12px;
color:#cfc4a4;
}

.summary-item strong{
font-size:20px;
color:white;
}

.summary-item.good strong{ color:#4ade80; }
.summary-item.bad strong{ color:#f87171; }

.summary-rank{
margin-top:24px;
display:flex;
flex-direction:column;
align-items:center;
gap:8px;
}

.rank-shield{
width:78px;
height:78px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:42px;
font-weight:900;
color:#7a4a00;
background:radial-gradient(circle at 35% 30%,#fff3b0,#ffcb33 55%,#c98910);
box-shadow:0 8px 20px rgba(255,180,0,.35);
}

.rank-text{
font-size:16px;
font-weight:800;
color:#ffcb3f;
}

.summary-flavor{
margin-top:16px;
font-size:14px;
line-height:1.6;
color:#d8cfb6;
}

.summary-buttons{
margin-top:24px;
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.summary-buttons .btn{
height:56px;
flex-direction:row;
}

.summary-buttons .btn div{
display:flex;
flex-direction:column;
align-items:flex-start;
}

.summary-buttons .btn span{
font-size:11px;
opacity:.85;
font-weight:500;
}

@media(max-width:640px){
.character{ left:3%; font-size:clamp(30px,6vh,50px); }
.document{ width:88%; }
}
`;