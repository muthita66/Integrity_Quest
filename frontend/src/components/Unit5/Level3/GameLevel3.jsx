import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isUnit5Paused } from '../Unit5Navigation';
import { useSound } from '../../../hooks/useSound';
import useGameMuted from '../../../hooks/useGameMuted';
import folderOpenSound from '../../../assets/sounds/Unit5/level1-case-folder-open.mp3';
import approvalStampSound from '../../../assets/sounds/Unit5/level3-approval-stamp.mp3';
import {
    FaFileAlt,
    FaCheck,
    FaTimes,
    FaClock,
    FaCoins,
    FaShieldAlt,
    FaStar,
    FaRedoAlt,
    FaMapMarkedAlt,
    FaHandHoldingUsd,
} from "react-icons/fa";
import gameBg from "../../../assets/unit5/build.png";
import inspectorImg from "../../../assets/unit5/inspector.png";
import briefingBg from "../../../assets/unit5/briefing.png";

// ─────────────────────────────────────────────
// เอกสารโครงการอยู่ใน DB (level_projects) — เฉลยอยู่ที่ backend เท่านั้น
//   เข้าเกม   → POST /api/game-play/start      { level_id } → play_id + projects
//   ปั๊มตรา   → POST /api/inspector-game/decide { playId, projectId, action, tookBribe, refusedBribe }
//   จบเกม     → POST /api/game-play/complete    { play_id, is_timeout } → Rank / IP
// ─────────────────────────────────────────────
const API_URL = "http://localhost:5000";
const LEVEL_ID = 16;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RANK_INFO = {
    S: { rankText: "ยอดเยี่ยม", flavor: "ประชาชนเชื่อมั่นในหน่วยงานของคุณ คุณปกป้องภาษีของประชาชนได้สำเร็จ" },
    A: { rankText: "ดีมาก", flavor: "คุณตรวจสอบได้อย่างละเอียดรอบคอบ" },
    B: { rankText: "ดี", flavor: "ยังมีบางจุดที่พลาดไปบ้าง แต่โดยรวมทำได้ดี" },
    C: { rankText: "พอใช้", flavor: "ควรตรวจสอบเอกสารให้ละเอียดขึ้น" },
    D: { rankText: "ควรปรับปรุง", flavor: "งบประมาณของประชาชนเสียหายไปไม่น้อย ลองใหม่อีกครั้ง" },
};

const GAME_SECONDS = 120;

