import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./style/Game1.css";
import { selectNextEvent } from "./eventSelection";
import { isUnit6Paused } from '../Unit6Navigation';
import { useSound } from '../../../hooks/useSound';
import useGameMuted from '../../../hooks/useGameMuted';
import levelMusic from '../../../assets/sounds/Unit6/level1-best-friends.mp3';
import {
    FaClipboardList,
    FaUtensils,
    FaBookOpen,
    FaBuilding,
    FaRestroom,
    FaDesktop,
    FaComments,
    FaChalkboardTeacher,
    FaEyeSlash,
    FaHandshake,
    FaBullhorn,
    FaHandPaper,
    FaTimesCircle,
    FaWalking,
    FaHeart,
    FaClock,
    FaStar,
    FaUserFriends,
    FaRedoAlt,
    FaPlay,
    FaThumbtack,
    FaMapMarkedAlt,
    FaGraduationCap,
    FaTrophy,
    FaExclamationTriangle,
} from "react-icons/fa";

const LOCATIONS = [
    { id: "examRoom", name: "ห้องสอบ", icon: FaClipboardList },
    { id: "canteen", name: "โรงอาหาร", icon: FaUtensils },
    { id: "library", name: "ห้องสมุด", icon: FaBookOpen },
    { id: "registrar", name: "ห้องทะเบียน", icon: FaBuilding },
    { id: "restroom", name: "ห้องน้ำ", icon: FaRestroom },
    { id: "computerRoom", name: "ห้องคอม", icon: FaDesktop },
];

const API_URL = "http://localhost:5000";
const UNIT_ID = 6;
const LEVEL_ORDER = 1;

const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// icon_key ใน DB → ไอคอนจริง
const CHOICE_ICONS = {
    FaComments,
    FaChalkboardTeacher,
    FaHandshake,
    FaEyeSlash,
    FaBullhorn,
    FaHandPaper,
    FaWalking,
    FaTimesCircle,
};

const RANK_INFO = {
    S: { rankText: "ยอดเยี่ยม", flavor: "คุณคือ Integrity Ambassador ตัวจริง นักเรียนทุกคนปลอดภัย" },
    A: { rankText: "ดีมาก", flavor: "คุณจัดการวิกฤตได้อย่างมีสติและทันเวลา" },
    B: { rankText: "ดี", flavor: "ยังพลาดไปบ้าง แต่ช่วยเหลือได้หลายเหตุการณ์" },
    C: { rankText: "พอใช้", flavor: "ควรตัดสินใจให้เร็วและเหมาะสมกว่านี้" },
    D: { rankText: "ควรปรับปรุง", flavor: "มีหลายเหตุการณ์ที่หลุดมือไป ลองใหม่อีกครั้ง" },
};

// หา level_id ของด่านนี้จาก progress (Unit 6 ลำดับ 1)
async function fetchLevelId() {
    const response = await fetch(`${API_URL}/api/user-progress`, { headers: authHeaders() });
    if (response.status === 401) return { unauthorized: true };
    const data = await response.json();
    const unit = (data.data || []).find((u) => Number(u.unit_id) === UNIT_ID);
    const level = [...(unit?.levels || [])]
        .sort((a, b) => Number(a.order_no) - Number(b.order_no))[LEVEL_ORDER - 1];
    return { levelId: level?.level_id ?? null };
}

// เหตุการณ์พิเศษ — ข้อความอยู่ที่หน้าเว็บ ผลต่อคะแนนคิดที่ backend
const SPECIAL_EVENTS = [
    { id: "fakeNews", type: "integrityFlat", title: "📢 ข่าวปลอมระบาด", description: "\"โกงนิดเดียวไม่เป็นไร\" ทำให้ Integrity ลดลง" },
    { id: "teacherHelp", type: "autoResolve", title: "👨‍🏫 ครูเวรมาช่วย", description: "ครูช่วยจัดการเหตุการณ์ให้ 1 จุดฟรี" },
    { id: "virtueDay", type: "integrityFlat", title: "🎉 วันคุณธรรม", description: "ทุกคนร่วมมือกันทำความดี Integrity เพิ่มขึ้น" },
];

