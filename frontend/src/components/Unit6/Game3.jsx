import { useState, useEffect, useRef } from "react";
import IntroScreen from "./Intro3";
import QuizScreen from "./Quiz3";
import LoadingScreen from "./Loading3";
import ResultScreen from "./Result3";

const questions = [
    { tag: "ข้อ 1 · เพื่อน", text: "เพื่อนสนิทมาสารภาพว่าทำเรื่องผิดพลาดร้ายแรง และขอร้องไม่ให้คุณบอกใคร คุณจะพูดอะไรกับเขา?" },
    { tag: "ข้อ 2 · การตัดสินใจ", text: "คุณต้องตัดสินใจเรื่องสำคัญภายในไม่กี่นาที โดยมีข้อมูลไม่ครบถ้วน คุณจะตัดสินใจอย่างไร และเพราะอะไร?" },
    { tag: "ข้อ 3 · ความผิดพลาด", text: "คุณทำผิดพลาดโดยไม่ตั้งใจจนทีมเสียหาย แต่ไม่มีใครรู้ว่าเป็นความผิดของคุณ คุณจะทำอย่างไรต่อ?" },
    { tag: "ข้อ 4 · หลักการ", text: "มีคนเสนอผลประโยชน์ให้คุณ แลกกับการที่คุณต้องเปลี่ยนหลักการที่ยึดมั่นมาตลอด คุณจะตอบเขาว่าอย่างไร?" },
    { tag: "ข้อ 5 · เงา", text: "ถ้าเงาของคุณพูดได้ และบอกความจริงที่คุณไม่กล้ายอมรับกับตัวเอง มันจะพูดว่าอะไร?" },
    { tag: "ข้อ 6 · กระจก", text: "เมื่อมองภาพสะท้อนของตัวเองในกระจกคืนนี้ คุณอยากบอกอะไรกับตัวเองมากที่สุด?" },
];

const TRAITS = [
    { key: "logic", label: "Logic · ตรรกะ" },
    { key: "empathy", label: "Empathy · ความเห็นใจ" },
    { key: "responsibility", label: "Responsibility · ความรับผิดชอบ" },
    { key: "consistency", label: "Consistency · ความสอดคล้อง" },
];

const LOADING_LINES = [
    "กระจกกำลังสะท้อนใจคุณ...",
    "เงากำลังเรียงร้อยคำตอบของคุณ...",
    "แสงเทียนกำลังส่องผ่านรอยแตกของกระจก...",
    "ใกล้เห็นภาพสะท้อนที่แท้จริงแล้ว...",
];

function badgeFromScore(avg) {
    if (avg >= 90) return { key: "LEGEND", th: "ตำนานแห่งกระจก" };
    if (avg >= 78) return { key: "PLATINUM", th: "ตรารางวัลระดับแพลทินัม" };
    if (avg >= 63) return { key: "GOLD", th: "ตรารางวัลระดับทอง" };
    if (avg >= 48) return { key: "SILVER", th: "ตรารางวัลระดับเงิน" };
    return { key: "BRONZE", th: "ตรารางวัลระดับบรอนซ์" };
}

// Local fallback used only when the backend (localhost:5000) is unreachable,
// e.g. during frontend-only preview/dev. Remove once the real API is live.
function generateMockResult(answers) {
    const seed = answers.join(" ").length || 1;
    const scoreFor = (offset) => {
        const v = (seed * (offset + 3)) % 43;
        return 45 + v; // spread scores roughly 45-87
    };

    return {
        overall_reflection:
            "เงาในกระจกเห็นคำตอบของคุณแล้ว คุณมักตัดสินใจด้วยเหตุผลควบคู่กับความรู้สึกของคนรอบข้าง และพร้อมยอมรับผลจากสิ่งที่ทำเสมอ",
        logic: { score: scoreFor(1), note: "คุณให้เหตุผลประกอบการตัดสินใจอย่างเป็นระบบ" },
        empathy: { score: scoreFor(2), note: "คุณคำนึงถึงความรู้สึกของผู้อื่นในคำตอบส่วนใหญ่" },
        responsibility: { score: scoreFor(3), note: "คุณมักรับผิดชอบต่อผลลัพธ์ของการกระทำตัวเอง" },
        consistency: { score: scoreFor(4), note: "คำตอบของคุณสอดคล้องกับหลักการที่คุณยึดถือ" },
        shadow_message:
            "เงาบอกว่า... สิ่งที่คุณกลัวที่สุดไม่ใช่ความผิดพลาด แต่คือการที่คนอื่นเห็นตัวตนจริงของคุณ",
    };
}

