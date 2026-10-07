import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Level2Intro from "./Level2Intro";
import "./Game2.css";
import MissionIcon from "./MissionIcon";
import { useSound } from '../../../hooks/useSound';
import useGameMuted from '../../../hooks/useGameMuted';
import levelMusic from '../../../assets/sounds/Unit6/level2-inspiring-cinematic.mp3';
import {
  NODES,
  NODE_BY_ID,
  EDGES,
  edgeKey,
  EDGE_CURVES,
  NEIGHBORS,
  LAYER,
  MAX_LAYER,
  PREREQS,
  MISSION_ORDER,
  REACH,
  START_ID,
  GOAL_ID,
  MAX_LIVES,
} from "./GameData2";

// ============================================================
// Unit 6 Level 2 : เครือข่ายความดี
// ------------------------------------------------------------
// คำถามอยู่ใน DB (question / choice) — เฉลยอยู่ที่ backend
//   เริ่ม   → POST /api/game-play/start    { level_id } → play_id + questions
//   ตอบ     → POST /api/game-play/answer   { play_id, question_id, choice_id }
//             → is_correct + correct_choice_id + explanation
//   จบ      → POST /api/game-play/complete { play_id }  (ถึงศาล = PASS / หัวใจหมด = FAIL)
// ============================================================

const API_URL = "http://localhost:5000";
const UNIT_ID = 6;
const LEVEL_ORDER = 2;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// หา level_id ของด่านนี้จาก progress (Unit 6 ลำดับ 2)
async function fetchLevelId() {
  const response = await fetch(`${API_URL}/api/user-progress`, { headers: authHeaders() });
  if (response.status === 401) return { unauthorized: true };
  const data = await response.json();
  const unit = (data.data || []).find((u) => Number(u.unit_id) === UNIT_ID);
  const level = [...(unit?.levels || [])]
    .sort((a, b) => Number(a.order_no) - Number(b.order_no))[LEVEL_ORDER - 1];
  return { levelId: level?.level_id ?? null };
}

const VIEW_W = 1536;
const VIEW_H = 1100;
const NODE_R = 58;