const GAME_SECONDS = 30;
const SPECIAL_EVENT_INTERVAL = 12;
const SPECIAL_EVENT_CHANCE = 0.7;

function getTargetConcurrency(elapsedSeconds) {
    if (elapsedSeconds < 10) return 1;
    if (elapsedSeconds < 20) return 2;
    return 3;
}

export default function CrisisResponse({ nextRoute = "/unit6/game2" }) {
    const navigate = useNavigate();
    const [muted] = useGameMuted();
    const { play: playMusic, stop: stopMusic } = useSound(levelMusic, {
        volume: 0.25, loop: true, preload: true, retryOnInteract: true,
    });
    useEffect(() => {
        if (!muted) playMusic();
        else stopMusic();
        return stopMusic;
    }, [muted, playMusic, stopMusic]);

    const [phase, setPhase] = useState("intro"); // intro | playing | summary
    const [elapsed, setElapsed] = useState(0);
    const [integrity, setIntegrity] = useState(100);
    const [score, setScore] = useState(0);
    const [helpedCount, setHelpedCount] = useState(0);
    const [missedCount, setMissedCount] = useState(0);
    const [activeEvents, setActiveEvents] = useState([]); // { uid, locationId, event, remaining }
    const [selectedUid, setSelectedUid] = useState(null);
    const [toast, setToast] = useState(null); // { type, message }

    const toastTimerRef = useRef(null);
    const timeLeft = GAME_SECONDS - elapsed;

    const [playId, setPlayId] = useState(null);
    const [eventPool, setEventPool] = useState({}); // location_code → [event]
    const [starting, setStarting] = useState(false);
    const [result, setResult] = useState(null);      // ผลจาก complete
    const [finishError, setFinishError] = useState("");

    const playIdRef = useRef(null);
    const spawnNoRef = useRef(0);
    const seenEventsRef = useRef(new Set());
    const lastEventIdRef = useRef(null);
    const pendingRef = useRef(new Set()); // request ที่ยังไม่ตอบกลับ
    const seqRef = useRef(0);             // กันผลเก่าทับผลใหม่
    const appliedSeqRef = useRef(0);

    const showToast = useCallback((type, message) => {
        clearTimeout(toastTimerRef.current);
        setToast({ type, message });
        toastTimerRef.current = setTimeout(() => setToast(null), 1800);
    }, []);

    // ยอดรวมมาจาก backend เสมอ (ใช้ผลของ request ล่าสุดเท่านั้น)
    const applyTotals = useCallback((seq, data) => {
        if (seq < appliedSeqRef.current) return;
        appliedSeqRef.current = seq;
        setIntegrity(data.integrity);
        setScore(data.score);
        setHelpedCount(data.helped);
        setMissedCount(data.missed);
    }, []);

    // ยิง API ระหว่างเล่น + จำไว้ว่ายังรออยู่ (ตอนจบเกมจะรอให้ครบก่อน)
    const postGame = useCallback(
        (path, body) => {
            const seq = ++seqRef.current;

            const request = fetch(`${API_URL}/api/crisis-game/${path}`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ playId: playIdRef.current, ...body }),
            })
                .then(async (response) => {
                    if (response.status === 401) {
                        navigate("/", { replace: true });
                        return null;
                    }
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.message || "บันทึกไม่สำเร็จ");
                    applyTotals(seq, data.data);
                    return data.data;
                })
                .catch((error) => {
                    console.error(`crisis ${path} error:`, error);
                    return null;
                })
                .finally(() => pendingRef.current.delete(request));

            pendingRef.current.add(request);
            return request;
        },
        [applyTotals, navigate]
    );

    // ───────── นาฬิกาหลัก ─────────
    useEffect(() => {
        if (phase !== "playing") return;
        const id = setInterval(() => {
            if (isUnit6Paused()) return;
            setElapsed((e) => {
                const next = e + 1;
                if (next >= GAME_SECONDS) {
                    clearInterval(id);
                    setPhase("finishing"); // รอบันทึกผลแล้วค่อยโชว์สรุป
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    // เหตุการณ์ที่ค้างอยู่ล่าสุด (ใช้ในรอบประมวลผลทุกวินาที)
    const activeRef = useRef([]);
    useEffect(() => {
        activeRef.current = activeEvents;
    }, [activeEvents]);

    // ───────── ประมวลผลทุกวินาที: timeout / spawn event / special event ─────────
    // หมายเหตุ: ห้ามยิง API หรือเพิ่มตัวนับ "ข้างใน" setState(prev => ...)
    // เพราะ React StrictMode เรียกฟังก์ชันนั้น 2 ครั้งตอน dev → ยิงซ้ำ / spawn_no กระโดดทีละ 2
    // จึงคำนวณจาก activeRef ให้เสร็จก่อน แล้วค่อย setActiveEvents ครั้งเดียว
    useEffect(() => {
        if (phase !== "playing" || elapsed === 0) return;

        let list = activeRef.current;

        // เหตุการณ์ที่หมดเวลา -> timeout
        const survivors = [];
        list.forEach((ev) => {
            const remaining = ev.remaining - 1;
            if (remaining <= 0) {
                // หลุดมือ → ให้ backend หักคะแนนตามที่ตั้งไว้ใน DB
                postGame("respond", {
                    spawnNo: ev.spawnNo,
                    eventId: ev.event.event_id,
                    choiceId: null,
                    responseSeconds: ev.event.time_limit,
                }).then((r) => r && showToast("bad", `${ev.event.title}: ${r.note}`));
            } else {
                survivors.push({ ...ev, remaining });
            }
        });
        list = survivors;

        // เหตุการณ์พิเศษ
        if (elapsed % SPECIAL_EVENT_INTERVAL === 0 && Math.random() < SPECIAL_EVENT_CHANCE) {
            const special = SPECIAL_EVENTS[Math.floor(Math.random() * SPECIAL_EVENTS.length)];

            if (special.type === "integrityFlat") {
                postGame("special", { specialCode: special.id })
                    .then((r) => r && showToast("special", `${special.title} — ${special.description}`));
            } else if (special.type === "autoResolve") {
                const [first, ...rest] = list;

                // ครูเวรแก้เหตุการณ์แรกให้ (backend เลือกตัวเลือกที่ดีที่สุดเอง)
                postGame("special", {
                    specialCode: special.id,
                    eventId: first?.event.event_id,
                    spawnNo: first?.spawnNo,
                }).then((r) => {
                    if (!r) return;
                    showToast(
                        "special",
                        r.resolved
                            ? `${special.title} — ช่วยแก้ "${r.resolved.title}" ให้แล้ว`
                            : `${special.title} — ไม่มีเหตุการณ์ให้ช่วยตอนนี้`
                    );
                });

                if (first) list = rest;
            }
        }

        // สุ่ม spawn event ใหม่ตามความยาก
        const target = getTargetConcurrency(elapsed);
        if (list.length < target) {
            const occupied = new Set(list.map((e) => e.locationId));
            const next = selectNextEvent(LOCATIONS, eventPool, occupied, seenEventsRef.current, lastEventIdRef.current);

            if (next) {
                const { location: loc, event: template } = next;
                lastEventIdRef.current = template.event_id;
                spawnNoRef.current += 1;
                const spawnNo = spawnNoRef.current;
                const uid = `${loc.id}-${template.event_code}-${spawnNo}`;
                list = [...list, { uid, spawnNo, locationId: loc.id, event: template, remaining: template.time_limit }];
            }
        }

        activeRef.current = list;
        setActiveEvents(list);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elapsed, phase]);

    // ปิด modal อัตโนมัติถ้า event ที่เปิดอยู่หมดเวลาไปแล้ว
    useEffect(() => {
        if (selectedUid && !activeEvents.find((e) => e.uid === selectedUid)) {
            setSelectedUid(null);
        }
    }, [activeEvents, selectedUid]);

    // เริ่มรอบใหม่ทุกครั้ง (play_id ใหม่ — รอบเก่ายังอยู่ในประวัติ)
    async function startGame() {
        if (starting) return;
        setStarting(true);
        setFinishError("");

        try {
            const found = await fetchLevelId();
            if (found.unauthorized) {
                navigate("/", { replace: true });
                return;
            }
            if (!found.levelId) {
                alert("ยังไม่มีด่านนี้ในระบบ");
                navigate("/map", { replace: true });
                return;
            }

            const response = await fetch(`${API_URL}/api/game-play/start`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ level_id: found.levelId }),
            });

            if (response.status === 401) {
                navigate("/", { replace: true });
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "เริ่มเกมไม่ได้");
                navigate("/map", { replace: true });
                return;
            }

            const pool = {};
            for (const ev of data.data.events || []) {
                (pool[ev.location_code] ||= []).push(ev);
            }

            playIdRef.current = data.data.play_id;
            spawnNoRef.current = 0;
            seenEventsRef.current = new Set();
            lastEventIdRef.current = null;
            seqRef.current = 0;
            appliedSeqRef.current = 0;
            pendingRef.current = new Set();

            setPlayId(data.data.play_id);
            setEventPool(pool);
            setResult(null);
            setElapsed(0);
            setIntegrity(100);
            setScore(0);
            setHelpedCount(0);
            setMissedCount(0);
            activeRef.current = [];
            setActiveEvents([]);
            setSelectedUid(null);
            setToast(null);
            setPhase("playing");
        } catch (error) {
            console.error("Start crisis game error:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setStarting(false);
        }
    }

    function resetGame() {
        startGame();
    }

    // ───────── หมดเวลา → รอ request ที่ค้างให้ครบ แล้วบันทึกผล ─────────
    const finish = useCallback(async () => {
        setFinishError("");

        try {
            // เหตุการณ์ที่ยังค้างบนกระดานเมื่อหมดเวลา = หลุดมือ
            // ต้องบันทึกก่อนเรียก complete ไม่เช่นนั้นจะไม่ถูกรวมใน missed
            const unresolved = [...activeRef.current];
            activeRef.current = [];
            setActiveEvents([]);

            const finalTimeoutRequests = unresolved.map((ev) =>
                postGame("respond", {
                    spawnNo: ev.spawnNo,
                    eventId: ev.event.event_id,
                    choiceId: null,
                    responseSeconds: ev.event.time_limit,
                })
            );

            await Promise.allSettled([
                ...pendingRef.current,
                ...finalTimeoutRequests,
            ]);

            const response = await fetch(`${API_URL}/api/game-play/complete`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ play_id: playIdRef.current }),
            });

            if (response.status === 401) {
                navigate("/", { replace: true });
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "บันทึกผลไม่สำเร็จ");
            }

            setResult(data.data ?? null);
            setPhase("summary");
        } catch (error) {
            console.error("Complete crisis game error:", error);
            setFinishError(error.message || "บันทึกผลไม่สำเร็จ");
        }
    }, [navigate, postGame]);

    useEffect(() => {
        if (phase === "finishing") finish();
    }, [phase, finish]);

    function handleTileClick(locationId) {
        const ev = activeEvents.find((e) => e.locationId === locationId);
        if (ev) setSelectedUid(ev.uid);
    }

    function handleChoice(choice) {
        const selected = activeEvents.find((e) => e.uid === selectedUid);
        if (!selected) return;

        const rest = activeRef.current.filter((e) => e.uid !== selectedUid);
        activeRef.current = rest;
        setActiveEvents(rest);
        setSelectedUid(null);

        postGame("respond", {
            spawnNo: selected.spawnNo,
            eventId: selected.event.event_id,
            choiceId: choice.choice_id,
            responseSeconds: selected.event.time_limit - selected.remaining,
        }).then((r) => {
            if (!r) return;
            showToast(
                r.integrity_delta >= 0 ? "good" : "bad",
                `${r.note} (${r.score_delta >= 0 ? "+" : ""}${r.score_delta} คะแนน)`
            );
        });
    }

    const selectedEvent = activeEvents.find((e) => e.uid === selectedUid) || null;

    const mm = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, "0");
    const ss = String(Math.max(0, timeLeft) % 60).padStart(2, "0");

    // ผลสุดท้ายมาจาก backend (complete)
    const finalIntegrity = result?.integrity ?? integrity;
    const finalScore = result?.score ?? score;
    const finalHelped = result?.helped ?? helpedCount;
    const finalMissed = result?.missed ?? missedCount;
    const studentsSafe = finalIntegrity >= 80;
    const rank = result?.rank ?? "D";
    const { rankText, flavor } = RANK_INFO[rank] || RANK_INFO.D;
    const earnedIP = result?.earned_ip ?? 0;

    return (
        <>
            <div className="crisis-stage">
                {phase === "intro" && (
                    <div className="intro-card">
                        <span className="pin pin-left"><FaThumbtack /></span>
                        <span className="pin pin-right"><FaThumbtack /></span>
                        <div className="intro-badge">🦸</div>
                        <h1><FaGraduationCap className="title-icon" /> Crisis Response</h1>
                        <p>
                            โรงเรียนกำลังเกิดเหตุการณ์หลายจุด คุณมีเวลาเพียง 30 วินาที
                            ในการช่วยเหลือให้มากที่สุด
                        </p>
                        <div className="intro-goals">
                            <div className="intro-goal"><FaHeart /> Integrity ≥ 80</div>
                            <div className="intro-goal"><FaUserFriends /> นักเรียนปลอดภัย</div>
                        </div>
                        <button className="intro-start" onClick={startGame} disabled={starting}>
                            {starting ? "กำลังเตรียมภารกิจ..." : "เริ่มภารกิจ"}
                        </button>
                    </div>
                )}

                {phase === "playing" && (
                    <>
                        <div className="hud">
                            <div className={`hud-chip ${integrity < 50 ? "warn" : ""}`}>
                                <FaHeart />
                                <span>Integrity {integrity}</span>
                            </div>
                            <div className="hud-chip">
                                <FaClock />
                                <span>{mm}:{ss}</span>
                            </div>
                            <div className="hud-chip">
                                <FaStar />
                                <span>Score {score}</span>
                            </div>
                        </div>

                        <div className="map-frame">
                            <div className="map-signage">
                                <FaMapMarkedAlt />
                                <span>แผนผังโรงเรียน</span>
                            </div>
                            <div className="school-map">
                                {LOCATIONS.map((loc) => {
                                    const activeEv = activeEvents.find((e) => e.locationId === loc.id);
                                    const Icon = loc.icon;
                                    return (
                                        <div
                                            key={loc.id}
                                            className={`map-tile ${activeEv ? "active" : ""}`}
                                            onClick={() => activeEv && handleTileClick(loc.id)}
                                        >
                                            <Icon />
                                            <span>{loc.name}</span>
                                            {activeEv && (
                                                <>
                                                    <span className="map-tile-badge">⚠️</span>
                                                    <div className="map-tile-timer">
                                                        <div
                                                            className="map-tile-timer-fill"
                                                            style={{ width: `${(activeEv.remaining / activeEv.event.time_limit) * 100}%` }}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

                        {selectedEvent && (
                            <div className="event-overlay" onClick={() => setSelectedUid(null)}>
                                <div className="event-modal-wrap">
                                    <span className="pin pin-left"><FaThumbtack /></span>
                                    <span className="pin pin-right"><FaThumbtack /></span>
                                    <span className="urgent-stamp">ด่วน!</span>
                                    <div className="event-modal" onClick={(e) => e.stopPropagation()}>
                                        <div className="event-modal-head">
                                            <span className="event-icon-badge"><FaExclamationTriangle /></span>
                                            {selectedEvent.event.title}
                                        </div>
                                        <div className="event-modal-timer">
                                            <div
                                                className="event-modal-timer-fill"
                                                style={{ width: `${(selectedEvent.remaining / selectedEvent.event.time_limit) * 100}%` }}
                                            />
                                        </div>
                                        <p className="event-desc">{selectedEvent.event.description}</p>
                                        <div className="event-choices">
                                            {selectedEvent.event.choices.map((choice) => {
                                                const ChoiceIcon = CHOICE_ICONS[choice.icon_key] || FaComments;
                                                return (
                                                    <button key={choice.choice_id} className="event-choice-btn" onClick={() => handleChoice(choice)}>
                                                        <ChoiceIcon />
                                                        {choice.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {phase === "finishing" && (
                    <div className="summary-card">
                        <h1>กำลังสรุปผลภารกิจ...</h1>
                        {finishError && (
                            <>
                                <p className="summary-flavor" style={{ color: "#c8102e" }}>{finishError}</p>
                                <button className="intro-start" onClick={finish}>ลองบันทึกผลอีกครั้ง</button>
                            </>
                        )}
                    </div>
                )}

                {phase === "summary" && (
                    <div className="summary-card">
                        <div className="summary-badge"><FaTrophy /></div>
                        <h1>Mission Complete</h1>
                        <p className="summary-sub">ช่วยเหลือ {finalHelped} / {finalHelped + finalMissed}</p>

                        <div className="summary-grid">
                            <div className="summary-item good">
                                <strong>{finalHelped}</strong>
                                <span>ช่วยทัน</span>
                            </div>
                            <div className="summary-item bad">
                                <strong>{finalMissed}</strong>
                                <span>หลุดมือ</span>
                            </div>
                            <div className="summary-item">
                                <strong>{finalIntegrity}%</strong>
                                <span>Integrity</span>
                            </div>
                            <div className="summary-item">
                                <strong>{finalScore}</strong>
                                <span>Score</span>
                            </div>
                        </div>

                        <div className="summary-rank">
                            <div className="rank-shield">{rank}</div>
                            <div className="rank-text">{rankText}</div>
                        </div>

                        <p className="summary-flavor">
                            {studentsSafe ? "✅ นักเรียนปลอดภัย" : "⚠️ นักเรียนบางส่วนไม่ปลอดภัย"} — {flavor}
                        </p>

                        <p className="summary-flavor" style={{ color: "#c8102e", fontWeight: 800, fontSize: 18 }}>
                            ได้รับ +{earnedIP} IP
                        </p>

                        <div className="summary-buttons">
                            <button className="btn blue" onClick={resetGame} disabled={starting}>
                                <FaRedoAlt />
                                <div>
                                    <strong>เล่นใหม่</strong>
                                    <span>เริ่มใหม่อีกครั้ง</span>
                                </div>
                            </button>
                            <button className="btn green" onClick={() => navigate(nextRoute)}>
                                <FaPlay />
                                <div>
                                    <strong>ด่านต่อไป</strong>
                                    <span>ไปยังภารกิจถัดไป</span>
                                </div>
                            </button>
                            <button className="btn blue" onClick={() => navigate('/map')}>
                                <FaMapMarkedAlt /><strong>กลับหน้าแมพ</strong>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
