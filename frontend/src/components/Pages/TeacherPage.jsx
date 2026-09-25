import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiUsers,
    FiActivity,
    FiClipboard,
    FiTrendingUp,
    FiClock,
    FiAward,
    FiSearch,
    FiDownload,
    FiSettings,
    FiLogOut,
    FiChevronUp,
    FiChevronDown,
    FiChevronRight,
    FiX,
    FiCheck,
    FiMinus,
    FiArrowUp,
    FiArrowDown,
} from "react-icons/fi";

import {
    getTeacherDashboard,
    getStudentProgress,
    getLevelPlayDetail,
} from "../services/teacherService";

// ============================================================
// Teacher Dashboard (ขั้นที่ 1)
// ------------------------------------------------------------
// - ขอบเขต: คณะของฉัน / ทั้งหมด
// - การ์ดสรุป + เทียบ Pre-Test / Post-Test
// - ตารางนิสิต: ค้นหา / กรอง / เรียง / Export CSV
// ============================================================

const STATUS = {
    no_pretest: { label: "ยังไม่ทำ Pre-Test", className: "bg-gray-100 text-gray-600" },
    not_started: { label: "ยังไม่เริ่มเล่น", className: "bg-blue-100 text-blue-700" },
    playing: { label: "กำลังเล่น", className: "bg-amber-100 text-amber-700" },
    completed: { label: "เล่นครบแล้ว", className: "bg-emerald-100 text-emerald-700" },
};

const COLUMNS = [
    { key: "name", label: "ชื่อ - นามสกุล", align: "left" },
    { key: "major_name", label: "สาขา", align: "left" },
    { key: "year", label: "ปี", align: "center" },
    { key: "status", label: "สถานะ", align: "left" },
    { key: "progress", label: "Progress", align: "left" },
    { key: "integrity_points", label: "IP", align: "right" },
    { key: "streak", label: "Streak", align: "right" },
    { key: "pre_test", label: "Pre", align: "right" },
    { key: "post_test", label: "Post", align: "right" },
    { key: "time_spent", label: "เวลาใช้งาน", align: "right" },
    { key: "last_active", label: "ใช้งานล่าสุด", align: "right" },
];

const ALIGN_CLASS = { left: "text-left", center: "text-center", right: "text-right" };

const fullName = (s) =>
    `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username;

const formatMinutes = (minutes) => {
    if (!minutes) return "-";
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h} ชม. ${m} น.` : `${m} น.`;
};

const formatDate = (key) => {
    if (!key) return "-";
    return new Date(`${key}T00:00:00`).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
    });
};

const percentText = (value) => (value === null || value === undefined ? "-" : `${value}%`);

// ------------------------------------------------------------
// Export CSV (ตามแถวที่กรองอยู่)
// ------------------------------------------------------------