export default function GoodNetworkGame() {
  const [muted] = useGameMuted();
  const { play: playMusic, stop: stopMusic } = useSound(levelMusic, {
    volume: 0.25, loop: true, preload: true, retryOnInteract: true,
  });
  useEffect(() => {
    if (!muted) playMusic();
    else stopMusic();
    return stopMusic;
  }, [muted, playMusic, stopMusic]);
  const [showIntro, setShowIntro] = useState(true);
  const [reached, setReached] = useState(() => new Set([START_ID]));
  const [lives, setLives] = useState(MAX_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [outcome, setOutcome] = useState(null); // 'win' | 'lose' | null
  const [activeId, setActiveId] = useState(null);
  // answered = { choiceId, correctChoiceId, isCorrect, explain } หลัง backend ตรวจแล้ว
  const [answered, setAnswered] = useState(null);
  const [answering, setAnswering] = useState(false);
  const [, setMsg] = useState(
    "เลือกเส้นทางที่คุณสนใจ แล้วคลิกที่จุดถัดไปเพื่อเข้าสู่คำถาม"
  );
  const navigate = useNavigate();

  const [playId, setPlayId] = useState(null);
  const [missions, setMissions] = useState({}); // nodeId → { question_id, q, options }
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);   // ผลจาก complete
  const [finishError, setFinishError] = useState("");

  const startingRef = useRef(false);
  const finishingRef = useRef(false);
  const livesRef = useRef(MAX_LIVES);

  // ---- เริ่มรอบใหม่ (play_id ใหม่ทุกครั้ง) ----
  const startPlay = useCallback(async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    setLoading(true);

    try {
      const found = await fetchLevelId();
      if (found.unauthorized) return navigate("/", { replace: true });
      if (!found.levelId) {
        alert("ยังไม่มีด่านนี้ในระบบ");
        return navigate("/map", { replace: true });
      }

      const response = await fetch(`${API_URL}/api/game-play/start`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ level_id: found.levelId }),
      });

      if (response.status === 401) return navigate("/", { replace: true });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "เริ่มเกมไม่ได้");
        return navigate("/map", { replace: true });
      }

      const map = {};
      for (const q of data.data.questions || []) {
        const nodeId = MISSION_ORDER[q.question_order - 1];
        if (!nodeId) continue;
        map[nodeId] = {
          question_id: q.question_id,
          q: q.question_text,
          options: q.choices.map((c) => ({ choice_id: c.choice_id, text: c.choice_text })),
        };
      }

      livesRef.current = MAX_LIVES;
      setPlayId(data.data.play_id);
      setMissions(map);
      setReached(new Set([START_ID]));
      setLives(MAX_LIVES);
      setGameOver(false);
      setOutcome(null);
      setActiveId(null);
      setAnswered(null);
      setResult(null);
      setFinishError("");
      setMsg("เลือกเส้นทางที่คุณสนใจ แล้วคลิกที่จุดถัดไปเพื่อเข้าสู่คำถาม");
    } catch (error) {
      console.error("Start good network error:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
      navigate("/map", { replace: true });
    } finally {
      startingRef.current = false;
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!showIntro) startPlay();
  }, [showIntro, startPlay]);

  const resetGame = useCallback(() => {
    startPlay();
  }, [startPlay]);

  // ---- จบเกม (ถึงศาล / หัวใจหมด) → บันทึกผล ----
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

      if (response.status === 401) return navigate("/", { replace: true });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "บันทึกผลไม่สำเร็จ");

      setResult(data.data ?? null);
    } catch (error) {
      console.error("Complete good network error:", error);
      setFinishError(error.message || "บันทึกผลไม่สำเร็จ");
    } finally {
      finishingRef.current = false;
    }
  }, [playId, navigate]);

  useEffect(() => {
    if (outcome && !result) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const availableIds = useMemo(() => {
    const set = new Set();
    NEIGHBORS.forEach((_, id) => {
      if (reached.has(id)) return;
      const prereqs = PREREQS.get(id) || [];
      if (prereqs.length && prereqs.every((p) => reached.has(p))) {
        set.add(id);
      }
    });
    return set;
  }, [reached]);

  // ลดหัวใจ (คำนวณจาก ref — ไม่ทำ side effect ใน setState เพราะ StrictMode เรียกซ้ำ)
  const loseLife = useCallback(() => {
    const nl = Math.max(0, livesRef.current - 1);
    livesRef.current = nl;
    setLives(nl);
    if (nl <= 0) {
      setGameOver(true);
      setTimeout(() => setOutcome("lose"), 1750);
    }
  }, []);

  const openNode = useCallback(
    (id) => {
      if (gameOver || activeId) return;
      if (!availableIds.has(id)) {
        if (!reached.has(id)) {
          const prereqs = PREREQS.get(id) || [];
          if (prereqs.length > 1) {
            setMsg('ต้องทำให้ครบทุกเส้นทางที่นำไปสู่ "' + NODE_BY_ID[id].label + '" ก่อน ถึงจะเข้าได้');
          } else {
            setMsg('ต้องเชื่อมจากจุดที่จุดไฟแล้วก่อน ถึงจะไปยัง "' + NODE_BY_ID[id].label + '" ได้');
          }
        }
        return;
      }
      setActiveId(id);
      setAnswered(null);
      setMsg('กำลังพิจารณาเส้นทางไปยัง "' + NODE_BY_ID[id].label + '"');
    },
    [gameOver, activeId, availableIds, reached]
  );

  const answerMission = useCallback(
    async (option) => {
      if (!activeId || answered !== null || answering || !playId) return;
      const mission = missions[activeId];
      setAnswering(true);

      let r;
      try {
        const response = await fetch(`${API_URL}/api/game-play/answer`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            play_id: playId,
            question_id: mission.question_id,
            choice_id: option.choice_id,
          }),
        });

        if (response.status === 401) return navigate("/", { replace: true });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "บันทึกคำตอบไม่สำเร็จ");
        r = data.data;
      } catch (error) {
        console.error("Answer good network error:", error);
        setMsg("⚠️ " + (error.message || "บันทึกคำตอบไม่สำเร็จ ลองอีกครั้ง"));
        return;
      } finally {
        setAnswering(false);
      }

      setAnswered({
        choiceId: option.choice_id,
        correctChoiceId: r.correct_choice_id,
        isCorrect: r.is_correct,
        explain: r.explanation,
      });

      if (!r.is_correct) {
        loseLife();
      }

      setTimeout(() => {
        // หัวใจหมดแล้ว → จบแบบ lose (ไม่นับว่าไปถึงจุดนี้)
        if (livesRef.current <= 0) {
          setActiveId(null);
          setAnswered(null);
          return;
        }
        setReached((prev) => {
          const next = new Set(prev);
          next.add(activeId);
          return next;
        });
        if (activeId === GOAL_ID) {
          setGameOver(true);
          setTimeout(() => setOutcome("win"), 500);
        } else {
          setMsg('✅ จุดไฟเชื่อม "' + NODE_BY_ID[activeId].label + '" สำเร็จ! เลือกจุดถัดไปได้เลย');
        }
        setActiveId(null);
        setAnswered(null);
      }, 1700);
    },
    [activeId, answered, answering, playId, missions, loseLife, navigate]
  );

  // ---- derived stats ----
  let maxLayer = 0;
  reached.forEach((id) => {
    const l = LAYER.get(id) || 0;
    if (l > maxLayer) maxLayer = l;
  });
  const progressPct = Math.round((maxLayer / MAX_LAYER) * 100);

  let score = 0;
  reached.forEach((id) => {
    if (REACH[id]) score += REACH[id];
  });

  const activeMission = activeId && missions[activeId] ? { id: activeId, ...missions[activeId] } : null;

  if (showIntro) {
    return (
      <Level2Intro onStart={() => setShowIntro(false)} maxLives={MAX_LIVES} />
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#070b16", color: "#f3ead6", fontSize: 18 }}>
        กำลังเตรียมเครือข่าย...
      </div>
    );
  }

  // ผลที่บันทึกแล้ว (แสดงใน overlay ตอนจบ)
  const resultLine = result
    ? `ได้รับ +${result.earned_ip ?? 0} IP`
    : finishError
      ? finishError
      : "กำลังบันทึกผล...";

  return (
    <div className="gng-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700;800;900&family=Sarabun:wght@400;500;600;700&display=swap');

        .gng-root{
          --ink:#070b16;
          --ink2:#0d1428;
          --panel:#101a34;
          --panel-edge:#22315a;
          --slate:#4a5c86;
          --amber:#f5a93f;
          --amber-soft:#ffd98a;
          --amber-deep:#a8631c;
          --crimson:#e14f63;
          --text:#f3ead6;
          --text-dim:#8b96b8;
          --violet:#8b6bff;
          font-family:'Sarabun',sans-serif;
          background:
            radial-gradient(ellipse 900px 500px at 50% -6%, #1a2748 0%, transparent 60%),
            radial-gradient(ellipse 1200px 700px at 85% 90%, #201127 0%, transparent 55%),
            var(--ink);
          color:var(--text);
          min-height:100vh;
          display:flex;
          flex-direction:column;
          align-items:center;
          padding: 16px 14px 26px;
          box-sizing:border-box;
          user-select:none;
        }
        .gng-root *{ box-sizing:border-box; }
        .gng-wrap{ width:100%; max-width:1040px; }

        .gng-topbar{ display:flex; align-items:center; gap:14px; margin-bottom:18px; }
        .gng-back{
          width:44px; height:44px; border-radius:12px; flex:0 0 auto;
          background:var(--panel); border:1px solid var(--panel-edge); color:var(--text);
          display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px;
        }
        .gng-hud{
          flex:1; display:flex; align-items:stretch; gap:0; flex-wrap:wrap;
          background:linear-gradient(180deg, var(--panel), var(--ink2));
          border:1px solid var(--panel-edge); border-radius:14px;
          box-shadow:0 1px 0 rgba(255,255,255,.05) inset, 0 14px 30px -14px rgba(0,0,0,.7);
          overflow:hidden;
        }
        .gng-hud-item{ flex:1 1 160px; padding:10px 20px; display:flex; flex-direction:column; justify-content:center; gap:5px; min-width:0; }
        .gng-hud-item.grow{ flex:2 1 260px; }
        .gng-hud-divider{ width:1px; background:var(--panel-edge); flex:0 0 1px; align-self:stretch; margin:8px 0; }
        .gng-hud-label{
          font-size:10.5px; letter-spacing:1.3px; color:var(--text-dim);
          text-transform:uppercase; font-family:'Kanit',sans-serif; font-weight:600;
          display:flex; align-items:center; justify-content:space-between; gap:8px;
        }
        .gng-hud-value{ font-family:'Kanit',sans-serif; font-size:19px; font-weight:700; color:var(--amber-soft); }
        .gng-hearts{ display:flex; gap:4px; }
        .gng-heart{ font-size:16px; line-height:1; color:var(--crimson); filter:drop-shadow(0 0 4px rgba(225,79,99,.55)); }
        .gng-heart.lost{ opacity:.22; filter:none; }
        .gng-bar-outer{ width:100%; height:7px; background:#050810; border-radius:6px; overflow:hidden; border:1px solid #1a2440; }
        .gng-bar-inner{
          height:100%; border-radius:6px; transition:width .5s ease;
          background:linear-gradient(90deg,var(--amber-deep),var(--amber),var(--amber-soft));
          box-shadow:0 0 10px rgba(245,169,63,.6);
        }
        .gng-header{ text-align:center; margin:14px 0 4px; }
        .gng-h1{
          font-family:'Kanit',sans-serif; font-weight:800; font-size:clamp(24px,4vw,34px);
          margin:0 0 6px; letter-spacing:.3px;
          background:linear-gradient(90deg, var(--amber-soft), var(--violet));
          -webkit-background-clip:text; background-clip:text; color:transparent;
        }
        .gng-theme{ font-size:13.5px; color:var(--text-dim); margin:0 auto; max-width:640px; line-height:1.6; }

        .gng-stage-wrap{ position:relative; width:100%; margin-top:14px; }
        .gng-stage{
          position:relative; width:100%; border-radius:20px; overflow:hidden;
          border:1px solid var(--panel-edge);
          background:radial-gradient(ellipse 1100px 700px at 50% 0%, #16213f 0%, #0a1024 60%, #070a15 100%);
          box-shadow:0 24px 60px -20px rgba(0,0,0,.75);
        }
        .gng-stage svg{ display:block; width:100%; height:auto; }

        .gng-path-badge{
          position:absolute; top:120px; z-index:5;
          font-family:'Kanit',sans-serif; font-size:12px; font-weight:600; color:var(--text-dim);
          background:rgba(16,26,52,.85); border:1px solid var(--panel-edge); border-radius:10px;
          padding:6px 14px; display:flex; align-items:center; gap:6px; pointer-events:none;
        }
        .gng-path-badge .num{ color:var(--amber-soft); font-weight:800; }
        .gng-path-badge.left{ left:6%; }
        .gng-path-badge.right{ right:6%; }

        .gng-node{ cursor:default; }
        .gng-node.clickable{ cursor:pointer; }
        .gng-node-label{
          font-family:'Kanit',sans-serif; font-size:15px; font-weight:600; fill:var(--text);
          text-anchor:middle;
        }
        .gng-node-label.small{ font-size:13px; }
        .gng-node-q{
          font-size:12.5px; fill:var(--text-dim); text-anchor:middle;
        }
        .gng-node-icon{ font-size:40px; text-anchor:middle; dominant-baseline:central; }

        @keyframes gng-sway{ 0%,100%{transform:rotate(-4deg);} 50%{transform:rotate(4deg);} }
        @keyframes gng-pulse-ring{
          0%{ opacity:.7; transform:scale(1); }
          100%{ opacity:0; transform:scale(1.7); }
        }
        @keyframes gng-avail-pulse{
          0%,100%{ filter: drop-shadow(0 0 6px rgba(245,169,63,.55)); }
          50%{ filter: drop-shadow(0 0 16px rgba(245,169,63,.95)); }
        }
        .gng-avail-anim{ animation: gng-avail-pulse 1.8s ease-in-out infinite; }

        .gng-msg{
          margin-top:12px; text-align:center; font-size:13.5px; color:var(--text-dim);
          min-height:20px;
        }
        .gng-msg.good{ color:#8be08f; }
        .gng-msg.bad{ color:var(--crimson); }

        .gng-legend{
          display:flex; flex-wrap:wrap; gap:12px 20px; justify-content:center;
          margin-top:12px; font-size:12px; color:var(--text-dim);
        }
        .gng-legend span{ display:flex; align-items:center; gap:7px; }
        .gng-dot{ width:11px; height:11px; border-radius:50%; display:inline-block; }
        .gng-dot.neutral{ background:#2a3860; border:1px solid #3a4b74; }
        .gng-dot.progress{ background:var(--amber); box-shadow:0 0 8px rgba(245,169,63,.7); }
        .gng-dot.done{ background:var(--amber-soft); box-shadow:0 0 8px rgba(255,217,138,.9); }
        .gng-q-icon{
          width:14px; height:14px; border-radius:4px; background:var(--violet); color:#fff;
          display:inline-flex; align-items:center; justify-content:center; font-size:10px; font-weight:800;
        }

        .gng-btnrow{ display:flex; justify-content:center; margin-top:18px; }
        .gng-btn{
          font-family:'Kanit',sans-serif; font-weight:600; font-size:13.5px;
          padding:10px 22px; border-radius:10px; border:1px solid var(--panel-edge);
          background:var(--panel); color:var(--text); cursor:pointer;
        }
        .gng-btn.primary{
          background:linear-gradient(90deg,var(--amber-deep),var(--amber));
          border:none; color:#241305;
        }

        .gng-overlay{
          position:absolute; inset:0; display:flex; align-items:center; justify-content:center;
          background:rgba(5,8,16,.72); backdrop-filter:blur(3px);
          opacity:0; pointer-events:none; transition:opacity .25s ease; z-index:20; padding:20px;
        }
        .gng-overlay.show{ opacity:1; pointer-events:auto; }
        .gng-overlay-card{
          max-width:520px; width:100%; background:linear-gradient(180deg,var(--panel),var(--ink2));
          border:1px solid var(--panel-edge); border-radius:16px; padding:26px 26px 22px;
          box-shadow:0 30px 70px -20px rgba(0,0,0,.8); text-align:center;
        }
        .gng-overlay-card h2{ font-family:'Kanit',sans-serif; margin:0 0 12px; font-size:22px; color:var(--amber-soft); }
        .gng-overlay-card h3{ font-family:'Kanit',sans-serif; margin:0 0 12px; font-size:17px; color:var(--violet); }
        .gng-overlay-card p{ font-size:13.5px; line-height:1.7; color:var(--text-dim); margin:0 0 18px; }

        .gng-mission-options{ display:flex; flex-direction:column; gap:9px; text-align:left; }
        .gng-mission-opt{
          font-family:'Sarabun',sans-serif; font-size:13.5px; text-align:left;
          padding:11px 14px; border-radius:10px; border:1px solid var(--panel-edge);
          background:#0c1530; color:var(--text); cursor:pointer; line-height:1.5;
        }
        .gng-mission-opt:hover:not(:disabled){ border-color:var(--amber-deep); }
        .gng-mission-opt.correct{ border-color:#4caf6a; background:rgba(76,175,106,.15); }
        .gng-mission-opt.wrong{ border-color:var(--crimson); background:rgba(225,79,99,.15); }
        .gng-mission-opt:disabled{ cursor:default; }
        .gng-mission-explain{ margin-top:14px; font-size:12.5px; color:var(--text-dim); line-height:1.6; text-align:left; }
      `}</style>

      <div className="gng-wrap">
        <div className="gng-topbar">
          <div className="gng-hud">
            <div className="gng-hud-item">
              <div className="gng-hud-label">ชีวิตคงเหลือ</div>
              <div className="gng-hearts">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <span key={i} className={"gng-heart" + (i >= lives ? " lost" : "")}>
                    ❤
                  </span>
                ))}
              </div>
            </div>
            <div className="gng-hud-divider" />
            <div className="gng-hud-item grow">
              <div className="gng-hud-label">
                <span>ความคืบหน้าสูงสุด</span>
                <span>{progressPct}%</span>
              </div>
              <div className="gng-bar-outer">
                <div className="gng-bar-inner" style={{ width: progressPct + "%" }} />
              </div>
            </div>
            <div className="gng-hud-divider" />
            <div className="gng-hud-item">
              <div className="gng-hud-label">คะแนนรวม</div>
              <div className="gng-hud-value">{score.toLocaleString("th-TH")} คน</div>
            </div>
          </div>
        </div>


        <div className="gng-stage-wrap">
          <div className="gng-stage">
            <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="gngGlowGold" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="6" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="gngGlowViolet" x="-80%" y="-80%" width="260%" height="260%">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <radialGradient id="nodeDone" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#ffe9b8" />
                  <stop offset="55%" stopColor="#f5a93f" />
                  <stop offset="100%" stopColor="#a8631c" />
                </radialGradient>
                <radialGradient id="nodeAvail" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#7b73c8" />
                  <stop offset="100%" stopColor="#344d85" />
                </radialGradient>
                <radialGradient id="nodeLocked" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#577ca3" />
                  <stop offset="100%" stopColor="#2b456c" />
                </radialGradient>
                <radialGradient id="goalGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffe9a8" stopOpacity="0.55" />
                  <stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* stars */}
              <g fill="#ffffff">
                {[
                  [80, 40, 1.2, 0.4], [220, 90, 1, 0.3], [400, 30, 1.4, 0.5],
                  [640, 70, 1, 0.3], [880, 40, 1.3, 0.45], [1100, 90, 1, 0.3],
                  [1300, 35, 1.2, 0.4], [1450, 100, 1, 0.28], [40, 200, 1, 0.22],
                ].map(([cx, cy, r, o], i) => (
                  <circle key={i} cx={cx} cy={cy} r={r} opacity={o} />
                ))}
              </g>

              <circle cx="768" cy="550" r="400" fill="none" stroke="#bdc4ed" strokeWidth="2" strokeDasharray="4 12" opacity="0.3" />
              {/* soft glow behind the court, the final destination */}
              <circle cx={NODE_BY_ID.court.x} cy={NODE_BY_ID.court.y} r="150" fill="url(#goalGlow)" />

              {/* Footsteps between mission pins. */}
              <g>
                {EDGES.map(([a, b]) => {
                  const key = edgeKey(a, b);
                  const curve = EDGE_CURVES.get(key);
                  const done = reached.has(a) && reached.has(b);
                  const isNext = availableIds.has(b) && reached.has(a);
                  const start = NODE_BY_ID[a];
                  const end = NODE_BY_ID[b];
                  const length = Math.hypot(end.x - start.x, end.y - start.y);
                  const count = Math.max(1, Math.floor((length - 140) / 35));
                  return (
                    <g key={key} fill={done ? "#ffe2a0" : isNext ? "#ffd17c" : "#b2c6da"} opacity={done || isNext ? 0.95 : 0.3}>
                      {Array.from({ length: count }, (_, index) => {
                        const t = (index + 1) / (count + 1);
                        const x = (1 - t) ** 2 * start.x + 2 * (1 - t) * t * curve.mid.x + t * t * end.x;
                        const y = (1 - t) ** 2 * start.y + 2 * (1 - t) * t * curve.mid.y + t * t * end.y;
                        if (Math.hypot(x - start.x, y - start.y) < 85 || Math.hypot(x - end.x, y - end.y) < 85) return null;
                        const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI + 90;
                        return <g key={index} transform={`translate(${x} ${y}) rotate(${angle}) translate(${index % 2 ? 7 : -7} 0)`}><ellipse cy="-4" rx="4" ry="7" /><circle cy="6" r="3" /></g>;
                      })}
                    </g>
                  );
                })}
              </g>

              {/* nodes */}
              <g>
                {NODES.map((n) => {
                  const isDone = reached.has(n.id);
                  const isAvail = !isDone && availableIds.has(n.id);
                  const isLocked = !isDone && !isAvail;
                  const isGoal = n.id === GOAL_ID;

                  let bodyFill = "#f4f1ff";
                  let stroke = "#c6bce6";
                  let strokeWidth = 2;
                  let glow;
                  if (isDone) {
                    bodyFill = "#d8f1e6";
                    stroke = "#70bea0";
                    strokeWidth = 3;
                    glow = undefined;
                  } else if (isAvail) {
                    bodyFill = "#8061bc";
                    stroke = isGoal ? "#c9a8ff" : "#f5a93f";
                    strokeWidth = 3;
                    glow = isGoal ? "url(#gngGlowViolet)" : "url(#gngGlowGold)";
                  }



                  return (
                    <g
                      key={n.id}
                      className={"gng-node mission-tile" + (isAvail ? " clickable" : "") + (isDone ? " completed" : "") + (isGoal ? " goal-tile" : "")}
                      opacity={isLocked ? 0.95 : 1}
                      onClick={() => openNode(n.id)}
                      role={isAvail ? "button" : undefined}
                      tabIndex={isAvail ? 0 : undefined}
                      aria-label={`${n.label}${isAvail ? " ช่วยเหลือ" : isDone ? " สำเร็จ" : " ยังไม่เปิด"}`}
                      onKeyDown={(e) => { if (isAvail && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openNode(n.id); } }}
                    >
                      <g className={isAvail ? "gng-avail-anim" : undefined}>
                        <rect x={n.x - 108} y={n.y - 59} width="216" height="128" rx="24" fill="#0b1939" opacity="0.2" transform="translate(0 7)" />
                        <rect
                          x={n.x - 108} y={n.y - 59} width="216" height="128" rx="24"
                          fill={bodyFill}
                          stroke={stroke}
                          strokeWidth={strokeWidth}
                          filter={glow}
                        />
                        <circle cx={n.x} cy={n.y - 12} r="32" fill={isAvail ? "#ffffff15" : "#acc1dd30"} />
                      </g>
                      <MissionIcon id={n.id} x={n.x - 24} y={n.y - 36} width={48} height={48} className="gng-mission-icon" />

                      {isDone && (
                        <circle cx={n.x + NODE_R * 0.68} cy={n.y - NODE_R * 0.68} r="13" fill="#2fae5c" stroke="#0d1428" strokeWidth="2" />
                      )}
                      {isDone && (
                        <text x={n.x + NODE_R * 0.68} y={n.y - NODE_R * 0.68 + 4} textAnchor="middle" fontSize="16" fill="#fff">
                          ⚑
                        </text>
                      )}

                      <text
                        x={n.x}
                        y={n.y + 48}
                        className={"gng-node-label" + (n.label.length > 8 ? " small" : "")}
                      >
                        {n.label}
                      </text>

                      {isAvail && (
                        <g className="gng-help-badge"><rect x={n.x - 64} y={n.y - 96} width="128" height="32" rx="16" fill="#ffe1a0" /><text x={n.x} y={n.y - 74} textAnchor="middle" fill="#49321c" fontSize="20" fontWeight="700">ช่วยเหลือ</text></g>
                      )}
                      {isGoal && !isAvail && !isDone && <text x={n.x} y={n.y - 74} textAnchor="middle" fill="#ffe2a0" fontSize="24" fontWeight="700">★ เป้าหมายสุดท้าย</text>}

                    </g>
                  );
                })}
              </g>
            </svg>

            <div className={"gng-overlay win" + (outcome === "win" ? " show" : "")}>
              <div className="gng-overlay-card">
                <h2>⚖️ เครือข่ายความดีไปถึงศาลสำเร็จ!</h2>
                <p>
                  คุณพาเรื่องราวเดินทางจากนักเรียนคนหนึ่ง ผ่านผู้ปกครองหรือครู ชุมชนหรือโรงเรียน สื่อและหน่วยงานรัฐ
                  จนถึงกระบวนการยุติธรรมได้สำเร็จ "คนเดียวเปลี่ยนโลกไม่ได้ แต่หลายคนทำได้"
                </p>
                <p style={{ color: "var(--amber-soft)", fontWeight: 700, fontSize: 16 }}>{resultLine}</p>
                {finishError && (
                  <button className="gng-btn" onClick={finish} style={{ marginBottom: 10 }}>
                    ลองบันทึกผลอีกครั้ง
                  </button>
                )}
                <button className="gng-btn primary" onClick={resetGame}>
                  เล่นใหม่
                </button>
                <button
                  className="gng-btn"
                  onClick={() => navigate("/unit6/game3")}
                  style={{ marginLeft: 10 }}
                >
                  ด่านถัดไป
                </button>
                <button className="gng-btn" onClick={() => navigate('/map')} style={{ marginLeft: 10 }}>กลับหน้าหลัก</button>
              </div>
            </div>

            <div className={"gng-overlay lose" + (outcome === "lose" ? " show" : "")}>
              <div className="gng-overlay-card">
                <h2>🕯️ เครือข่ายสะดุดกลางทาง</h2>
                <p>ชีวิตเครือข่ายหมดลงเพราะตอบคำถามผิดหลายครั้งเกินไป ลองพิจารณาแต่ละสถานการณ์ให้รอบคอบขึ้นอีกนิด</p>
                <p style={{ color: "var(--amber-soft)", fontWeight: 700, fontSize: 16 }}>{resultLine}</p>
                {finishError && (
                  <button className="gng-btn" onClick={finish} style={{ marginBottom: 10 }}>
                    ลองบันทึกผลอีกครั้ง
                  </button>
                )}
                <button className="gng-btn primary" onClick={resetGame}>
                  เล่นใหม่
                </button>
                <button className="gng-btn" onClick={() => navigate('/map')} style={{ marginLeft: 10 }}>กลับหน้าหลัก</button>
              </div>
            </div>

            <div className={"gng-overlay mission" + (activeMission ? " show" : "")}>
              <div className="gng-overlay-card gng-question-card" role="dialog" aria-modal="true" aria-labelledby="gng-question-title">
                <div className="gng-question-heading">
                  <span className="gng-question-emblem" aria-hidden="true">{activeMission && <MissionIcon id={activeMission.id} size={30} />}</span>
                  <div><span className="gng-question-eyebrow">ภารกิจส่งต่อความดี</span><h3 id="gng-question-title">{activeMission ? NODE_BY_ID[activeMission.id].label : ""}</h3></div>
                  <span className="gng-question-chip">เลือก 1 คำตอบ</span>
                </div>
                {activeMission && (
                  <>
                    <p className="gng-question-text">{activeMission.q}</p>
                    <div className="gng-mission-options">
                      {activeMission.options.map((opt, index) => {
                        let cls = "gng-mission-opt";
                        if (answered !== null) {
                          if (opt.choice_id === answered.correctChoiceId) cls += " correct";
                          else if (opt.choice_id === answered.choiceId) cls += " wrong";
                        }
                        return (
                          <button
                            key={opt.choice_id}
                            className={cls}
                            disabled={answered !== null || answering}
                            onClick={() => answerMission(opt)}
                          >
                            <span className="gng-answer-number">{index + 1}</span>
                            <span className="gng-answer-text">{opt.text}</span>
                            <span className="gng-answer-arrow" aria-hidden="true">{answered !== null && opt.choice_id === answered.correctChoiceId ? "✓" : answered !== null && opt.choice_id === answered.choiceId ? "×" : "›"}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>


        <div className="gng-legend">
          <span>
            <span className="gng-dot neutral"></span> จุดที่ยังไม่ได้เลือก
          </span>
          <span>
            <span className="gng-dot progress"></span> จุดที่กำลังดำเนินการ
          </span>
          <span>
            <span className="gng-dot done"></span> จุดที่เสร็จแล้ว
          </span>
          <span>
            <span className="gng-q-icon">Q</span> คำถามประจำด่าน
          </span>
        </div>

        <div className="gng-btnrow">
          <button className="gng-btn" onClick={resetGame}>
            เริ่มใหม่
          </button>
        </div>
      </div>
    </div>
  );
}