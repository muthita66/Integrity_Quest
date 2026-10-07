import { BASE_URL } from "../../../config";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaShieldAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import BookLayout from "../BookLayout";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";
import { useSound } from "../../../hooks/useSound";
import blockSuccessSound from "../../../assets/sounds/Unit4/unit4-level3-block-success.mp3";
import errorAlertSound from "../../../assets/sounds/Unit4/unit4-level3-error-alert.mp3";
import cyberMusic from "../../../assets/sounds/Unit4/unit4-level3-cyber-alarm.mp3";
import useUnit4Chapter, { Unit4Checking } from "../useUnit4Chapter";
import normalScreen from "../../../assets/unit4/normal.png";
import safeScreen from "../../../assets/unit4/Potect.png";
import warningScreen from "../../../assets/unit4/warning.png";
import virusImg from "../../../assets/unit4/virus.png";
import "../../../styles/theme.css";
import "./level3.css";

const API_URL = `${BASE_URL}`;
const DEFAULT_HEARTS = 4;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export default function Game() {
    const [muted] = useGameMuted();
    const { play: playBlockSuccess, stop: stopBlockSuccess } = useSound(blockSuccessSound, { volume: 0.5, preload: true });
    const { play: playErrorAlert, stop: stopErrorAlert } = useSound(errorAlertSound, { volume: 0.5, preload: true });
    useEffect(() => stopErrorAlert, [stopErrorAlert]);
    useEffect(() => { if (muted) stopErrorAlert(); }, [muted, stopErrorAlert]);
    useEffect(() => stopBlockSuccess, [stopBlockSuccess]);
    useEffect(() => { if (muted) stopBlockSuccess(); }, [muted, stopBlockSuccess]);
    useBackgroundMusic(cyberMusic, { volume: 0.35, muted });
    const navigate = useNavigate();

    // กันเข้าทาง URL ตรง ๆ ตอนบทนี้ยังไม่ปลดล็อก + ได้ level_id จาก DB
    const { checking, level } = useUnit4Chapter(2);

    const timerRef = useRef();
    const startingRef = useRef(false); // กัน StrictMode เริ่มเกมซ้ำ

    const [playId, setPlayId] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [maxHearts, setMaxHearts] = useState(DEFAULT_HEARTS);
    const [current, setCurrent] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [hearts, setHearts] = useState(DEFAULT_HEARTS);
    const [screenState, setScreenState] = useState("normal");
    const [virusAttack, setVirusAttack] = useState(false);
    const [busy, setBusy] = useState(false); // กำลังส่งคำตอบ / จบเกม
    const [error, setError] = useState("");
    const [finishFailed, setFinishFailed] = useState(false);

    useEffect(() => () => clearTimeout(timerRef.current), []);

    const handleAuthError = (response) => {
        if (response.status === 401) {
            navigate("/", { replace: true });
            return true;
        }
        return false;
    };

    // --------------------------------------------------------
    // เริ่มรอบใหม่
    // --------------------------------------------------------
    const startPlay = useCallback(async () => {
        if (!level || startingRef.current) return;
        startingRef.current = true;

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

            const list = data.data.questions || [];

            if (list.length === 0) {
                alert("บทนี้ยังไม่มีคำถาม");
                navigate("/unit4/book", { replace: true });
                return;
            }

            setPlayId(data.data.play_id);
            setQuestions(list);
            setMaxHearts(data.data.hearts ?? DEFAULT_HEARTS);
            setHearts(data.data.hearts ?? DEFAULT_HEARTS);
        } catch (err) {
            console.error("Start firewall game error:", err);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
            navigate("/unit4/book", { replace: true });
        } finally {
            startingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [level, navigate]);

    useEffect(() => {
        if (level) startPlay();
    }, [level, startPlay]);

    // --------------------------------------------------------
    // จบเกม → บันทึกผล แล้วไปหน้า Result
    // --------------------------------------------------------
    const finish = async () => {
        setBusy(true);
        setError("");
        setFinishFailed(false);

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

            navigate(`/unit4/level3/result?playId=${playId}`);
        } catch (err) {
            console.error("Complete firewall game error:", err);
            setError(err.message || "บันทึกผลไม่สำเร็จ");
            setFinishFailed(true);
            setBusy(false);
        }
    };

    const next = () => {
        if (current === questions.length - 1) {
            finish();
            return;
        }
        setCurrent((value) => value + 1);
        setScreenState("normal");
        setVirusAttack(false);
        setBusy(false);
    };

    // --------------------------------------------------------
    // ตอบ 1 ข้อ — backend เป็นคนตรวจว่าถูกไหม
    // --------------------------------------------------------
    const answer = async (choice) => {
        if (busy || screenState !== "normal" || !playId) return;

        const question = questions[current];
        setBusy(true);
        setError("");
        clearTimeout(timerRef.current);

        try {
            const response = await fetch(`${API_URL}/api/game-play/answer`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    play_id: playId,
                    question_id: question.question_id,
                    choice_id: choice.choice_id,
                }),
            });

            if (handleAuthError(response)) return;

            const data = await response.json();

            // ตอบข้อนี้ไปแล้ว (เช่น กดซ้ำ) → ข้ามไปข้อถัดไป
            if (response.status === 409) {
                next();
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "บันทึกคำตอบไม่สำเร็จ");
            }

            if (data.data.is_correct) {
                if (!muted) playBlockSuccess();
                setCorrect((value) => value + 1);
                setScreenState("safe");
                timerRef.current = setTimeout(next, 650);
                return;
            }

            const remaining = hearts - 1;
            if (!muted) playErrorAlert();
            setVirusAttack(true);
            setScreenState("warning");
            setHearts(remaining);
            timerRef.current = setTimeout(() => {
                if (remaining <= 0) finish();
                else next();
            }, 850);
        } catch (err) {
            console.error("Answer firewall error:", err);
            setError(err.message || "บันทึกคำตอบไม่สำเร็จ ลองอีกครั้ง");
            setBusy(false);
        }
    };

    if (checking || questions.length === 0) return <Unit4Checking />;

    const question = questions[current];
    const heartPercent = Math.round((hearts / maxHearts) * 100);
    const screen = screenState === "safe" ? safeScreen : screenState === "warning" ? warningScreen : normalScreen;

    return (
        <BookLayout
            title="บทที่ 3 — ภารกิจสุดท้าย"
            subtitle="Firewall Defender"
            rightLabel="คำถามป้องกันระบบ"
            rightNote={`${current + 1} / ${questions.length}`}
            onBack={() => navigate("/unit4/book")}
            leftPage={
                <div className="level3-phone-page">
                    <div className="level3-phone">
                        <div className="level3-phone-speaker" />
                        <div className="level3-phone-screen">
                            <div className="level3-phone-status"><span>09:41</span><span>●●● ◒</span></div>
                            <div className="level3-phone-appbar"><FaShieldAlt /> <span>FIREWALL DEFENDER</span></div>
                            <motion.img
                                key={screenState}
                                src={screen}
                                alt="สถานะระบบป้องกัน"
                                className="level3-phone-image"
                                animate={screenState === "warning" ? { x: [-4, 4, -4, 0] } : { scale: [1, 1.02, 1] }}
                                transition={{ duration: .45 }}
                            />
                            <div className={`level3-phone-status-card is-${screenState}`}>
                                <strong>{screenState === "warning" ? "THREAT DETECTED" : screenState === "safe" ? "THREAT BLOCKED" : "SYSTEM SECURE"}</strong>
                                <span>Firewall integrity {heartPercent}%</span>
                            </div>
                            {virusAttack && <motion.img className="level3-virus" src={virusImg} alt="ไวรัสกำลังโจมตี" initial={{ x: 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} />}
                        </div>
                        <div className="level3-phone-home" />
                    </div>
                    <div className="level3-phone-caption">DEVICE 03 / LIVE DEFENSE</div>
                </div>
            }
            rightPage={
                <div className="level3-question-page">
                    <div className="level3-progress-row"><span>กำลังป้องกันฐานข้อมูล</span><strong>{correct} ถูก</strong></div>
                    <div className="level3-progress"><span style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
                    <div className="level3-question-card">
                        <span className="level3-question-label">THREAT SCAN {String(current + 1).padStart(2, "0")}</span>
                        <h2>{question.question_text}</h2>
                        <div className="level3-answers">
                            {question.choices.map((choice, index) => (
                                <button
                                    type="button"
                                    key={choice.choice_id}
                                    onClick={() => answer(choice)}
                                    disabled={busy || screenState !== "normal"}
                                >
                                    <b>{choice.choice_key || String.fromCharCode(65 + index)}</b><span>{choice.choice_text}</span>
                                </button>
                            ))}
                        </div>
                        {error && (
                            <p style={{ marginTop: 12, color: "#B91C1C", fontSize: 14 }}>
                                {error}
                            </p>
                        )}
                        {finishFailed && (
                            <button type="button" className="primary-btn" style={{ marginTop: 10 }} onClick={finish}>
                                ลองบันทึกผลอีกครั้ง
                            </button>
                        )}
                    </div>
                </div>
            }
        />
    );
}