const exportCsv = (rows) => {
    const header = [
        "username", "ชื่อ", "นามสกุล", "email", "คณะ", "สาขา", "ชั้นปี",
        "สถานะ", "Progress(%)", "ด่านที่ผ่าน", "IP", "Streak",
        "Pre-Test(%)", "Post-Test(%)", "จำนวนครั้งที่เล่น", "เวลาใช้งาน(นาที)", "ใช้งานล่าสุด",
    ];

    const lines = rows.map((r) => [
        r.username, r.first_name, r.last_name, r.email, r.faculty_name, r.major_name, r.year,
        STATUS[r.status]?.label, r.progress, `${r.passed_levels}/${r.total_levels}`,
        r.integrity_points, r.streak, r.pre_test ?? "", r.post_test ?? "",
        r.plays, r.time_spent,
        r.last_active_at ? new Date(r.last_active_at).toLocaleString("th-TH") : r.last_active ?? "",
    ]);

    const csv = [header, ...lines]
        .map((line) =>
            line.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    // \uFEFF ให้ Excel อ่านภาษาไทยถูก
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};

// ============================================================
// ชิ้นส่วน UI
// ============================================================

function StatCard({ icon: Icon, label, value, sub, color }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                    <Icon size={18} />
                </span>
                <p className="text-sm text-gray-500">{label}</p>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-800">{value}</p>
            {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
    );
}

function CompareBar({ label, value, color }) {
    return (
        <div>
            <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-600">{label}</span>
                <span className="font-semibold text-gray-800">{percentText(value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                <div
                    className={`h-full rounded-full ${color} transition-all`}
                    style={{ width: `${value ?? 0}%` }}
                />
            </div>
        </div>
    );
}

// ============================================================
// รายละเอียดนิสิต (สไลด์ลงมาใต้แถว)
// ------------------------------------------------------------
// รายบท → รายด่าน: สถานะ, คะแนนครั้งล่าสุด, คะแนนดีที่สุด,
// จำนวนครั้งที่เล่น, เล่นล่าสุดเมื่อไหร่
// ============================================================

const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const getLevelBadge = (level) => {
    if (level.state === "passed") {
        return level.status === "PERFECT"
            ? { label: "PERFECT", className: "bg-violet-100 text-violet-700" }
            : { label: "ผ่าน", className: "bg-emerald-100 text-emerald-700" };
    }
    if (level.state === "locked") {
        return { label: "ล็อก", className: "bg-gray-100 text-gray-400" };
    }
    if (level.times_played > 0) {
        return { label: "ยังไม่ผ่าน", className: "bg-amber-100 text-amber-700" };
    }
    return { label: "ยังไม่เล่น", className: "bg-blue-50 text-blue-600" };
};

// ============================================================
// การเข้าใช้งาน + ตัวกรองช่วงเวลา
// ------------------------------------------------------------
// วันนี้ / 7 วัน / 30 วัน / ทั้งหมด
//   - สรุป: เวลารวม, จำนวนครั้ง, เฉลี่ยต่อครั้ง, จำนวนวันที่เข้า
//   - รายการรอบการใช้งานในช่วงนั้น
// กรองฝั่งหน้าเว็บจาก sessions ที่ backend ส่งมา (เวลาไทยตามเครื่อง)
// ============================================================

const ACTIVITY_RANGES = [
    { key: "today", label: "วันนี้", days: 1 },
    { key: "week", label: "7 วันล่าสุด", days: 7 },
    { key: "month", label: "30 วันล่าสุด", days: 30 },
    { key: "all", label: "ทั้งหมด", days: null },
];

const dayKey = (value) => {
    const d = new Date(value);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

function ActivitySection({ activity }) {
    const [range, setRange] = useState("week");

    if (!activity) return null;

    const current = ACTIVITY_RANGES.find((r) => r.key === range);

    // จุดเริ่มของช่วง = เที่ยงคืนของ (วันนี้ - (days - 1))
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const rangeStart = current.days
        ? new Date(startOfToday.getTime() - (current.days - 1) * 24 * 60 * 60 * 1000)
        : null;

    const sessions = activity.sessions.filter(
        (s) => !rangeStart || new Date(s.started_at) >= rangeStart
    );

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.active_minutes || 0), 0);
    const activeDays = new Set(sessions.map((s) => dayKey(s.started_at))).size;
    const avgPerSession = sessions.length ? Math.round(totalMinutes / sessions.length) : 0;

    const timeText = (value) =>
        new Date(value).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });

    const dateText = (value) =>
        new Date(value).toLocaleDateString("th-TH", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });

    return (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            {/* หัว + ตัวกรอง */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-gray-800">การเข้าใช้งาน</p>

                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-emerald-500"
                >
                    {ACTIVITY_RANGES.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* สรุปของช่วงที่เลือก */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-emerald-50 px-3 py-2">
                    <p className="text-[11px] text-emerald-600">เวลาใช้งานรวม</p>
                    <p className="text-base font-bold text-emerald-700">{formatMinutes(totalMinutes)}</p>
                </div>
                <div className="rounded-lg bg-sky-50 px-3 py-2">
                    <p className="text-[11px] text-sky-600">จำนวนครั้ง</p>
                    <p className="text-base font-bold text-sky-700">{sessions.length} ครั้ง</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-[11px] text-gray-500">เฉลี่ยต่อครั้ง</p>
                    <p className="text-base font-bold text-gray-800">{formatMinutes(avgPerSession)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2">
                    <p className="text-[11px] text-gray-500">จำนวนวันที่เข้า</p>
                    <p className="text-base font-bold text-gray-800">
                        {activeDays}
                        {current.days ? ` / ${current.days}` : ""} วัน
                    </p>
                </div>
            </div>

            {/* รายการรอบการใช้งาน */}
            {sessions.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">
                    ไม่มีการเข้าใช้งานในช่วงนี้
                </p>
            ) : (
                <div className="mt-3 max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-white text-gray-400">
                            <tr>
                                <th className="py-1 text-left font-medium">วันที่</th>
                                <th className="py-1 text-left font-medium">ช่วงเวลา</th>
                                <th className="py-1 text-right font-medium">ใช้งานจริง</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {sessions.map((session) => (
                                <tr key={session.session_id}>
                                    <td className="py-2 text-gray-700">{dateText(session.started_at)}</td>
                                    <td className="py-2 text-gray-600">
                                        {timeText(session.started_at)} –{" "}
                                        {session.is_online ? (
                                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                กำลังใช้งาน
                                            </span>
                                        ) : (
                                            timeText(session.ended_at || session.last_seen_at)
                                        )}
                                    </td>
                                    <td className="py-2 text-right font-semibold text-gray-800">
                                        {formatMinutes(session.active_minutes)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="mt-2 text-[11px] text-gray-400">
                นับเฉพาะนาทีที่เปิดหน้าเกมอยู่และมีการใช้งาน (เปิดทิ้งไว้เฉย ๆ ไม่นับ)
            </p>
        </div>
    );
}

// ============================================================
// เปลี่ยนแปลง IP: ครั้งแรก → ล่าสุด
// ============================================================

function IpChange({ first, last }) {
    if (first === null || first === undefined || last === null || last === undefined) {
        return null;
    }

    const diff = last - first;

    if (diff === 0) {
        return <span className="text-[10px] text-gray-400">เท่าเดิม</span>;
    }

    const up = diff > 0;

    return (
        <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${up ? "text-emerald-600" : "text-red-500"
                }`}
        >
            {up ? <FiArrowUp /> : <FiArrowDown />}
            {up ? "+" : ""}
            {diff}
        </span>
    );
}

// ============================================================
// Popup: คำตอบของนิสิตในรอบล่าสุดของด่าน
// ============================================================

const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m ? `${m} นาที ${s} วินาที` : `${s} วินาที`;
};

function ResultIcon({ value }) {
    if (value === true) {
        return (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FiCheck size={14} strokeWidth={3} />
            </span>
        );
    }
    if (value === false) {
        return (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500">
                <FiX size={14} strokeWidth={3} />
            </span>
        );
    }
    return (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <FiMinus size={14} strokeWidth={3} />
        </span>
    );
}

function LevelAnswersModal({ userId, studentName, level, onClose }) {
    const [state, setState] = useState({ loading: true });

    useEffect(() => {
        let isMounted = true;

        getLevelPlayDetail(userId, level.level_id)
            .then((data) => isMounted && setState({ data }))
            .catch(
                (err) =>
                    isMounted &&
                    setState({ error: err.message || "โหลดคำตอบไม่สำเร็จ" })
            );

        return () => {
            isMounted = false;
        };
    }, [userId, level.level_id]);

    // ปิดด้วย Esc
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const play = state.data?.play;
    const sections = state.data?.sections || [];
    const treasurer = state.data?.treasurer;

    const totalRows = sections.reduce((n, s) => n + s.rows.length, 0);
    const correctRows = sections.reduce(
        (n, s) => n + s.rows.filter((r) => r.is_correct === true).length,
        0
    );
    const wrongRows = sections.reduce(
        (n, s) => n + s.rows.filter((r) => r.is_correct === false).length,
        0
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* หัว popup */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5">
                    <div>
                        <p className="text-xs text-gray-400">{studentName} · คำตอบรอบล่าสุด</p>
                        <h3 className="text-lg font-bold text-gray-800">
                            ด่าน {level.order_no}
                            {level.title ? ` · ${level.title}` : ""}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5">
                    {state.loading && (
                        <p className="py-10 text-center text-sm text-gray-400">กำลังโหลดคำตอบ...</p>
                    )}

                    {state.error && (
                        <p className="py-10 text-center text-sm text-red-500">{state.error}</p>
                    )}

                    {state.data && !play && (
                        <p className="py-10 text-center text-sm text-gray-400">
                            นิสิตยังไม่เคยเล่นด่านนี้จนจบ
                        </p>
                    )}

                    {play && (
                        <>
                            {/* สรุปรอบนี้ */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-[11px] text-gray-400">เล่นเมื่อ</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {formatDateTime(play.completed_at)}
                                    </p>
                                    <p className="text-[11px] text-gray-400">ครั้งที่ {play.attempt_number}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-[11px] text-gray-400">ผล</p>
                                    <p className="text-sm font-semibold text-gray-800">{play.status}</p>
                                    <p className="text-[11px] text-gray-400">
                                        คะแนน {play.score}/{play.max_score}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 p-3">
                                    <p className="text-[11px] text-emerald-600">IP รอบนี้</p>
                                    <p className="text-sm font-bold text-emerald-700">{play.earned_ip}</p>
                                </div>
                                <div className="rounded-xl bg-gray-50 p-3">
                                    <p className="text-[11px] text-gray-400">ใช้เวลา</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {formatDuration(play.duration_seconds)}
                                    </p>
                                </div>
                            </div>

                            {totalRows > 0 && (
                                <p className="mt-3 text-xs text-gray-500">
                                    ถูก <b className="text-emerald-600">{correctRows}</b> · ผิด{" "}
                                    <b className="text-red-500">{wrongRows}</b> จาก {totalRows} รายการ
                                </p>
                            )}

                            {/* สรุปของ Treasurer (Unit 3 Final) */}
                            {treasurer && (
                                <div className="mt-4 rounded-xl border border-gray-200 p-3 text-sm">
                                    <p className="font-semibold text-gray-800">
                                        เกรด {treasurer.grade || "-"} ·{" "}
                                        {treasurer.success ? "ภารกิจสำเร็จ" : "ภารกิจไม่สำเร็จ"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        ใช้เงิน {Number(treasurer.spent_amount).toLocaleString()} บาท · คงเหลือ{" "}
                                        {Number(treasurer.final_balance).toLocaleString()} บาท
                                    </p>
                                    {(treasurer.fail_reason || treasurer.feedback) && (
                                        <p className="mt-1 text-xs text-gray-500">
                                            {treasurer.fail_reason || treasurer.feedback}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* คำตอบแต่ละส่วน */}
                            {sections.length === 0 && (
                                <p className="py-8 text-center text-sm text-gray-400">
                                    ด่านนี้ไม่มีรายละเอียดคำตอบที่บันทึกไว้
                                </p>
                            )}

                            {sections.map((section) => (
                                <div key={section.key} className="mt-5">
                                    <p className="mb-2 text-sm font-semibold text-gray-700">
                                        {section.title}
                                    </p>

                                    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200">
                                        {section.rows.map((row, index) => (
                                            <li key={index} className="flex gap-3 p-3">
                                                <ResultIcon value={row.is_correct} />

                                                <div className="min-w-0 flex-1 text-sm">
                                                    <p className="font-medium text-gray-800">{row.title}</p>
                                                    <p className="mt-0.5 text-gray-600">
                                                        ตอบ:{" "}
                                                        <span
                                                            className={
                                                                row.is_correct === false
                                                                    ? "font-semibold text-red-500"
                                                                    : "font-semibold text-gray-800"
                                                            }
                                                        >
                                                            {row.answer}
                                                        </span>
                                                    </p>
                                                    {row.correct_answer && (
                                                        <p className="text-emerald-700">
                                                            คำตอบที่ถูก: <b>{row.correct_answer}</b>
                                                        </p>
                                                    )}
                                                    {row.note && (
                                                        <p className="mt-0.5 text-xs text-gray-400">{row.note}</p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function StudentDetail({ detail, userId, studentName }) {
    const [openLevel, setOpenLevel] = useState(null);
    if (!detail || detail.loading) {
        return <p className="py-6 text-center text-sm text-gray-400">กำลังโหลดรายละเอียด...</p>;
    }

    if (detail.error) {
        return <p className="py-6 text-center text-sm text-red-500">{detail.error}</p>;
    }

    const units = detail.data.units.filter((u) => u.status !== "coming_soon");
    const comingSoon = detail.data.units.length - units.length;

    return (
        <div>
            <div className="grid gap-4 lg:grid-cols-3">
                {units.map((unit) => (
                    <div key={unit.unit_id} className="rounded-xl border border-gray-200 bg-white p-4">
                        {/* หัวบท */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400">บทที่ {unit.order_number}</p>
                                <p className="truncate font-semibold text-gray-800">
                                    {unit.name_th || unit.name_en}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-lg font-bold text-emerald-600">{unit.percent}%</p>
                                <p className="text-[11px] text-gray-400">
                                    ผ่าน {unit.passed_levels}/{unit.total_levels}
                                </p>
                            </div>
                        </div>

                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${unit.percent}%` }}
                            />
                        </div>

                        {/* ตารางรายด่าน */}
                        <table className="mt-3 w-full text-xs">
                            <thead className="text-gray-400">
                                <tr>
                                    <th className="py-1 text-left font-medium">ด่าน</th>
                                    <th className="py-1 text-right font-medium">ครั้งแรก</th>
                                    <th className="py-1 text-right font-medium">ล่าสุด</th>
                                    <th className="py-1 text-right font-medium">ดีที่สุด</th>
                                    <th className="py-1 text-right font-medium">เล่น</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {unit.levels.map((level) => {
                                    const badge = getLevelBadge(level);

                                    return (
                                        <tr
                                            key={level.level_id}
                                            onClick={() => level.times_played && setOpenLevel(level)}
                                            title={level.times_played ? "กดเพื่อดูคำตอบรอบล่าสุด" : undefined}
                                            className={`align-top ${level.times_played
                                                    ? "cursor-pointer hover:bg-emerald-50"
                                                    : ""
                                                }`}
                                        >
                                            <td className="py-2 pr-2">
                                                <p className="font-medium text-gray-700">
                                                    ด่าน {level.order_no}
                                                    {level.title ? ` · ${level.title}` : ""}
                                                    {level.times_played > 0 && (
                                                        <FiChevronRight className="ml-0.5 inline text-gray-300" />
                                                    )}
                                                </p>
                                                <div className="mt-1 flex items-center gap-1.5">
                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                                                        {badge.label}
                                                    </span>
                                                    {level.last_played && (
                                                        <span className="text-[10px] text-gray-400">
                                                            {formatDateTime(level.last_played)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2 text-right text-gray-600">
                                                {level.first_ip ?? "-"}
                                            </td>
                                            <td className="py-2 text-right text-gray-600">
                                                <p>{level.last_ip ?? "-"}</p>
                                                {level.times_played > 1 && (
                                                    <IpChange first={level.first_ip} last={level.last_ip} />
                                                )}
                                            </td>
                                            <td className="py-2 text-right font-semibold text-gray-800">
                                                {level.times_played ? level.best_ip : "-"}
                                            </td>
                                            <td className="py-2 text-right text-gray-600">
                                                {level.times_played ? `${level.times_played} ครั้ง` : "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <p className="mt-2 border-t border-gray-100 pt-2 text-right text-xs text-gray-500">
                            IP ดีที่สุดรวมบทนี้{" "}
                            <span className="font-semibold text-gray-800">{unit.total_best_ip}</span>
                        </p>
                    </div>
                ))}
            </div>

            <p className="mt-3 text-xs text-gray-400">
                คะแนนเป็น IP (Integrity Points) · "ครั้งแรก" / "ล่าสุด" = รอบแรก / รอบล่าสุดที่เล่นจบ
                (ลูกศรบอกว่าดีขึ้นหรือแย่ลง) · "ดีที่สุด" = คะแนนที่นับรวมใน IP · กดที่ด่านเพื่อดูคำตอบรอบล่าสุด
                {comingSoon > 0 && ` · อีก ${comingSoon} บทยังไม่เปิดให้เล่น`}
            </p>

            <ActivitySection activity={detail.data.activity} />

            {openLevel && (
                <LevelAnswersModal
                    userId={userId}
                    studentName={studentName}
                    level={openLevel}
                    onClose={() => setOpenLevel(null)}
                />
            )}
        </div>
    );
}

// ============================================================
// Page
// ============================================================

export default function TeacherPage() {
    const navigate = useNavigate();

    const [scope, setScope] = useState("faculty");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [majorFilter, setMajorFilter] = useState("");
    const [yearFilter, setYearFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sort, setSort] = useState({ key: "integrity_points", dir: "desc" });

    // แถวที่เปิดดูรายละเอียด + cache ข้อมูลที่โหลดแล้ว
    const [expandedId, setExpandedId] = useState(null);
    const [details, setDetails] = useState({});

    const toggleRow = (userId) => {
        const opening = expandedId !== userId;
        setExpandedId(opening ? userId : null);

        if (!opening || details[userId]?.data) return;

        setDetails((prev) => ({ ...prev, [userId]: { loading: true } }));

        getStudentProgress(userId)
            .then((data) =>
                setDetails((prev) => ({ ...prev, [userId]: { data } }))
            )
            .catch((err) =>
                setDetails((prev) => ({
                    ...prev,
                    [userId]: { error: err.message || "โหลดรายละเอียดไม่สำเร็จ" },
                }))
            );
    };

    // --------------------------------------------------------
    // โหลดข้อมูล (โหลดใหม่เมื่อเปลี่ยนขอบเขต)
    // --------------------------------------------------------

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/", { replace: true });
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError("");

        getTeacherDashboard(scope)
            .then((result) => {
                if (!isMounted) return;
                setData(result);
                setMajorFilter("");
                setExpandedId(null);
                setDetails({});
            })
            .catch((err) => {
                console.error("Load teacher dashboard error:", err);
                if (!isMounted) return;

                if (err.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/", { replace: true });
                    return;
                }

                // 403 = ไม่ใช่อาจารย์ → กลับหน้าแผนที่
                if (err.status === 403) {
                    navigate("/map", { replace: true });
                    return;
                }

                setError(err.message || "โหลดข้อมูลไม่สำเร็จ");
            })
            .finally(() => isMounted && setLoading(false));

        return () => {
            isMounted = false;
        };
    }, [scope, navigate]);

    const students = useMemo(() => data?.students || [], [data]);
    const summary = data?.summary;
    const teacher = data?.teacher;

    // ตัวเลือกสาขา / ชั้นปี จากข้อมูลที่มีจริง
    const majorOptions = useMemo(() => {
        const map = new Map();
        students.forEach((s) => map.set(s.major_id, s.major_name));
        return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "th"));
    }, [students]);

    const yearOptions = useMemo(
        () => [...new Set(students.map((s) => s.year).filter(Boolean))].sort(),
        [students]
    );

    // --------------------------------------------------------
    // กรอง + เรียง
    // --------------------------------------------------------

    const visibleRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        const filtered = students.filter((s) => {
            if (majorFilter && String(s.major_id) !== majorFilter) return false;
            if (yearFilter && String(s.year) !== yearFilter) return false;
            if (statusFilter && s.status !== statusFilter) return false;

            if (keyword) {
                const text = `${fullName(s)} ${s.username} ${s.email}`.toLowerCase();
                if (!text.includes(keyword)) return false;
            }

            return true;
        });

        const getValue = (row) =>
            sort.key === "name" ? fullName(row) : row[sort.key];

        return filtered.sort((a, b) => {
            const va = getValue(a);
            const vb = getValue(b);

            // ค่าว่างไปท้ายเสมอ
            if (va === null || va === undefined) return 1;
            if (vb === null || vb === undefined) return -1;

            const result =
                typeof va === "number"
                    ? va - vb
                    : String(va).localeCompare(String(vb), "th");

            return sort.dir === "asc" ? result : -result;
        });
    }, [students, search, majorFilter, yearFilter, statusFilter, sort]);

    const toggleSort = (key) =>
        setSort((prev) =>
            prev.key === key
                ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { key, dir: key === "name" || key === "major_name" ? "asc" : "desc" }
        );

    // --------------------------------------------------------
    // Logout
    // --------------------------------------------------------

    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        try {
            if (token) {
                await fetch("http://localhost:5000/api/auth/logout", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/");
        }
    };

    const gain =
        summary?.avg_pre_test !== null && summary?.avg_post_test !== null && summary
            ? summary.avg_post_test - summary.avg_pre_test
            : null;

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="fixed inset-0 overflow-y-auto bg-slate-100">
            {/* ================= TOP BAR ================= */}
            <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
                    <div>
                        <h1 className="text-xl font-bold text-emerald-700">
                            Integrity Quest · แดชบอร์ดอาจารย์
                        </h1>
                        {teacher && (
                            <p className="text-sm text-gray-500">
                                {teacher.position} {teacher.name}
                                {teacher.dept_name && ` · ${teacher.dept_name}`}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/settings")}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                            <FiSettings />
                            ตั้งค่าบัญชี
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                        >
                            <FiLogOut />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl space-y-6 p-6">
                {/* ================= SCOPE ================= */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex rounded-xl bg-white p-1 shadow-sm">
                        {[
                            {
                                key: "faculty",
                                label: `คณะของฉัน${teacher?.faculty_name ? ` (${teacher.faculty_name})` : ""}`,
                            },
                            { key: "all", label: "นิสิตทั้งหมด" },
                        ].map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setScope(option.key)}
                                disabled={option.key === "faculty" && data && !teacher?.faculty_id}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${scope === option.key
                                    ? "bg-emerald-600 text-white shadow"
                                    : "text-gray-600 hover:bg-gray-50"
                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    {loading && data && (
                        <span className="text-sm text-gray-400">กำลังโหลด...</span>
                    )}
                </div>

                {loading && !data && (
                    <p className="py-24 text-center text-gray-500">กำลังโหลดข้อมูล...</p>
                )}

                {error && (
                    <p className="rounded-xl bg-red-50 p-4 text-center text-red-600">{error}</p>
                )}

                {summary && (
                    <>
                        {/* ================= การ์ดสรุป ================= */}
                        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                            <StatCard
                                icon={FiUsers}
                                label="นิสิตทั้งหมด"
                                value={summary.total_students}
                                sub={`เล่นครบทุกด่าน ${summary.completed_all} คน`}
                                color="bg-emerald-100 text-emerald-700"
                            />
                            <StatCard
                                icon={FiActivity}
                                label="ใช้งานใน 7 วัน"
                                value={summary.active_7_days}
                                sub={`จาก ${summary.total_students} คน`}
                                color="bg-sky-100 text-sky-700"
                            />
                            <StatCard
                                icon={FiClipboard}
                                label="ทำ Pre / Post-Test"
                                value={`${summary.pre_test_done} / ${summary.post_test_done}`}
                                sub="จำนวนคน"
                                color="bg-violet-100 text-violet-700"
                            />
                            <StatCard
                                icon={FiTrendingUp}
                                label="Progress เฉลี่ย"
                                value={`${summary.avg_progress}%`}
                                sub="ภาพรวมทุกบท"
                                color="bg-amber-100 text-amber-700"
                            />
                            <StatCard
                                icon={FiAward}
                                label="IP เฉลี่ย"
                                value={summary.avg_integrity_points}
                                sub="Integrity Points"
                                color="bg-yellow-100 text-yellow-700"
                            />
                            <StatCard
                                icon={FiClock}
                                label="เวลาใช้งานเฉลี่ย"
                                value={formatMinutes(summary.avg_time_spent)}
                                sub="ต่อคน · นับเฉพาะตอนใช้งานจริง"
                                color="bg-rose-100 text-rose-700"
                            />
                        </section>

                        {/* ================= PRE vs POST ================= */}
                        <section className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    ผลประเมินตนเอง ก่อน - หลังเล่น
                                </h2>
                                <p className="mb-5 text-xs text-gray-400">
                                    เฉลี่ยจากนิสิตที่ทำครบทั้ง Pre-Test และ Post-Test ({summary.paired_count} คน)
                                    · ข้อเชิงลบกลับคะแนนแล้ว
                                </p>

                                {summary.paired_count === 0 ? (
                                    <p className="py-6 text-center text-sm text-gray-400">
                                        ยังไม่มีนิสิตที่ทำ Post-Test
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        <CompareBar label="Pre-Test" value={summary.avg_pre_test} color="bg-gray-400" />
                                        <CompareBar label="Post-Test" value={summary.avg_post_test} color="bg-emerald-500" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-center rounded-2xl bg-white p-6 text-center shadow-sm">
                                <p className="text-sm text-gray-500">เปลี่ยนแปลงเฉลี่ย</p>
                                <p
                                    className={`mt-2 text-5xl font-bold ${gain === null
                                        ? "text-gray-300"
                                        : gain >= 0
                                            ? "text-emerald-600"
                                            : "text-red-500"
                                        }`}
                                >
                                    {gain === null ? "-" : `${gain > 0 ? "+" : ""}${gain}%`}
                                </p>
                                <p className="mt-2 text-xs text-gray-400">Post-Test เทียบกับ Pre-Test</p>
                            </div>
                        </section>

                        {/* ================= ตารางนิสิต ================= */}
                        <section className="rounded-2xl bg-white shadow-sm">
                            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                                <h2 className="mr-auto text-lg font-semibold text-gray-800">
                                    รายชื่อนิสิต
                                    <span className="ml-2 text-sm font-normal text-gray-400">
                                        {visibleRows.length} คน
                                    </span>
                                </h2>

                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="ค้นหาชื่อ / username / email"
                                        className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>

                                <select
                                    value={majorFilter}
                                    onChange={(e) => setMajorFilter(e.target.value)}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="">ทุกสาขา</option>
                                    {majorOptions.map(([id, name]) => (
                                        <option key={id} value={id}>{name}</option>
                                    ))}
                                </select>

                                <select
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="">ทุกชั้นปี</option>
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y}>ปี {y}</option>
                                    ))}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                                >
                                    <option value="">ทุกสถานะ</option>
                                    {Object.entries(STATUS).map(([key, s]) => (
                                        <option key={key} value={key}>{s.label}</option>
                                    ))}
                                </select>

                                <button
                                    type="button"
                                    onClick={() => exportCsv(visibleRows)}
                                    disabled={visibleRows.length === 0}
                                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                                >
                                    <FiDownload />
                                    Export CSV
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[1100px] text-sm">
                                    <thead className="bg-gray-50 text-xs text-gray-500">
                                        <tr>
                                            {COLUMNS.map((col) => (
                                                <th
                                                    key={col.key}
                                                    onClick={() => toggleSort(col.key)}
                                                    className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 font-medium hover:text-gray-800 ${ALIGN_CLASS[col.align]}`}
                                                >
                                                    <span className="inline-flex items-center gap-1">
                                                        {col.label}
                                                        {sort.key === col.key &&
                                                            (sort.dir === "asc" ? <FiChevronUp /> : <FiChevronDown />)}
                                                    </span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visibleRows.length === 0 && (
                                            <tr>
                                                <td colSpan={COLUMNS.length} className="py-12 text-center text-gray-400">
                                                    ไม่พบนิสิตตามเงื่อนไข
                                                </td>
                                            </tr>
                                        )}

                                        {visibleRows.map((s) => {
                                            const isOpen = expandedId === s.user_id;

                                            return (
                                                <Fragment key={s.user_id}>
                                                    <tr
                                                        onClick={() => toggleRow(s.user_id)}
                                                        className={`cursor-pointer border-t border-gray-100 transition ${isOpen ? "bg-emerald-50/60" : "hover:bg-emerald-50/40"
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <FiChevronRight
                                                                    className={`shrink-0 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-90 text-emerald-600" : ""
                                                                        }`}
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-gray-800">{fullName(s)}</p>
                                                                    <p className="text-xs text-gray-400">{s.username}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            <p>{s.major_name}</p>
                                                            {scope === "all" && (
                                                                <p className="text-xs text-gray-400">{s.faculty_name}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-gray-600">{s.year || "-"}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS[s.status].className}`}>
                                                                {STATUS[s.status].label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-2 w-20 overflow-hidden rounded-full bg-gray-100">
                                                                    <div
                                                                        className="h-full rounded-full bg-emerald-500"
                                                                        style={{ width: `${s.progress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-xs text-gray-600">{s.progress}%</span>
                                                            </div>
                                                            <p className="mt-0.5 text-[11px] text-gray-400">
                                                                ผ่าน {s.passed_levels}/{s.total_levels} ด่าน
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-semibold text-gray-800">{s.integrity_points}</td>
                                                        <td className="px-4 py-3 text-right text-gray-600">
                                                            {s.streak ? `🔥 ${s.streak}` : "-"}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-600">{percentText(s.pre_test)}</td>
                                                        <td className="px-4 py-3 text-right text-gray-600">{percentText(s.post_test)}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">{formatMinutes(s.time_spent)}</td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-right text-gray-600">
                                                            <p>{formatDate(s.last_active)}</p>
                                                            {s.last_active_at && (
                                                                <p className="text-[11px] text-gray-400">
                                                                    {new Date(s.last_active_at).toLocaleTimeString("th-TH", {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    })}{" "}
                                                                    น.
                                                                </p>
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* แถวรายละเอียด: สไลด์ลงมาเมื่อกด */}
                                                    <tr>
                                                        <td colSpan={COLUMNS.length} className="p-0">
                                                            <div
                                                                className={`grid transition-all duration-300 ease-out ${isOpen
                                                                    ? "grid-rows-[1fr] opacity-100"
                                                                    : "grid-rows-[0fr] opacity-0"
                                                                    }`}
                                                            >
                                                                <div className="overflow-hidden">
                                                                    <div className="bg-emerald-50/60 px-6 pb-5 pt-1">
                                                                        {(isOpen || details[s.user_id]) && (
                                                                            <StudentDetail
                                                                                detail={details[s.user_id]}
                                                                                userId={s.user_id}
                                                                                studentName={fullName(s)}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </Fragment>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}