export default function ShadowMirror() {
    const [screen, setScreen] = useState("intro");
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState(Array(questions.length).fill(""));
    const [error, setError] = useState("");
    const [result, setResult] = useState(null);
    const [loadingIdx, setLoadingIdx] = useState(0);
    const textareaRef = useRef(null);
    const BACKEND_URL = "http://localhost:5000";

    useEffect(() => {
        if (screen !== "loading") return;
        const timer = setInterval(() => {
            setLoadingIdx((i) => (i + 1) % LOADING_LINES.length);
        }, 1600);
        return () => clearInterval(timer);
    }, [screen]);

    const startGame = () => {
        setCurrent(0);
        setAnswers(Array(questions.length).fill(""));
        setScreen("quiz");
    };

    const updateAnswer = (val) => {
        setAnswers((prev) => {
            const next = [...prev];
            next[current] = val;
            return next;
        });
    };

    const nextQuestion = () => {
        if (current < questions.length - 1) {
            setCurrent((c) => c + 1);
        } else {
            runAnalysis();
        }
    };

    const runAnalysis = async () => {
        setScreen("loading");
        setError("");

        const payload = {
            answers: questions.map((q, i) => ({ question: q.text, answer: answers[i] })),
        };

        try {
            const response = await fetch(BACKEND_URL + "/api/reflect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error("network");
            const parsed = await response.json();
            if (parsed.error) throw new Error(parsed.error);
            setResult(parsed);
            setScreen("result");
        } catch (err) {
            console.warn("reflect API unavailable, showing local preview data:", err.message);
            setResult(generateMockResult(answers));
            setError("");
            setScreen("result");
        }
    };

    const restart = () => {
        setCurrent(0);
        setAnswers(Array(questions.length).fill(""));
        setError("");
        setScreen("intro");
    };

    const q = questions[current];
    const nextDisabled = !answers[current] || answers[current].trim().length === 0;

    const scores = result
        ? TRAITS.map((t) => Number(result[t.key]?.score) || 0)
        : [];
    const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const badge = result ? badgeFromScore(avg) : null;

    return (
        <div className="sm-root">
            <style>{`
        .sm-root{
          --void:#0a0a12;
          --void-2:#0f0f18;
          --panel-2:#1b1b28;
          --hairline:rgba(185,188,201,0.14);
          --hairline-strong:rgba(185,188,201,0.28);
          --silver:#c7cad6;
          --violet:#6a5f8c;
          --violet-dim:#453d5c;
          --gold:#cda05a;
          --gold-dim:#8a6f47;
          --ink:#e9e7ef;
          --ink-dim:#8f8da1;
          background:var(--void);
          color:var(--ink);
          font-family:'Sarabun',sans-serif;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:48px 20px;
          box-sizing:border-box;
          position:relative;
        }
        .sm-root *{ box-sizing:border-box; }
        .sm-veil{
          position:absolute;
          inset:0;
          background:
            radial-gradient(ellipse 700px 500px at 50% 20%, rgba(106,95,140,0.10), transparent 60%),
            radial-gradient(ellipse 900px 700px at 80% 90%, rgba(205,160,90,0.05), transparent 60%);
          pointer-events:none;
        }
        .sm-stage{ width:100%; max-width:620px; position:relative; z-index:1; }
        .sm-screen{ animation:sm-fadein 0.6s ease; }
        @keyframes sm-fadein{ from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:translateY(0);} }
        .sm-eyebrow{ font-size:12px; letter-spacing:0.22em; text-transform:uppercase; color:var(--violet); text-align:center; margin:0 0 10px; }
        .sm-title{ font-family:'Noto Serif Thai',serif; font-weight:600; font-size:34px; text-align:center; margin:0 0 6px; letter-spacing:0.01em; }
        .sm-sub{ text-align:center; color:var(--ink-dim); font-size:15px; line-height:1.8; margin:0 auto 32px; max-width:440px; }
        .sm-mirror{
          position:relative;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.05), transparent 45%),
            linear-gradient(160deg, var(--panel-2), var(--void-2) 70%);
          border:1px solid var(--hairline-strong);
          border-radius:50% / 18%;
          padding:64px 48px;
          min-height:260px;
          display:flex;
          flex-direction:column;
          justify-content:center;
          overflow:hidden;
          box-shadow:inset 0 0 60px rgba(0,0,0,0.55);
        }
        .sm-crack line{ transition:opacity 0.6s ease; }
        .sm-frame-rules{ display:flex; justify-content:center; gap:8px; margin:22px 0 36px; }
        .sm-shard{ width:26px; height:3px; border-radius:2px; background:var(--hairline-strong); transition:background 0.4s ease, box-shadow 0.4s ease; }
        .sm-shard.done{ background:var(--gold-dim); }
        .sm-shard.now{ background:var(--gold); box-shadow:0 0 8px rgba(205,160,90,0.5); }
        .sm-q-tag{ font-family:'Noto Serif Thai',serif; font-size:12px; letter-spacing:0.18em; text-transform:uppercase; color:var(--gold-dim); text-align:center; margin:0 0 18px; }
        .sm-q-text{ font-family:'Noto Serif Thai',serif; font-weight:500; font-size:22px; line-height:1.65; text-align:center; margin:0 0 30px; padding:0 6px; }
        .sm-textarea{
          width:100%; min-height:110px; background:rgba(0,0,0,0.28);
          border:1px solid var(--hairline); border-radius:10px; color:var(--ink);
          font-family:'Sarabun',sans-serif; font-size:15px; line-height:1.7;
          padding:16px; resize:vertical; outline:none; transition:border-color 0.3s ease;
        }
        .sm-textarea:focus{ border-color:var(--violet); }
        .sm-row{ display:flex; justify-content:space-between; align-items:center; margin-top:24px; }
        .sm-hint{ font-size:12.5px; color:var(--ink-dim); }
        .sm-btn{
          background:transparent; border:1px solid var(--hairline-strong); color:var(--ink);
          font-family:'Sarabun',sans-serif; font-size:14.5px; padding:11px 26px;
          border-radius:999px; cursor:pointer; transition:border-color 0.25s ease, background 0.25s ease, color 0.25s ease;
          letter-spacing:0.02em;
        }
        .sm-btn:hover:not(:disabled){ border-color:var(--gold); color:var(--gold); background:rgba(205,160,90,0.06); }
        .sm-btn:disabled{ opacity:0.35; cursor:not-allowed; }
        .sm-begin-wrap{ text-align:center; margin-top:8px; }
        .sm-rules-list{ max-width:440px; margin:0 auto 34px; padding:0; list-style:none; }
        .sm-rules-list li{ display:flex; gap:12px; align-items:baseline; font-size:14px; color:var(--ink-dim); padding:9px 0; border-bottom:1px solid var(--hairline); }
        .sm-rules-list li:last-child{ border-bottom:none; }
        .sm-rules-list b{ color:var(--violet); font-weight:500; min-width:88px; font-family:'Noto Serif Thai',serif; }
        .sm-loading-wrap{ text-align:center; padding:60px 0; }
        .sm-loading-glyph{ width:64px; height:64px; margin:0 auto 26px; border-radius:50%; border:1px solid var(--hairline-strong); position:relative; animation:sm-pulse 2.4s ease-in-out infinite; }
        .sm-loading-glyph::after{ content:''; position:absolute; inset:10px; border-radius:50%; background:radial-gradient(circle at 35% 30%, rgba(205,160,90,0.35), transparent 60%); }
        @keyframes sm-pulse{ 0%,100%{opacity:0.5; transform:scale(1);} 50%{opacity:1; transform:scale(1.06);} }
        .sm-loading-text{ font-family:'Noto Serif Thai',serif; color:var(--ink-dim); font-size:15px; letter-spacing:0.02em; }
        .sm-result-head{ text-align:center; margin-bottom:8px; }
        .sm-medallion{ width:132px; height:132px; margin:6px auto 20px; border-radius:50%; display:flex; align-items:center; justify-content:center; position:relative; }
        .sm-ring{ position:absolute; inset:0; border-radius:50%; border:1.5px solid var(--gold); box-shadow:0 0 24px rgba(205,160,90,0.28), inset 0 0 20px rgba(205,160,90,0.12); }
        .sm-ring2{ position:absolute; inset:12px; border-radius:50%; border:1px solid var(--hairline-strong); }
        .sm-badge-name{ font-family:'Noto Serif Thai',serif; font-size:16px; font-weight:600; color:var(--gold); text-align:center; letter-spacing:0.03em; }
        .sm-badge-th{ text-align:center; color:var(--ink-dim); font-size:13.5px; margin:0 0 30px; }
        .sm-overall{ font-family:'Noto Serif Thai',serif; font-size:16px; line-height:1.9; text-align:center; max-width:480px; margin:0 auto 34px; }
        .sm-traits{ display:flex; flex-direction:column; gap:16px; margin-bottom:32px; }
        .trait{ border-top:1px solid var(--hairline); padding-top:14px; }
        .trait-top{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px; }
        .trait-name{ font-family:'Noto Serif Thai',serif; font-size:14.5px; color:var(--silver); letter-spacing:0.02em; }
        .trait-score{ font-size:13px; color:var(--gold-dim); }
        .trait-bar{ height:3px; background:rgba(255,255,255,0.06); border-radius:2px; overflow:hidden; margin-bottom:9px; }
        .trait-bar-fill{ height:100%; background:linear-gradient(90deg, var(--violet-dim), var(--gold-dim)); transition:width 1.1s ease; }
        .trait-note{ font-size:13.5px; color:var(--ink-dim); line-height:1.7; margin:0; }
        .sm-shadow-msg{ background:rgba(0,0,0,0.22); border-left:2px solid var(--violet); padding:16px 20px; font-family:'Noto Serif Thai',serif; font-size:14.5px; line-height:1.85; color:var(--silver); margin-bottom:34px; }
        .sm-again-wrap{ text-align:center; }
        .sm-err{ text-align:center; color:#c98d8d; font-size:13.5px; margin-top:16px; }
        .sm-apikey-wrap{ max-width:380px; margin:0 auto 30px; }
        .sm-apikey-label{ font-size:12.5px; color:var(--ink-dim); margin:0 0 8px; text-align:center; }
        .sm-apikey-label a{ color:var(--violet); }
        .sm-apikey-input{
          width:100%; background:rgba(0,0,0,0.28); border:1px solid var(--hairline);
          border-radius:8px; color:var(--ink); font-family:'Sarabun',sans-serif;
          font-size:14px; padding:11px 14px; outline:none; transition:border-color 0.3s ease;
        }
        .sm-apikey-input:focus{ border-color:var(--violet); }
        .sm-apikey-note{ font-size:11.5px; color:var(--ink-dim); text-align:center; margin:8px 0 0; }
        @media (max-width:480px){
          .sm-mirror{ padding:44px 24px; border-radius:24% / 12%; }
          .sm-title{ font-size:27px; }
          .sm-q-text{ font-size:19px; }
        }
      `}</style>

            {screen === "intro" && (
                <IntroScreen startGame={startGame} />
            )}

            {screen === "quiz" && (
                <QuizScreen
                    q={q}
                    current={current}
                    questions={questions}
                    answers={answers}
                    textareaRef={textareaRef}
                    updateAnswer={updateAnswer}
                    nextQuestion={nextQuestion}
                    nextDisabled={nextDisabled}
                />
            )}

            {screen === "loading" && (
                <LoadingScreen
                    loadingIdx={loadingIdx}
                    LOADING_LINES={LOADING_LINES}
                />
            )}

            {screen === "result" && (
                <ResultScreen
                    result={result}
                    badge={badge}
                    error={error}
                    restart={restart}
                />
            )}
        </div>
    );
}