export default function IntegrityInspector({ nextRoute = "/unit/unit6" }) {
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
    const startingRef = useRef(false);   // กัน StrictMode เริ่มเกมซ้ำ
    const finishingRef = useRef(false);  // กันเรียก complete ซ้ำ

    const [projects, setProjects] = useState([]);
    const [playId, setPlayId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [muted] = useGameMuted();
    const { play: playApprovalStamp, stop: stopApprovalStamp } = useSound(approvalStampSound, {
        volume: 0.6, preload: true,
    });
    useEffect(() => stopApprovalStamp, [stopApprovalStamp]);
    useEffect(() => { if (muted) stopApprovalStamp(); }, [muted, stopApprovalStamp]);
    const { play: playFolderOpen, stop: stopFolderOpen } = useSound(folderOpenSound, {
        volume: 0.4, loop: true, preload: true, retryOnInteract: true,
    });
    useEffect(() => {
        if (loading && !muted) playFolderOpen();
        else stopFolderOpen();
        return stopFolderOpen;
    }, [loading, muted, playFolderOpen, stopFolderOpen]);
    const [pending, setPending] = useState(false);       // กำลังส่งคำตัดสิน
    const [refusedBribe, setRefusedBribe] = useState(false);
    const [result, setResult] = useState(null);          // ผลจาก complete
    const [errorText, setErrorText] = useState("");
    const [finishFailed, setFinishFailed] = useState(false);

    const project = projects[index];

    const handleAuthError = (response) => {
        if (response.status === 401) {
            navigate("/", { replace: true });
            return true;
        }
        return false;
    };

    // ───────── เริ่มรอบใหม่ ─────────
    const startPlay = useCallback(async () => {
        if (startingRef.current) return;
        startingRef.current = true;
        setLoading(true);

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
            setProjects(data.data.projects || []);
            setTimeLeft(data.data.time_limit ?? GAME_SECONDS);
        } catch (error) {
            console.error("Start inspector game error:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            navigate("/map", { replace: true });
        } finally {
            startingRef.current = false;
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    useEffect(() => {
        startPlay();
    }, [startPlay]);

    // ───────── จบเกม → บันทึกผล ─────────
    const finish = useCallback(
        async (isTimeout = false) => {
            if (!playId || finishingRef.current) return;
            finishingRef.current = true;
            clearInterval(timerRef.current);
            setErrorText("");
            setFinishFailed(false);

            try {
                const response = await fetch(`${API_URL}/api/game-play/complete`, {
                    method: "POST",
                    headers: authHeaders(),
                    body: JSON.stringify({ play_id: playId, is_timeout: isTimeout }),
                });

                if (handleAuthError(response)) return;

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "บันทึกผลไม่สำเร็จ");
                }

                setResult(data.data ?? null);
                setPhase("summary");
            } catch (error) {
                console.error("Complete inspector game error:", error);
                setErrorText(error.message || "บันทึกผลไม่สำเร็จ");
                setFinishFailed(true);
            } finally {
                finishingRef.current = false;
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [playId]
    );

    // ───────── นาฬิกานับถอยหลัง ─────────
    useEffect(() => {
        if (phase === "summary" || loading || !playId) return;
        timerRef.current = setInterval(() => {
            if (isUnit5Paused()) return;
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    finish(true); // หมดเวลา → จบเกม
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [phase, loading, playId, finish]);

    const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
    const ss = String(timeLeft % 60).padStart(2, "0");

    // ───────── เมื่อการ์ดใหม่เดินเข้ามา ─────────
    useEffect(() => {
        if (phase !== "entering" || !project) return;
        const t = setTimeout(() => {
            setPhase(project.bribe ? "bribeOffer" : "deciding");
        }, 950);
        return () => clearTimeout(t);
    }, [phase, project]);

    const goNext = useCallback(() => {
        if (index + 1 < projects.length) {
            setIndex((i) => i + 1);
            setStampType(null);
            setFeedback(null);
            setRefusedBribe(false);
            setPhase("entering");
        } else {
            finish(false); // ตัดสินครบทุกโครงการ
        }
    }, [index, projects.length, finish]);

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

    // ส่งคำตัดสินให้ backend ตรวจ แล้วค่อยปั๊มตรา + โชว์ผล
    async function applyOutcome(action, { forcedBribe = false } = {}) {
        if (pending || !playId || !project) return;

        setPending(true);
        setErrorText("");

        try {
            const response = await fetch(`${API_URL}/api/inspector-game/decide`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    playId,
                    projectId: project.project_id,
                    action,
                    tookBribe: forcedBribe,
                    refusedBribe,
                }),
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            // ตัดสินไปแล้ว (เช่น กดซ้ำ) → ไปโครงการถัดไป
            if (response.status === 409) {
                setPhase("leaving");
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "บันทึกการตัดสินไม่สำเร็จ");
            }

            const r = data.data;

            setScore(r.score);
            setIntegrity(r.integrity);
            if (r.is_correct) setCorrectCount((c) => c + 1);
            else setWrongCount((c) => c + 1);

            setFeedback({
                correct: r.is_correct,
                delta: r.score_delta,
                integrityDelta: r.integrity_delta,
                note: r.note,
            });
            setStampType(action === "approve" ? "approved" : "rejected");
            if (!muted) playApprovalStamp();
            setPhase("stamping");
            setTimeout(() => setPhase("result"), 850);
        } catch (error) {
            console.error("Inspector decide error:", error);
            setErrorText(error.message || "บันทึกการตัดสินไม่สำเร็จ ลองอีกครั้ง");
        } finally {
            setPending(false);
        }
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
            setRefusedBribe(true);
            setPhase("deciding");
        }
    }

    // เล่นใหม่ = เริ่มรอบใหม่ (play_id ใหม่ — รอบเก่ายังอยู่ในประวัติ)
    function resetGame() {
        setResult(null);
        setErrorText("");
        setRefusedBribe(false);
        startPlay();
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

    // ผลสุดท้ายมาจาก backend (complete)
    const finalScore = result?.score ?? Math.min(100, score);
    const finalIntegrity = result?.integrity ?? integrity;
    const rank = result?.rank ?? "D";
    const { rankText, flavor } = RANK_INFO[rank] || RANK_INFO.D;
    const earnedIP = result?.earned_ip ?? 0;
    const missionFailed = Boolean(
        result?.is_timeout ||
        (result && Number(result.decided ?? 0) < Number(result.total_projects ?? projects.length))
    );
    const displayCorrect = missionFailed ? 0 : (result?.correct_count ?? correctCount);
    const displayWrong = missionFailed ? 0 : (result?.wrong_count ?? wrongCount);
    const displayIntegrity = missionFailed ? 0 : finalIntegrity;
    const displayScore = missionFailed ? 0 : finalScore;
    const displayRank = missionFailed ? "—" : rank;
    const displayRankText = missionFailed ? "ภารกิจยังไม่สำเร็จ" : rankText;
    const displayFlavor = missionFailed
        ? "ภารกิจยังไม่เสร็จสมบูรณ์ กรุณาเริ่มใหม่และตรวจสอบโครงการให้ครบทุกแฟ้ม"
        : flavor;
    const displayIP = missionFailed ? 0 : earnedIP;

    if (loading || !project) {
        return (
            <>
                <style>{css}</style>
                <div className="inspector-stage" style={{ backgroundImage: `linear-gradient(rgba(24, 12, 6, .62), rgba(24, 12, 6, .78)), url(${gameBg})` }}>
                    <p style={{ color: "#f0d896", fontSize: 18 }}>กำลังเตรียมเอกสารโครงการ...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <style>{css}</style>

            <div className="inspector-stage" style={{ backgroundImage: `linear-gradient(rgba(24, 12, 6, .62), rgba(24, 12, 6, .78)), url(${gameBg})` }}>

                {phase === "summary" ? (
                    <div className="summary-card">
                        <div className="summary-kicker"><FaFileAlt /> CASE FILE 03 · MISSION COMPLETE</div>
                        <h1>รายงานการตรวจสอบโครงการ</h1>
                        <p className="summary-sub">
                            ตรวจทั้งหมด {result?.decided ?? correctCount + wrongCount} / {result?.total_projects ?? projects.length} โครงการ
                            {result?.is_timeout ? " (หมดเวลา)" : ""}
                        </p>

                        <div className="summary-grid">
                            <div className="summary-item good">
                                <FaCheck />
                                <strong>{displayCorrect}</strong>
                                <span>ถูกต้อง</span>
                            </div>
                            <div className="summary-item bad">
                                <FaTimes />
                                <strong>{displayWrong}</strong>
                                <span>ผิด</span>
                            </div>
                            <div className="summary-item">
                                <FaShieldAlt />
                                <strong>{displayIntegrity}%</strong>
                                <span>Integrity</span>
                            </div>
                            <div className="summary-item">
                                <FaStar />
                                <strong>{displayScore}</strong>
                                <span>คะแนน</span>
                            </div>
                        </div>

                        <div className="summary-rank">
                            <div className={`rank-shield ${missionFailed ? "failed" : ""}`}>{displayRank}</div>
                            <div className="rank-text">{displayRankText}</div>
                        </div>

                        <p className="summary-flavor">{displayFlavor}</p>

                        <p className="summary-reward">
                            ได้รับ +{displayIP} IP
                        </p>

                        <div className={`summary-buttons ${missionFailed ? "single" : ""}`}>
                            <button className="btn blue" onClick={resetGame}>
                                <FaRedoAlt />
                                <div>
                                    <strong>เริ่มใหม่</strong>
                                    <span>เริ่มใหม่อีกครั้ง</span>
                                </div>
                            </button>
                            {!missionFailed && (
                                <button className="btn green" onClick={() => navigate(nextRoute)}>
                                    <FaMapMarkedAlt />
                                    <div>
                                        <strong>ไปบทต่อไป</strong>
                                        <span>เริ่มบทที่ 6</span>
                                    </div>
                                </button>
                            )}
                            <button className="btn blue" onClick={() => navigate('/map')}><FaMapMarkedAlt />กลับหน้าแมพ</button>
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
                        <div
                            className="booth"
                            style={{
                                backgroundImage: `linear-gradient(rgba(24, 12, 6, .28), rgba(24, 12, 6, .56)), url(${briefingBg})`,
                            }}
                        >

                            <div className="spotlight" />

                            <img
                                src={inspectorImg}
                                alt="ผู้ตรวจสอบโครงการ"
                                className={`character ${phase === "leaving" ? "char-leave" : "char-enter"}`}
                            />

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
                                <div role="status" className={`feedback decision-feedback ${feedback.correct ? "good decision-correct" : "bad decision-wrong"}`}>
                                    <span className="decision-result-icon" aria-hidden="true">{feedback.correct ? <FaCheck /> : <FaTimes />}</span>
                                    <strong>{feedback.correct ? 'ตัดสินใจถูกต้อง!' : 'ตัดสินใจผิด!'}</strong>
                                    <div>{feedback.note} {feedback.delta >= 0 ? "+" : ""}{feedback.delta} คะแนน
                                    {feedback.integrityDelta !== 0 && `, Integrity ${feedback.integrityDelta}`}</div>
                                    {feedback.correct && <span className="decision-sparkles" aria-hidden="true">✦　✧　✦　✧　✦</span>}
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

                            {errorText && (
                                <div className="feedback bad" style={{ top: "auto", bottom: 10 }}>
                                    {errorText}
                                    {finishFailed && (
                                        <button
                                            type="button"
                                            onClick={() => finish(timeLeft === 0)}
                                            style={{ marginLeft: 10, textDecoration: "underline", color: "white", background: "none", border: "none", cursor: "pointer", fontWeight: 800 }}
                                        >
                                            ลองบันทึกผลอีกครั้ง
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="counter" />
                        </div>

                        {/* ───────── ปุ่มตัดสินใจ (สลับ: ปฏิเสธซ้าย / อนุมัติขวา) ───────── */}
                        <div className="decision-buttons">
                            <button
                                className="btn big reject"
                                disabled={phase !== "deciding" || pending}
                                onClick={() => handleDecision("reject")}
                            >
                                <FaTimes /> ปฏิเสธ
                            </button>
                            <button
                                className="btn big approve"
                                disabled={phase !== "deciding" || pending}
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
box-sizing:border-box;
padding-top:76px !important;
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
radial-gradient(circle at 50% 0%,#75421f 0%,#2c180e 38%,#120906 78%);
background-position:center;
background-size:cover;
background-repeat:no-repeat;
color:white;
}

/* ───────── HUD ───────── */
.hud{
width:min(78vw,820px);
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
background:linear-gradient(135deg,#3a2415,#21130c);
border:1px solid #956328;
font-weight:700;
font-size:clamp(11px,1.6vh,14px);
color:#ffe9ad;
box-shadow:0 5px 0 rgba(32,15,7,.3),inset 0 1px 0 rgba(255,244,210,.16);
}

.hud-chip svg{
color:#e6b93d;
}

/* ───────── ฉากตรวจเอกสาร ───────── */
.booth{
position:relative;
width:min(78vw,820px);
flex:0 1 auto;
height:min(66vh,640px);
min-height:0;
border-radius:26px;
overflow:hidden;
background:
radial-gradient(circle at 50% 25%,rgba(255,207,107,.13),transparent 34%),
linear-gradient(#1b120d 0%,#100b08 68%,#5a3216 68%,#2b160a 100%);
border:2px solid #805528;
box-shadow:0 12px 0 rgba(48,22,8,.35),inset 0 1px 0 rgba(255,236,180,.14);
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
bottom:0;
right:2%;
left:auto;
width:min(43%,360px);
height:90%;
object-fit:contain;
object-position:center bottom;
mix-blend-mode:normal;
filter:brightness(1) contrast(1.16) saturate(1.08) drop-shadow(0 8px 10px rgba(0,0,0,.6));
z-index:3;
}

@keyframes charEnter{
from{ transform:translateX(-140px); opacity:1; }
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
left:-13%;
width:min(48%,420px);
max-height:82%;
margin-bottom:22%;
padding:clamp(16px,2vh,24px) clamp(18px,2vw,28px);
background:linear-gradient(135deg,#fff9e9,#eadab4);
color:#2c2416;
border-radius:6px;
border:2px solid #d3b568;
box-shadow:
0 3px 0 #b18b3b,
0 18px 34px rgba(0,0,0,.55),
inset 0 0 0 6px rgba(255,255,255,.3);
transform:rotate(-1.5deg);
z-index:2;
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
font-size:clamp(15px,1.8vh,19px);
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
font-size:clamp(12px,1.5vh,15px);
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
.decision-feedback{border-radius:16px;max-width:90%;white-space:normal;text-align:center;padding:12px 18px;box-shadow:0 4px 22px #0006;}
.decision-feedback strong{display:block;font-size:clamp(16px,2.2vh,22px);margin:4px 0;}
.decision-result-icon{display:inline-grid;place-items:center;width:32px;height:32px;border:2px solid currentColor;border-radius:50%;}
.decision-correct{animation:decisionPop .45s ease-out;box-shadow:0 0 24px #39d77888;}
.decision-wrong{animation:decisionShake .4s ease-out;box-shadow:0 0 24px #ef535088;}
.decision-sparkles{display:block;color:#ffe37e;font-size:22px;animation:decisionSparkle .8s ease-out both;}
@keyframes decisionPop{from{opacity:0;transform:translateX(-50%) scale(.65);}70%{transform:translateX(-50%) scale(1.08);}to{opacity:1;transform:translateX(-50%) scale(1);}}
@keyframes decisionShake{0%,100%{transform:translateX(-50%);}20%,60%{transform:translateX(calc(-50% - 7px));}40%,80%{transform:translateX(calc(-50% + 7px));}}
@keyframes decisionSparkle{from{opacity:0;transform:scale(.5);}to{opacity:1;transform:scale(1);}}
@media(prefers-reduced-motion:reduce){.decision-feedback,.decision-sparkles{animation:none;}}

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
width:min(78vw,820px);
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

.approve{ background:linear-gradient(#f0c348,#bd7218); color:#2b1609; box-shadow:0 6px 0 #75410f; }
.reject{ background:linear-gradient(#e96847,#a52f1c); box-shadow:0 6px 0 #642217; }
.red{ background:linear-gradient(#ff4d4d,#c62828); }
.gray{ background:linear-gradient(#5b6472,#3a4048); }
.blue{ background:linear-gradient(#2d8cff,#1450c6); }
.green{ background:linear-gradient(#30c84c,#15962b); }

/* ───────── หน้าสรุปผล ───────── */
.summary-card{
width:min(94vw,520px);
max-height:96vh;
overflow:auto;
background:linear-gradient(145deg,rgba(28,20,15,.98),rgba(15,13,12,.98));
border:2px solid #c99833;
border-radius:24px;
padding:clamp(18px,3vh,32px) clamp(16px,3vw,28px);
text-align:center;
box-shadow:0 20px 50px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,220,130,.16);
position:relative;
}

.summary-card::before{
content:"";
position:absolute;
top:0;
left:12%;
right:12%;
height:3px;
background:linear-gradient(90deg,transparent,#ffcb3f,transparent);
border-radius:99px;
}

.summary-kicker{
display:inline-flex;
align-items:center;
gap:7px;
padding:6px 12px;
border:1px solid rgba(255,203,63,.35);
border-radius:999px;
background:rgba(201,152,51,.1);
color:#e6bf66;
font-size:10px;
font-weight:800;
letter-spacing:1.6px;
}

.summary-kicker svg{ color:#ffcb3f; }

.summary-card h1{
margin-top:13px;
letter-spacing:.3px;
text-shadow:0 3px 16px rgba(255,183,40,.18);
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
margin-top:20px;
display:grid;
grid-template-columns:repeat(4,1fr);
gap:10px;
padding-top:18px;
border-top:1px solid rgba(255,203,63,.14);
}

.summary-item{
background:#1e1a14;
border:1px solid #3a3020;
border-radius:12px;
padding:13px 6px;
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
margin:22px auto 0;
display:flex;
flex-direction:column;
align-items:center;
gap:8px;
}

.rank-shield{
width:84px;
height:84px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-size:42px;
font-weight:900;
color:#7a4a00;
background:radial-gradient(circle at 35% 30%,#fff3b0,#ffcb33 55%,#c98910);
box-shadow:0 8px 20px rgba(255,180,0,.35);
border:3px solid rgba(255,239,167,.65);
}

.rank-shield.failed{
color:#f1dfbd;
background:linear-gradient(145deg,#514334,#2b241d);
box-shadow:0 8px 20px rgba(0,0,0,.28);
border-color:#806b4b;
font-size:30px;
}

.rank-text{
font-size:16px;
font-weight:800;
color:#ffcb3f;
}

.summary-flavor{
margin:15px auto 0;
max-width:420px;
font-size:14px;
line-height:1.6;
color:#d8cfb6;
}

.summary-buttons{
margin-top:22px;
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.summary-buttons.single{
grid-template-columns:minmax(0,280px);
justify-content:center;
}

.summary-buttons .btn{
height:56px;
flex-direction:row;
border:1px solid rgba(255,255,255,.12);
box-shadow:0 7px 0 rgba(0,0,0,.22), 0 10px 22px rgba(0,0,0,.2);
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

.summary-card{position:relative;width:min(760px,94vw);max-height:calc(100dvh - 100px);overflow-y:auto;flex-shrink:0;padding:28px 32px;border:1px solid #d7b47b;border-top:8px solid #bf893c;border-radius:6px 22px 12px 12px;background:repeating-linear-gradient(0deg,transparent,transparent 29px,#ac895c0b 30px),#fff6e4;color:#493720;box-shadow:8px 8px 0 #b4884840,0 18px 50px #0006;}
.summary-kicker{background:#eee0c6;border:1px solid #d4bd94;color:#82602f;border-radius:4px;padding:7px 14px;letter-spacing:2px;}
.summary-kicker svg{color:#986d31;}
.summary-card h1{color:#4e3921;font-size:clamp(21px,3vh,30px);text-shadow:none;margin-top:14px;}
.summary-sub{color:#8c7657;}
.summary-grid{border-top:1px dashed #cdb48b;padding-top:16px;margin-top:16px;gap:12px;}
.summary-item{background:#fffaf0;border:1px solid #e4d4b9;border-radius:8px;color:#8a7354;padding:10px 6px;}
.summary-item strong{color:#4e3921;font-size:24px;}
.summary-item.good strong{color:#328457;}.summary-item.bad strong{color:#bd5146;}
.summary-rank{margin-top:18px;gap:6px;}
.rank-shield{width:78px;height:78px;box-shadow:0 5px 12px #a47b2930;}
.rank-text{color:#936b2e;}
.summary-flavor{color:#79664b;max-width:550px;margin-top:12px;}
.summary-reward{margin:16px auto 0;padding:10px 24px;width:fit-content;background:#e8efdc;border:1px solid #cad8b6;border-radius:6px;color:#54733d;font-size:22px;font-weight:900;}
.summary-card .summary-buttons{grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:22px;border-top:1px dashed #cdb48b;padding-top:18px;}
.summary-card .summary-buttons.single{grid-template-columns:repeat(2,minmax(0,1fr));}
.summary-card .summary-buttons .btn{height:54px;border:1px solid #c8ac80;border-radius:8px;background:#f6ecd9;color:#705332;box-shadow:0 3px 0 #d5c1a0;font-size:15px;}
.summary-card .summary-buttons .btn.green{background:#755534;border-color:#755534;color:#fff6e4;box-shadow:0 3px 0 #49321d;}
.summary-card .summary-buttons .btn:hover{filter:brightness(.96);}
@media(max-width:520px){.summary-card{padding:20px 16px;}.summary-card .summary-buttons{grid-template-columns:1fr;}.summary-grid{gap:6px;}.summary-item strong{font-size:20px;}}
@media(max-width:640px){
.hud,.booth,.decision-buttons{ width:94vw; }
.character{ right:1%; bottom:0; width:50%; height:80%; }
.document{ left:-4%; width:62%; }
}
`;
