import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaClipboardList,
    FaUtensils,
    FaFutbol,
    FaBookOpen,
    FaBus,
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
import bgHallway from "../../assets/unit6/school-bg.png";

// ─────────────────────────────────────────────
// ข้อมูลเกม — แก้ไข/เพิ่ม event ได้ตรงนี้ที่เดียว
// ─────────────────────────────────────────────
const LOCATIONS = [
    { id: "examRoom", name: "ห้องสอบ", icon: FaClipboardList },
    { id: "canteen", name: "โรงอาหาร", icon: FaUtensils },
    { id: "library", name: "ห้องสมุด", icon: FaBookOpen },
    { id: "registrar", name: "ห้องทะเบียน", icon: FaBuilding },
    { id: "restroom", name: "ห้องน้ำ", icon: FaRestroom },
    { id: "computerRoom", name: "ห้องคอม", icon: FaDesktop },
];

// choices: integrityDelta / scoreDelta / trustDelta / note
// timeLimit: วินาทีก่อนเหตุการณ์ "หลุดมือ" (timeout)
const EVENT_POOL = {
    examRoom: [
        {
            id: "cheating",
            title: "เพื่อนกำลังลอกข้อสอบ",
            description: "คุณเห็นเพื่อนแอบเปิดชีทลอกคำตอบระหว่างสอบ",
            timeLimit: 18,
            choices: [
                { id: "talk", label: "เข้าไปคุย", icon: FaComments, integrityDelta: 10, scoreDelta: 15, trustDelta: 5, note: "เพื่อนหยุดลอกและขอบคุณคุณ" },
                { id: "report", label: "แจ้งครู", icon: FaChalkboardTeacher, integrityDelta: 8, scoreDelta: 10, trustDelta: -2, note: "ครูเข้ามาจัดการ หยุดการโกงได้" },
                { id: "afterExam", label: "ชวนอ่านหลังสอบ", icon: FaHandshake, integrityDelta: 10, scoreDelta: 15, trustDelta: 8, note: "เพื่อนซึ้งใจและหยุดลอกทันที" },
                { id: "ignore", label: "แกล้งไม่เห็น", icon: FaEyeSlash, integrityDelta: -15, scoreDelta: -10, trustDelta: 0, note: "เพื่อนลอกข้อสอบสำเร็จ" },
            ],
            timeout: { integrityDelta: -10, scoreDelta: -10, note: "ไม่มีใครเข้าไปช่วย เพื่อนลอกข้อสอบสำเร็จ" },
        },
    ],
    canteen: [
        {
            id: "lostWallet",
            title: "เจอกระเป๋าเงินตก",
            description: "คุณเดินผ่านโต๊ะอาหารแล้วเจอกระเป๋าเงินตกอยู่",
            timeLimit: 16,
            choices: [
                { id: "announce", label: "ประกาศหาเจ้าของ", icon: FaBullhorn, integrityDelta: 10, scoreDelta: 15, trustDelta: 5, note: "เจ้าของดีใจมากที่ได้เงินคืน" },
                { id: "sendTeacher", label: "ส่งครู", icon: FaChalkboardTeacher, integrityDelta: 8, scoreDelta: 10, trustDelta: 2, note: "ครูรับเรื่องไปประกาศหาเจ้าของ" },
                { id: "keep", label: "เก็บไว้เอง", icon: FaHandPaper, integrityDelta: -15, scoreDelta: -10, trustDelta: 0, note: "คุณเก็บเงินไว้เอง" },
            ],
            timeout: { integrityDelta: -8, scoreDelta: -5, note: "ไม่มีใครเก็บ กระเป๋าเงินหายไป" },
        },
    ],
    library: [
        {
            id: "tornBook",
            title: "มีคนฉีกหนังสือ",
            description: "คุณเห็นนักเรียนคนหนึ่งกำลังฉีกหน้าหนังสือในห้องสมุด",
            timeLimit: 16,
            choices: [
                { id: "stop", label: "ห้ามปราม", icon: FaComments, integrityDelta: 10, scoreDelta: 15, trustDelta: 5, note: "นักเรียนหยุดฉีกหนังสือ" },
                { id: "reportLibrarian", label: "แจ้งบรรณารักษ์", icon: FaChalkboardTeacher, integrityDelta: 8, scoreDelta: 10, trustDelta: 0, note: "บรรณารักษ์เข้ามาจัดการ" },
                { id: "walkAway", label: "เดินหนี", icon: FaWalking, integrityDelta: -12, scoreDelta: -8, trustDelta: 0, note: "หนังสือถูกทำลายต่อไป" },
            ],
            timeout: { integrityDelta: -8, scoreDelta: -5, note: "หนังสือหลายเล่มถูกฉีกเสียหาย" },
        },
    ],
    registrar: [
        {
            id: "forgedSignature",
            title: "มีคนปลอมลายเซ็น",
            description: "คุณเห็นเอกสารที่มีลายเซ็นครูดูผิดปกติในห้องทะเบียน",
            timeLimit: 18,
            choices: [
                { id: "reportStaff", label: "แจ้งเจ้าหน้าที่", icon: FaChalkboardTeacher, integrityDelta: 12, scoreDelta: 15, trustDelta: 5, note: "เจ้าหน้าที่ตรวจสอบและจับได้ทัน" },
                { id: "ignore", label: "เพิกเฉย", icon: FaEyeSlash, integrityDelta: -15, scoreDelta: -10, trustDelta: 0, note: "เอกสารปลอมถูกใช้งานจริง" },
            ],
            timeout: { integrityDelta: -10, scoreDelta: -10, note: "เอกสารปลอมหลุดรอดไปแล้ว" },
        },
    ],
    restroom: [
        {
            id: "smoking",
            title: "มีคนสูบบุหรี่",
            description: "คุณได้กลิ่นควันบุหรี่จากในห้องน้ำ",
            timeLimit: 15,
            choices: [
                { id: "warn", label: "ตักเตือน", icon: FaComments, integrityDelta: 10, scoreDelta: 15, trustDelta: 5, note: "นักเรียนหยุดสูบบุหรี่" },
                { id: "report", label: "แจ้งครู", icon: FaChalkboardTeacher, integrityDelta: 8, scoreDelta: 10, trustDelta: 0, note: "ครูเข้ามาจัดการ" },
                { id: "walkAway", label: "เดินหนี", icon: FaWalking, integrityDelta: -12, scoreDelta: -8, trustDelta: 0, note: "มีคนสูบบุหรี่ต่อไป" },
            ],
            timeout: { integrityDelta: -8, scoreDelta: -5, note: "กลิ่นควันลามไปทั่วอาคาร" },
        },
    ],
    computerRoom: [
        {
            id: "gambling",
            title: "มีคนเข้าเว็บพนัน",
            description: "คุณเห็นนักเรียนคนหนึ่งเปิดเว็บพนันในห้องคอมพิวเตอร์",
            timeLimit: 16,
            choices: [
                { id: "warn", label: "ตักเตือน", icon: FaComments, integrityDelta: 10, scoreDelta: 15, trustDelta: 5, note: "นักเรียนปิดเว็บทันที" },
                { id: "report", label: "แจ้งครู", icon: FaChalkboardTeacher, integrityDelta: 8, scoreDelta: 10, trustDelta: 0, note: "ครูเข้ามาตักเตือน" },
                { id: "ignore", label: "ไม่สนใจ", icon: FaTimesCircle, integrityDelta: -15, scoreDelta: -10, trustDelta: 0, note: "นักเรียนเล่นพนันต่อไป" },
            ],
            timeout: { integrityDelta: -10, scoreDelta: -8, note: "เว็บพนันถูกส่งต่อในกลุ่มเพื่อน" },
        },
    ],
};

