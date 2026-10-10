import { BASE_URL } from "../../../config";
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
import "./Game.css";

const API_URL = `${BASE_URL}`;
const LEVEL_ID = 16;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const RANK_INFO = {
    S: { rankText: "ยอดเยี่ยม", flavor: "ประชาชนเชื่อมั่นในหน่วยงานของคุณ คุณปกป้องภาษีของประชาชนได้สำเร็จ" },
    A: { rankText: "ดีมาก", flavor: "คุณตรวจสอบได้อย่างละเอียดรอบคอบ" },
    B: { rankText: "ดี", flavor: "ยังมีบางจุดที่พลาดไปบ้าง แต่โดยรวมทำได้ดี" },
    C: { rankText: "ควรทบทวน", flavor: "ยังพลาดหลายจุด ลองทบทวนจุดสังเกตแล้วเล่นใหม่" },
};

const GAME_SECONDS = 120;

const formatBaht = (n) => {
    const v = Number(n) || 0;
    return v >= 1e6
        ? `${(v / 1e6).toLocaleString("th-TH", { maximumFractionDigits: 2 })} ล้านบาท`
        : `${v.toLocaleString("th-TH")} บาท`;
};

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
    const rank = result?.rank ?? "C";
    const { rankText, flavor } = RANK_INFO[rank] || RANK_INFO.C;
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
                <div className="inspector-stage" style={{ backgroundImage: `linear-gradient(rgba(24, 12, 6, .62), rgba(24, 12, 6, .78)), url(${gameBg})` }}>
                    <p style={{ color: "#f0d896", fontSize: 18 }}>กำลังเตรียมเอกสารโครงการ...</p>
                </div>
            </>
        );
    }

    return (
        <>
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

                        {!missionFailed && Array.isArray(result?.review_projects) && result.review_projects.length > 0 && (
                            <div style={{ textAlign: "left", margin: "10px 0" }}>
                                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8, fontWeight: 800 }}>
                                    <span style={{ color: "#7ddc8f" }}>
                                        <FaShieldAlt /> เงินที่ปกป้องได้ {formatBaht(result.protected_baht)}
                                    </span>
                                    {result.lost_baht > 0 && (
                                        <span style={{ color: "#ff8a80" }}>
                                            เงินที่เสียหาย {formatBaht(result.lost_baht)}
                                        </span>
                                    )}
                                </div>

                                <div style={{ maxHeight: 190, overflowY: "auto", paddingRight: 4 }}>
                                    {result.review_projects.map((p) => (
                                        <div
                                            key={p.project_id}
                                            style={{
                                                padding: "6px 8px",
                                                marginBottom: 6,
                                                borderRadius: 8,
                                                background: "rgba(255,255,255,.07)",
                                                borderLeft: `4px solid ${p.is_correct ? "#7ddc8f" : "#ff8a80"}`,
                                                fontSize: 14,
                                                lineHeight: 1.4,
                                            }}
                                        >
                                            <strong>{p.name}</strong>
                                            <div style={{ opacity: 0.85 }}>
                                                คุณ{p.took_bribe ? "รับสินบนและอนุมัติ" : p.action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}
                                                {" · "}
                                                {p.is_correct ? "ถูกต้อง" : "ไม่ถูกต้อง"}
                                                {p.is_fraud ? " · โครงการมีพิรุธ" : " · โครงการปกติ"}
                                            </div>
                                            {p.explanation && (
                                                <div style={{ opacity: 0.8 }}>
                                                    {p.is_fraud ? "พิรุธที่ควรจับ: " : "ข้อสังเกต: "}
                                                    {p.explanation}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                        <strong>บทถัดไป</strong>
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