// เหตุการณ์พิเศษ — สุ่มเช็คทุก SPECIAL_EVENT_INTERVAL วินาที
const SPECIAL_EVENTS = [
    { id: "fakeNews", type: "integrityFlat", title: "📢 ข่าวปลอมระบาด", description: "\"โกงนิดเดียวไม่เป็นไร\" ทำให้ Integrity ลดลง", integrityDelta: -5 },
    { id: "teacherHelp", type: "autoResolve", title: "👨‍🏫 ครูเวรมาช่วย", description: "ครูช่วยจัดการเหตุการณ์ให้ 1 จุดฟรี" },
    { id: "virtueDay", type: "integrityFlat", title: "🎉 วันคุณธรรม", description: "ทุกคนร่วมมือกันทำความดี Integrity เพิ่มขึ้น", integrityDelta: 10 },
];

const GAME_SECONDS = 40;
const SPECIAL_EVENT_INTERVAL = 12;
const SPECIAL_EVENT_CHANCE = 0.7;

function getTargetConcurrency(elapsedSeconds) {
    if (elapsedSeconds < 10) return 1;
    if (elapsedSeconds < 20) return 2;
    return 3;
}

export default function CrisisResponse({ nextRoute = "/unit5/gamelevel2" }) {
    const navigate = useNavigate();

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

    const showToast = useCallback((type, message) => {
        clearTimeout(toastTimerRef.current);
        setToast({ type, message });
        toastTimerRef.current = setTimeout(() => setToast(null), 1800);
    }, []);

    const applyDelta = useCallback((integrityDelta = 0, scoreDelta = 0) => {
        setIntegrity((v) => Math.min(100, Math.max(0, v + integrityDelta)));
        setScore((s) => Math.max(0, s + scoreDelta));
    }, []);

    // ───────── นาฬิกาหลัก ─────────
    useEffect(() => {
        if (phase !== "playing") return;
        const id = setInterval(() => {
            setElapsed((e) => {
                const next = e + 1;
                if (next >= GAME_SECONDS) {
                    clearInterval(id);
                    setPhase("summary");
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [phase]);

    // ───────── ประมวลผลทุกวินาที: timeout / spawn event / special event ─────────
    useEffect(() => {
        if (phase !== "playing" || elapsed === 0) return;

        // เหตุการณ์ที่หมดเวลา -> timeout
        setActiveEvents((prev) => {
            const survivors = [];
            prev.forEach((ev) => {
                const remaining = ev.remaining - 1;
                if (remaining <= 0) {
                    const t = ev.event.timeout;
                    applyDelta(t.integrityDelta, t.scoreDelta, 0);
                    setMissedCount((c) => c + 1);
                    showToast("bad", `${ev.event.title}: ${t.note}`);
                } else {
                    survivors.push({ ...ev, remaining });
                }
            });
            return survivors;
        });

        // เหตุการณ์พิเศษ
        if (elapsed % SPECIAL_EVENT_INTERVAL === 0 && Math.random() < SPECIAL_EVENT_CHANCE) {
            const special = SPECIAL_EVENTS[Math.floor(Math.random() * SPECIAL_EVENTS.length)];
            if (special.type === "integrityFlat") {
                applyDelta(special.integrityDelta, 0, 0);
                showToast("special", `${special.title} — ${special.description}`);
            } else if (special.type === "autoResolve") {
                setActiveEvents((prev) => {
                    if (prev.length === 0) {
                        showToast("special", `${special.title} — ไม่มีเหตุการณ์ให้ช่วยตอนนี้`);
                        return prev;
                    }
                    const [first, ...rest] = prev;
                    const best = first.event.choices.reduce((a, b) => (b.integrityDelta > a.integrityDelta ? b : a));
                    applyDelta(best.integrityDelta, best.scoreDelta, best.trustDelta);
                    setHelpedCount((c) => c + 1);
                    showToast("special", `${special.title} — ช่วยแก้ "${first.event.title}" ให้แล้ว`);
                    return rest;
                });
            }
        }

        // สุ่ม spawn event ใหม่ตามความยาก
        setActiveEvents((prev) => {
            const target = getTargetConcurrency(elapsed);
            if (prev.length >= target) return prev;
            const occupied = new Set(prev.map((e) => e.locationId));
            const available = LOCATIONS.filter((l) => !occupied.has(l.id) && EVENT_POOL[l.id]?.length);
            if (available.length === 0) return prev;
            const loc = available[Math.floor(Math.random() * available.length)];
            const pool = EVENT_POOL[loc.id];
            const template = pool[Math.floor(Math.random() * pool.length)];
            const uid = `${loc.id}-${template.id}-${Date.now()}`;
            return [...prev, { uid, locationId: loc.id, event: template, remaining: template.timeLimit }];
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [elapsed, phase]);

    // ปิด modal อัตโนมัติถ้า event ที่เปิดอยู่หมดเวลาไปแล้ว
    useEffect(() => {
        if (selectedUid && !activeEvents.find((e) => e.uid === selectedUid)) {
            setSelectedUid(null);
        }
    }, [activeEvents, selectedUid]);

    function startGame() {
        setPhase("playing");
    }

    function resetGame() {
        setElapsed(0);
        setIntegrity(100);
        setScore(0);
        setHelpedCount(0);
        setMissedCount(0);
        setActiveEvents([]);
        setSelectedUid(null);
        setToast(null);
        setPhase("playing");
    }

    function handleTileClick(locationId) {
        const ev = activeEvents.find((e) => e.locationId === locationId);
        if (ev) setSelectedUid(ev.uid);
    }

    function handleChoice(choice) {
        const selected = activeEvents.find((e) => e.uid === selectedUid);
        if (!selected) return;
        applyDelta(choice.integrityDelta, choice.scoreDelta, choice.trustDelta);
        setHelpedCount((c) => c + 1);
        showToast(choice.integrityDelta >= 0 ? "good" : "bad", `${choice.note} (${choice.scoreDelta >= 0 ? "+" : ""}${choice.scoreDelta} คะแนน)`);
        setActiveEvents((prev) => prev.filter((e) => e.uid !== selectedUid));
        setSelectedUid(null);
    }

    const selectedEvent = activeEvents.find((e) => e.uid === selectedUid) || null;

    const mm = String(Math.floor(Math.max(0, timeLeft) / 60)).padStart(2, "0");
    const ss = String(Math.max(0, timeLeft) % 60).padStart(2, "0");

    const studentsSafe = integrity >= 80;
    const { rank, rankText, flavor } = (() => {
        if (integrity >= 90 && score >= 150) return { rank: "S", rankText: "ยอดเยี่ยม", flavor: "คุณคือ Integrity Ambassador ตัวจริง นักเรียนทุกคนปลอดภัย" };
        if (score >= 110) return { rank: "A", rankText: "ดีมาก", flavor: "คุณจัดการวิกฤตได้อย่างมีสติและทันเวลา" };
        if (score >= 70) return { rank: "B", rankText: "ดี", flavor: "ยังพลาดไปบ้าง แต่ช่วยเหลือได้หลายเหตุการณ์" };
        if (score >= 30) return { rank: "C", rankText: "พอใช้", flavor: "ควรตัดสินใจให้เร็วและเหมาะสมกว่านี้" };
        return { rank: "D", rankText: "ควรปรับปรุง", flavor: "มีหลายเหตุการณ์ที่หลุดมือไป ลองใหม่อีกครั้ง" };
    })();

    return (
        <>
            <style>{css}</style>

            <div className="crisis-stage">
                {phase === "intro" && (
                    <div className="intro-card">
                        <span className="pin pin-left"><FaThumbtack /></span>
                        <span className="pin pin-right"><FaThumbtack /></span>
                        <div className="intro-badge">🦸</div>
                        <h1><FaGraduationCap className="title-icon" /> Crisis Response</h1>
                        <p>
                            โรงเรียนกำลังเกิดเหตุการณ์หลายจุด คุณมีเวลาเพียง 2 นาที
                            ในการช่วยเหลือให้มากที่สุด
                        </p>
                        <div className="intro-goals">
                            <div className="intro-goal"><FaHeart /> Integrity ≥ 80</div>
                            <div className="intro-goal"><FaUserFriends /> นักเรียนปลอดภัย</div>
                        </div>
                        <button className="intro-start" onClick={startGame}>เริ่มภารกิจ</button>
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
                                                            style={{ width: `${(activeEv.remaining / activeEv.event.timeLimit) * 100}%` }}
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
                                                style={{ width: `${(selectedEvent.remaining / selectedEvent.event.timeLimit) * 100}%` }}
                                            />
                                        </div>
                                        <p className="event-desc">{selectedEvent.event.description}</p>
                                        <div className="event-choices">
                                            {selectedEvent.event.choices.map((choice) => {
                                                const ChoiceIcon = choice.icon;
                                                return (
                                                    <button key={choice.id} className="event-choice-btn" onClick={() => handleChoice(choice)}>
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

                {phase === "summary" && (
                    <div className="summary-card">
                        <div className="summary-badge"><FaTrophy /></div>
                        <h1>Mission Complete</h1>
                        <p className="summary-sub">ช่วยเหลือ {helpedCount} / {helpedCount + missedCount}</p>

                        <div className="summary-grid">
                            <div className="summary-item good">
                                <strong>{helpedCount}</strong>
                                <span>ช่วยทัน</span>
                            </div>
                            <div className="summary-item bad">
                                <strong>{missedCount}</strong>
                                <span>หลุดมือ</span>
                            </div>
                            <div className="summary-item">
                                <strong>{integrity}%</strong>
                                <span>Integrity</span>
                            </div>
                            <div className="summary-item">
                                <strong>{score}</strong>
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

                        <div className="summary-buttons">
                            <button className="btn blue" onClick={resetGame}>
                                <FaRedoAlt />
                                <div>
                                    <strong>เล่นใหม่</strong>
                                    <span>เริ่มใหม่อีกครั้ง</span>
                                </div>
                            </button>
                            <button className="btn green" onClick={() => navigate('/unit6/game2')}>
                                <FaPlay />
                                <div>
                                    <strong>ด่านต่อไป</strong>
                                    <span>ไปยังภารกิจถัดไป</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@500;600;700;800;900&family=Sarabun:wght@400;500;600;700&display=swap');

*{
box-sizing:border-box;
margin:0;
padding:0;
font-family:'Sarabun','Kanit',sans-serif;
}

html, body, #root{ height:100%; }

/* ───────── Stage: school hallway w/ lockers ───────── */
.crisis-stage{
height:100vh;
height:100dvh;
overflow:hidden;
padding:clamp(8px,1.5vh,18px) clamp(8px,2vw,18px);
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:clamp(6px,1.2vh,14px);
background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 2px, transparent 2px 64px),
    linear-gradient(180deg, rgba(10,18,34,.55) 0%, rgba(6,11,22,.75) 55%, rgba(3,6,12,.92) 100%),
    url(${bgHallway}) center / cover no-repeat fixed;
color:white;
}

/* ───────── Intro: notebook / binder cover ───────── */
.intro-card{
position:relative;
width:min(92vw,480px);
background:
    repeating-linear-gradient(180deg, transparent 0 37px, rgba(28,58,95,.14) 37px 38px),
    #fff9ea;
border-left:6px solid #c8102e;
border-radius:6px 18px 18px 6px;
padding:clamp(24px,4vh,40px) clamp(20px,4vw,32px);
text-align:center;
box-shadow:0 20px 50px rgba(0,0,0,.55), 0 0 0 4px #12233f, 0 0 0 8px rgba(255,199,44,.35);
color:#1a2333;
}

/* corkboard push-pins, reused on the event modal too */
.pin{
position:absolute;
top:-14px;
font-size:20px;
color:#ffc72c;
filter:drop-shadow(0 3px 4px rgba(0,0,0,.55));
z-index:2;
}
.pin-left{ left:26px; transform:rotate(-20deg); }
.pin-right{ right:26px; transform:rotate(20deg); }

.intro-badge{
width:84px;
height:84px;
margin:0 auto;
display:flex;
align-items:center;
justify-content:center;
font-size:38px;
border-radius:50%;
background:radial-gradient(circle at 35% 30%,#ffe9a8,#ffc72c 55%,#c8102e 130%);
border:3px solid #12233f;
box-shadow:0 8px 20px rgba(200,16,46,.4), inset 0 0 0 3px rgba(255,255,255,.5);
}

.title-icon{
color:#c8102e;
margin-right:8px;
vertical-align:-2px;
filter:drop-shadow(0 2px 3px rgba(0,0,0,.15));
}

.intro-card h1{
margin-top:14px;
font-family:'Kanit',sans-serif;
font-size:clamp(22px,3.4vh,28px);
color:#12233f;
font-weight:900;
letter-spacing:.5px;
text-transform:uppercase;
}

.intro-card p{
margin-top:14px;
color:#3d4759;
font-size:14px;
line-height:1.7;
}

.intro-goals{
margin-top:18px;
display:flex;
justify-content:center;
gap:16px;
flex-wrap:wrap;
}

.intro-goal{
display:flex;
align-items:center;
gap:8px;
background:#12233f;
border:1px solid #1a3358;
padding:8px 14px;
border-radius:999px;
font-size:13px;
color:#fff8e7;
font-weight:700;
}

.intro-goal svg{ color:#ffc72c; }

.intro-start{
margin-top:26px;
width:100%;
height:54px;
border:none;
border-radius:14px;
font-family:'Kanit',sans-serif;
font-size:17px;
font-weight:800;
letter-spacing:1px;
text-transform:uppercase;
color:#fff8e7;
background:linear-gradient(#e01b3e,#a30d28);
box-shadow:0 6px 0 #6e0819, 0 10px 20px rgba(0,0,0,.35);
cursor:pointer;
transition:.15s;
}

.intro-start:hover{ transform:translateY(2px); box-shadow:0 4px 0 #6e0819, 0 6px 14px rgba(0,0,0,.35); }

/* ───────── HUD: chalkboard chips ───────── */
.hud{
width:min(96vw,900px);
flex-shrink:0;
display:flex;
gap:8px;
flex-wrap:wrap;
}

.hud-chip{
flex:1;
min-width:100px;
display:flex;
align-items:center;
justify-content:center;
gap:6px;
padding:clamp(6px,1vh,10px) 10px;
border-radius:8px;
background:#1e3324;
background-image:radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px);
background-size:6px 6px;
backdrop-filter:blur(8px);
-webkit-backdrop-filter:blur(8px);
border:2px dashed rgba(255,255,255,.35);
font-family:'Kanit',sans-serif;
font-weight:700;
font-size:clamp(11px,1.6vh,14px);
color:#f5f5f0;
box-shadow:0 6px 14px rgba(0,0,0,.35);
}

.hud-chip svg{ color:#ffc72c; }
.hud-chip.warn svg{ color:#ff6b6b; }
.hud-chip.warn{ color:#ffb3b3; border-color:rgba(255,107,107,.6); }

/* ───────── School map: locker bay ───────── */
.map-frame{
width:min(96vw,900px);
flex:1 1 auto;
min-height:0;
display:flex;
flex-direction:column;
gap:8px;
}

.map-signage{
flex-shrink:0;
display:flex;
align-items:center;
justify-content:center;
gap:8px;
background:linear-gradient(180deg,#fff8e7,#f4e3ae);
color:#12233f;
font-family:'Kanit',sans-serif;
font-weight:800;
font-size:clamp(12px,1.8vh,14px);
padding:8px 16px;
border-radius:10px;
border:2px solid #12233f;
box-shadow:0 6px 14px rgba(0,0,0,.35);
letter-spacing:.5px;
text-transform:uppercase;
}

.map-signage svg{ color:#c8102e; font-size:16px; }

.school-map{
width:100%;
flex:1 1 auto;
min-height:0;
border-radius:16px;
border:3px solid #0e1a2e;
background:
    repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 40px, transparent 40px 80px),
    linear-gradient(135deg,#1c3358 0%,#0f1e37 100%);
box-shadow:inset 0 0 0 1px rgba(255,255,255,.06), 0 10px 30px rgba(0,0,0,.5);
padding:clamp(10px,2vh,20px);
display:grid;
grid-template-columns:repeat(4,1fr);
grid-template-rows:repeat(2,1fr);
gap:clamp(8px,1.6vh,16px);
}

.map-tile{
position:relative;
border-radius:8px;
background:
    repeating-linear-gradient(180deg, rgba(0,0,0,.12) 0 2px, transparent 2px 7px) top / 100% 16px no-repeat,
    linear-gradient(180deg,#c3cfdd 0%,#8fa1b7 55%,#71879f 100%);
border:1px solid #4a5b73;
box-shadow:inset 0 0 0 1px rgba(255,255,255,.35), 0 4px 10px rgba(0,0,0,.4);
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
gap:6px;
cursor:default;
transition:.2s;
color:#16233a;
}

.map-tile::before{
content:"";
position:absolute;
top:10px;
right:10px;
width:5px;
height:18px;
border-radius:2px;
background:#12233f;
box-shadow:-2px 0 0 rgba(255,255,255,.25);
}

.map-tile::after{
content:"";
position:absolute;
inset:6px;
border:1px solid rgba(18,35,63,.18);
border-radius:5px;
pointer-events:none;
}

.map-tile svg{ font-size:clamp(20px,4vh,34px); color:#12233f; }

.map-tile span{
font-family:'Kanit',sans-serif;
font-size:clamp(10px,1.5vh,13px);
font-weight:700;
text-align:center;
}

.map-tile.active{
cursor:pointer;
border-color:#e01b3e;
color:#fff2ea;
background:
    repeating-linear-gradient(180deg, rgba(0,0,0,.18) 0 2px, transparent 2px 7px) top / 100% 16px no-repeat,
    linear-gradient(180deg,#e35a5a 0%,#a30d28 100%);
animation:tilePulse 1s ease-in-out infinite;
}

.map-tile.active svg{ color:#fff8e7; }

@keyframes tilePulse{
0%,100%{ box-shadow:inset 0 0 0 1px rgba(255,255,255,.35), 0 0 0 0 rgba(224,27,62,.55); }
50%{ box-shadow:inset 0 0 0 1px rgba(255,255,255,.35), 0 0 0 10px rgba(224,27,62,0); }
}

.map-tile-badge{
position:absolute;
top:6px;
right:6px;
font-size:clamp(14px,2.4vh,20px);
animation:badgeBlink 1s ease-in-out infinite;
}

@keyframes badgeBlink{
0%,100%{ opacity:1; }
50%{ opacity:.25; }
}

.map-tile-timer{
position:absolute;
bottom:6px;
left:8px;
right:8px;
height:5px;
border-radius:999px;
background:rgba(18,35,63,.4);
overflow:hidden;
}

.map-tile-timer-fill{
height:100%;
background:#ffc72c;
transition:width .3s linear;
}

/* ───────── Event modal: hall pass slip ───────── */
.event-overlay{
position:fixed;
inset:0;
background:rgba(4,6,12,.75);
display:flex;
align-items:center;
justify-content:center;
padding:16px;
z-index:20;
}

.event-modal-wrap{
position:relative;
width:min(94vw,420px);
max-height:90vh;
}

.event-modal{
width:100%;
max-height:90vh;
overflow:auto;
background:
    repeating-linear-gradient(180deg, transparent 0 27px, rgba(28,58,95,.13) 27px 28px),
    #fff9ea;
border-left:6px solid #c8102e;
color:#1a2333;
border-radius:6px 16px 16px 6px;
padding:clamp(16px,3vh,24px);
box-shadow:0 24px 60px rgba(0,0,0,.6), 0 0 0 4px #12233f, 0 0 0 7px rgba(255,199,44,.3);
}

.urgent-stamp{
position:absolute;
top:14px;
right:14px;
z-index:2;
background:transparent;
color:#c8102e;
font-weight:900;
font-size:13px;
padding:4px 10px;
border-radius:999px;
border:3px solid #c8102e;
letter-spacing:1px;
text-transform:uppercase;
transform:rotate(8deg);
opacity:.9;
}

.event-modal-head{
display:flex;
align-items:center;
gap:10px;
font-family:'Kanit',sans-serif;
font-weight:800;
font-size:clamp(15px,2.2vh,18px);
color:#12233f;
}

.event-modal-timer{
margin-top:8px;
height:6px;
border-radius:999px;
background:#e3d7ae;
overflow:hidden;
}

.event-modal-timer-fill{
height:100%;
background:#c8102e;
transition:width .3s linear;
}

.event-modal p.event-desc{
margin-top:12px;
font-size:14px;
line-height:1.6;
color:#3d4759;
}

.event-choices{
margin-top:16px;
display:flex;
flex-direction:column;
gap:10px;
}

.event-choice-btn{
display:flex;
align-items:center;
gap:12px;
padding:12px 14px;
border-radius:10px;
border:2px solid #12233f;
background:#fff8e7;
font-weight:700;
font-size:14px;
color:#1a2333;
cursor:pointer;
text-align:left;
transition:.15s;
}

.event-choice-btn:hover{
background:#ffc72c;
color:#12233f;
border-color:#12233f;
transform:translateY(-1px);
}

.event-choice-btn svg{ font-size:18px; flex-shrink:0; color:#c8102e; }
.event-choice-btn:hover svg{ color:#12233f; }

/* ───────── Toast: sticky note ───────── */
.toast{
position:fixed;
top:14px;
left:50%;
transform:translateX(-50%) rotate(-1deg);
padding:10px 20px;
border-radius:4px;
font-family:'Kanit',sans-serif;
font-weight:700;
font-size:13px;
white-space:nowrap;
z-index:30;
box-shadow:0 8px 16px rgba(0,0,0,.3);
animation:fadeDown .3s ease-out;
}

.toast.good{ background:#c8f2a0; color:#1e3a1a; }
.toast.bad{ background:#ffb3b8; color:#5a0d13; }
.toast.special{ background:#ffe28a; color:#4a3308; }

@keyframes fadeDown{
from{ opacity:0; transform:translate(-50%,-10px) rotate(-1deg); }
to{ opacity:1; transform:translate(-50%,0) rotate(-1deg); }
}

/* ───────── Summary: report card ───────── */
.summary-card{
width:min(94vw,520px);
max-height:96vh;
overflow:auto;
background:
    repeating-linear-gradient(180deg, transparent 0 37px, rgba(28,58,95,.12) 37px 38px),
    #fff9ea;
border-left:6px solid #c8102e;
border-radius:6px 22px 22px 6px;
padding:clamp(18px,3vh,32px) clamp(16px,3vw,28px);
text-align:center;
color:#1a2333;
box-shadow:0 20px 50px rgba(0,0,0,.55), 0 0 0 4px #12233f, 0 0 0 8px rgba(255,199,44,.3);
}

.summary-badge{
font-size:34px;
color:#ffc72c;
filter:drop-shadow(0 4px 8px rgba(0,0,0,.25));
margin-bottom:2px;
}

.summary-card h1{
font-family:'Kanit',sans-serif;
font-size:clamp(20px,3.2vh,28px);
color:#12233f;
font-weight:900;
text-transform:uppercase;
letter-spacing:.5px;
}

.summary-sub{
margin-top:6px;
color:#5a6478;
font-size:14px;
}

.summary-grid{
margin-top:22px;
display:grid;
grid-template-columns:repeat(4,1fr);
gap:10px;
}

.summary-item{
background:#fff8e7;
border:1px solid #cdbf90;
border-radius:10px;
padding:12px 6px;
display:flex;
flex-direction:column;
align-items:center;
gap:4px;
font-size:12px;
color:#3d4759;
}

.summary-item strong{ font-family:'Kanit',sans-serif; font-size:20px; color:#12233f; }
.summary-item.good strong{ color:#2f8a4f; }
.summary-item.bad strong{ color:#c8102e; }

.summary-rank{
margin-top:24px;
display:flex;
flex-direction:column;
align-items:center;
gap:8px;
}

.rank-shield{
position:relative;
width:78px;
height:78px;
border-radius:50%;
display:flex;
align-items:center;
justify-content:center;
font-family:'Kanit',sans-serif;
font-size:42px;
font-weight:900;
color:#c8102e;
background:#fff8e7;
box-shadow:0 0 0 3px #c8102e, 0 8px 20px rgba(200,16,46,.25);
border:3px dashed #c8102e;
transform:rotate(-8deg);
}

.rank-text{ font-family:'Kanit',sans-serif; font-size:16px; font-weight:800; color:#12233f; }

.summary-flavor{
margin-top:16px;
font-size:14px;
line-height:1.6;
color:#3d4759;
}

.summary-buttons{
margin-top:24px;
display:grid;
grid-template-columns:1fr 1fr;
gap:14px;
}

.btn{
border:none;
border-radius:12px;
cursor:pointer;
color:#fff8e7;
font-family:'Kanit',sans-serif;
font-weight:700;
display:flex;
align-items:center;
justify-content:center;
gap:10px;
transition:.15s;
height:56px;
}

.btn:hover{ transform:translateY(2px); }

.btn div{ display:flex; flex-direction:column; align-items:flex-start; }
.btn span{ font-size:11px; opacity:.85; font-weight:500; }

.btn.blue{ background:linear-gradient(#1a3358,#0d1c33); box-shadow:0 6px 0 #060d1a; }
.btn.green{ background:linear-gradient(#e01b3e,#a30d28); box-shadow:0 6px 0 #6e0819; }
.btn.blue:hover, .btn.green:hover{ box-shadow:0 3px 0 #060d1a; }
.btn.green:hover{ box-shadow:0 3px 0 #6e0819; }

/* ───────── Trait bar: report-card ruler meter ───────── */
.trait{
width:100%;
text-align:left;
padding:10px 0;
}

.trait-top{
display:flex;
align-items:center;
justify-content:space-between;
}

.trait-name{
font-family:'Kanit',sans-serif;
font-weight:700;
font-size:14px;
color:#12233f;
}

.trait-score{
font-family:'Kanit',sans-serif;
font-weight:700;
font-size:13px;
color:#c8102e;
}

.trait-bar{
margin-top:6px;
height:10px;
border-radius:999px;
background:#e3d7ae;
border:1px solid #cdbf90;
overflow:hidden;
}

.trait-bar-fill{
height:100%;
border-radius:999px;
background:linear-gradient(90deg,#ffc72c,#c8102e);
transition:width .6s ease-out;
}

.trait-note{
margin-top:4px;
font-size:12px;
font-style:italic;
color:#5a6478;
}

@media(max-width:640px){
.school-map{ grid-template-columns:repeat(2,1fr); grid-template-rows:repeat(4,1fr); }
}
`;