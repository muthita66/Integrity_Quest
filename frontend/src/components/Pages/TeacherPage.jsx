import { BASE_URL } from "../../config";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiSearch,
    FiDownload,
    FiSettings,
    FiChevronUp,
    FiChevronDown,
    FiChevronRight,
    FiMinus,
    FiArrowUp,
    FiArrowDown,
    FiPlus,
    FiMoreVertical,
    FiTrash2,
    FiStar,
} from "react-icons/fi";

import {
    getTeacherDashboard,
    getStudentProgress,
    deleteTeacherGroup,
    deleteStudent,
} from "../services/teacherService";
import { getFaculties } from "../services/masterService";
import bgGame from "../../assets/bg_game.png";

// Popup/modal ของหน้าอาจารย์ แยกออกไปอยู่ในโฟลเดอร์ components/ ที่อยู่ข้างๆ
// ไฟล์นี้ (src/pages/teacher/components/) — TeacherPage.jsx เองยังอยู่ที่เดิม
import LevelAnswersModal from "./components/LevelAnswersModal";
import AddGroupModal from "./components/AddGroupModal";
import DeleteStudentModal from "./components/DeleteStudentModal";
import { formatDateTime } from "./components/teacherFormatters";

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
const BREAKDOWN_META = {
    improved: {
        label: "ดีขึ้น",
        icon: FiArrowUp,
        badgeClass: "bg-emerald-50 text-emerald-700",
        ringClass: "ring-emerald-300",
    },
    same: {
        label: "เท่าเดิม",
        icon: FiMinus,
        badgeClass: "bg-gray-100 text-gray-500",
        ringClass: "ring-gray-300",
    },
    declined: {
        label: "แย่ลง",
        icon: FiArrowDown,
        badgeClass: "bg-red-50 text-red-600",
        ringClass: "ring-red-300",
    },
};

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

    // ﻿ ให้ Excel อ่านภาษาไทยถูก
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};
function StatCard({ label, value, sub, layout = "split", tone = "text-gray-800" }) {
    if (layout === "center") {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-5 text-center shadow-sm">
                <p className="text-lg font-bold text-gray-900">{label}</p>
                <p className={`mt-1 text-5xl font-extrabold leading-tight ${tone}`}>{value}</p>
                {sub && <p className="mt-1 text-xs font-semibold text-gray-400">{sub}</p>}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-lg font-bold leading-tight text-gray-900">{label}</p>
            <div className="text-right">
                <p className={`text-4xl font-extrabold leading-tight ${tone}`}>{value}</p>
                {sub && <p className="mt-0.5 text-xs font-semibold text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}

// การ์ดที่มีกล่องย่อย 2 ช่องซ้อนข้างใน (Pre-test / Post-test)
function PairStatCard({ label, items, sub }) {
    return (
        <div className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-lg font-bold text-gray-900">{label}</p>
            <div className="mt-2 grid w-full grid-cols-2 gap-3">
                {items.map((item) => (
                    <div key={item.label} className="rounded-2xl bg-gray-50 px-3 py-2">
                        <p className="text-sm font-bold text-gray-900">{item.label}</p>
                        <p className="text-3xl font-extrabold leading-tight text-gray-800">{item.value}</p>
                    </div>
                ))}
            </div>
            {sub && <p className="mt-2 text-xs font-semibold text-gray-400">{sub}</p>}
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

export default function TeacherPage() {
    const navigate = useNavigate();
    const [scope, setScope] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [faculties, setFaculties] = useState([]);
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sort, setSort] = useState({ key: "integrity_points", dir: "desc" });
    const [expandedId, setExpandedId] = useState(null);
    const [details, setDetails] = useState({});
    const [breakdownView, setBreakdownView] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [deletingStudent, setDeletingStudent] = useState(false);
    const [deleteStudentError, setDeleteStudentError] = useState("");

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

    useEffect(() => {
        getFaculties()
            .then(setFaculties)
            .catch((err) => console.log(err));
    }, []);

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/", { replace: true });
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError("");

        getTeacherDashboard(scope || undefined)
            .then((result) => {
                if (!isMounted) return;
                setData(result);
                if (!scope) setScope(result.scope);
                setExpandedId(null);
                setDetails({});
                setBreakdownView(null);
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
    const groups = data?.groups || [];
    const activeScope = scope || data?.scope || "all";
    const activeGroup =
        groups.find((g) => activeScope === `group:${g.group_id}`) || null;
    const summary = data?.summary;
    const teacher = data?.teacher;

    const handleGroupAdded = (newGroup) => {
        setShowAddGroup(false);
        setScope(`group:${newGroup.group_id}`);
    };

    const [groupMenuOpen, setGroupMenuOpen] = useState(false);
    const [deletingGroup, setDeletingGroup] = useState(false);
    const groupMenuRef = useRef(null);

    useEffect(() => {
        if (!groupMenuOpen) return;

        const onClickOutside = (e) => {
            if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) {
                setGroupMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [groupMenuOpen]);

    const handleDeleteGroup = async () => {
        if (!activeGroup) return;

        if (!window.confirm(`ลบ "${activeGroup.label}" ใช่หรือไม่? ย้อนกลับไม่ได้`)) {
            return;
        }

        setDeletingGroup(true);

        try {
            await deleteTeacherGroup(activeGroup.group_id);
            setGroupMenuOpen(false);
            // ให้ backend เลือกกลุ่มที่เหลือ (หรือ "นิสิตทั้งหมด" ถ้าไม่เหลือเลย) ให้เอง
            setScope(null);
        } catch (err) {
            alert(err.message || "ลบกลุ่มไม่สำเร็จ");
        } finally {
            setDeletingGroup(false);
        }
    };

    const handleConfirmDeleteStudent = async () => {
        if (!studentToDelete) return;

        setDeletingStudent(true);
        setDeleteStudentError("");

        try {
            await deleteStudent(studentToDelete.user_id);

            // ตัดนิสิตที่ลบแล้วออกจากรายการที่แสดงอยู่ทันที โดยไม่ต้องรอโหลดใหม่ทั้งหน้า
            setData((prev) =>
                prev
                    ? {
                        ...prev,
                        students: prev.students.filter(
                            (s) => s.user_id !== studentToDelete.user_id
                        ),
                    }
                    : prev
            );
            setExpandedId((prev) => (prev === studentToDelete.user_id ? null : prev));
            setStudentToDelete(null);
        } catch (err) {
            setDeleteStudentError(err.message || "ลบข้อมูลนิสิตไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setDeletingStudent(false);
        }
    };

    const visibleRows = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        const filtered = students.filter((s) => {
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
    }, [students, search, statusFilter, sort]);

    const toggleSort = (key) =>
        setSort((prev) =>
            prev.key === key
                ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
                : { key, dir: key === "name" || key === "major_name" ? "asc" : "desc" }
        );

    const handleLogout = async () => {
        const token = localStorage.getItem("token");

        try {
            if (token) {
                await fetch(`${BASE_URL}/api/auth/logout`, {
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

    const gainLabel = (g) => {
        if (g === null || g === undefined) return "";
        if (g < 0.3) return "พัฒนาการต่ำ (Low gain)";
        if (g < 0.7) return "พัฒนาการปานกลาง (Medium gain)";
        return "พัฒนาการสูง (High gain)";
    };

    return (
        <div
            className="fixed inset-0 overflow-y-auto bg-slate-100 bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(241, 245, 249, 0.35), rgba(241, 245, 249, 0.35)), url(${bgGame})`,
                backgroundAttachment: "fixed",
            }}
        >
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
                        {/* ปุ่ม Logout แบบ Uiverse (สไตล์อยู่ใน styles/button.css → .Btn) */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="Btn"
                            title="ออกจากระบบ"
                            aria-label="Logout"
                        >
                            <div className="sign">
                                <svg viewBox="0 0 512 512">
                                    <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
                                </svg>
                            </div>
                            <div className="text">Logout</div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto my-6 w-[calc(100%-2rem)] max-w-7xl space-y-6 rounded-3xl border border-white/50 bg-white/30 p-6 shadow-xl backdrop-blur-md">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex flex-wrap rounded-xl bg-white p-1 shadow-sm">
                                {groups.map((g) => (
                                    <button
                                        key={g.group_id}
                                        type="button"
                                        onClick={() => setScope(`group:${g.group_id}`)}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeScope === `group:${g.group_id}`
                                            ? "bg-emerald-600 text-white shadow"
                                            : "text-gray-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    onClick={() => setScope("all")}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeScope === "all"
                                        ? "bg-emerald-600 text-white shadow"
                                        : "text-gray-600 hover:bg-gray-50"
                                        }`}
                                >
                                    นิสิตทั้งหมด
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowAddGroup(true)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-400 bg-white/70 px-3 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                                <FiPlus />
                                เพิ่มกลุ่ม
                            </button>
                        </div>

                        {loading && data && (
                            <span className="text-sm text-gray-400">กำลังโหลด...</span>
                        )}
                    </div>
                    {activeGroup && (
                        <div className="flex items-start justify-between gap-3 rounded-xl bg-white/60 px-3 py-2">
                            <p className="text-sm text-gray-600">
                                คณะ:{" "}
                                <span className="font-semibold text-gray-800">
                                    {activeGroup.faculty_name || "ทุกคณะ"}
                                </span>
                                {" · "}สาขา:{" "}
                                <span className="font-semibold text-gray-800">
                                    {activeGroup.major_name || "ทุกสาขา"}
                                </span>
                                {" · "}ชั้นปี:{" "}
                                <span className="font-semibold text-gray-800">
                                    {activeGroup.year ? `ปี ${activeGroup.year}` : "ทุกชั้นปี"}
                                </span>
                                {activeGroup.note && (
                                    <>
                                        {" · "}
                                        {activeGroup.note}
                                    </>
                                )}
                            </p>

                            <div className="relative shrink-0" ref={groupMenuRef}>
                                <button
                                    type="button"
                                    onClick={() => setGroupMenuOpen((prev) => !prev)}
                                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                    aria-label="ตัวเลือกเพิ่มเติมของกลุ่มนี้"
                                >
                                    <FiMoreVertical size={16} />
                                </button>

                                {groupMenuOpen && (
                                    <div className="absolute right-0 top-full z-10 mt-1 w-40 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-lg">
                                        <button
                                            type="button"
                                            onClick={handleDeleteGroup}
                                            disabled={deletingGroup}
                                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                            <FiTrash2 size={14} />
                                            {deletingGroup ? "กำลังลบ..." : "ลบกลุ่มนี้"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
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
                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                layout="center"
                                label="นิสิตทั้งหมด"
                                value={summary.total_students}
                                sub={`เล่นครบทุกด่าน ${summary.completed_all} คน`}
                            />
                            <PairStatCard
                                label="ทำแบบประเมินตนเอง"
                                items={[
                                    { label: "Pre-test", value: summary.pre_test_done },
                                    { label: "Post-test", value: summary.post_test_done },
                                ]}
                                sub="จำนวนคน"
                            />
                            <StatCard
                                label="ความคืบหน้าเฉลี่ย"
                                value={`${summary.avg_progress}%`}
                                sub="ภาพรวมทุกบท"
                            />
                            {/* นิสิตที่ไม่ได้เข้าใช้งานใน 7 วัน (รวมที่ยังไม่เคยเข้า) */}
                            <StatCard
                                label="นิสิตที่มีความเสี่ยง"
                                tone="text-red-600"
                                value={`${Math.max(summary.total_students - summary.active_7_days, 0)} คน`}
                                sub="ไม่ได้เข้าใช้งานใน 7 วัน"
                            />
                        </section>

                        {/* ================= PRE vs POST ================= */}
                        <section className="grid gap-4 lg:grid-cols-3">
                            <div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">
                                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        ผลประเมินตนเอง ก่อน - หลังเล่น
                                    </h2>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                        จำนวน {summary.paired_count}/{summary.total_students} คน
                                    </span>
                                </div>
                                <p className="mb-5 text-xs text-gray-400">
                                    เฉลี่ยจากนิสิตที่ทำครบทั้ง Pre-Test และ Post-Test
                                </p>

                                {summary.paired_count === 0 ? (
                                    <p className="py-6 text-center text-sm text-gray-400">
                                        ยังไม่มีนิสิตที่ทำ Post-Test
                                    </p>
                                ) : (
                                    <>
                                        <div className="space-y-4">
                                            <CompareBar label="Pre-Test" value={summary.avg_pre_test} color="bg-gray-400" />
                                            <CompareBar label="Post-Test" value={summary.avg_post_test} color="bg-emerald-500" />
                                        </div>
                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {Object.entries(BREAKDOWN_META).map(([key, meta]) => {
                                                const list = summary.paired_breakdown?.[key] || [];
                                                const Icon = meta.icon;
                                                const active = breakdownView === key;

                                                return (
                                                    <button
                                                        key={key}
                                                        type="button"
                                                        onClick={() =>
                                                            setBreakdownView((prev) => (prev === key ? null : key))
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${meta.badgeClass
                                                            } ${active ? `ring-2 ${meta.ringClass}` : "hover:opacity-75"}`}
                                                    >
                                                        <Icon />
                                                        {meta.label} {list.length} คน
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* รายชื่อของกลุ่มที่เลือกดู */}
                                        {breakdownView && (
                                            <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3">
                                                {(summary.paired_breakdown?.[breakdownView] || []).length === 0 ? (
                                                    <p className="py-2 text-center text-xs text-gray-400">
                                                        ไม่มีนิสิตในกลุ่มนี้
                                                    </p>
                                                ) : (
                                                    <ul className="divide-y divide-gray-100">
                                                        {[...summary.paired_breakdown[breakdownView]]
                                                            .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
                                                            .map((s) => (
                                                                <li
                                                                    key={s.user_id}
                                                                    className="flex items-center justify-between gap-3 py-1.5 text-sm"
                                                                >
                                                                    <span className="text-gray-700">{s.name}</span>
                                                                    <span className="flex shrink-0 items-center gap-2 text-xs">
                                                                        <span className="text-gray-400">
                                                                            {s.pre_test}% → {s.post_test}%
                                                                        </span>
                                                                        <span
                                                                            className={`font-semibold ${s.diff > 0
                                                                                ? "text-emerald-600"
                                                                                : s.diff < 0
                                                                                    ? "text-red-500"
                                                                                    : "text-gray-400"
                                                                                }`}
                                                                        >
                                                                            {s.diff > 0 ? "+" : ""}
                                                                            {s.diff}%
                                                                        </span>
                                                                    </span>
                                                                </li>
                                                            ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </>
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
                                <p className="mt-2 text-md text-gray-800">
                                    หลังเล่นเทียบกับก่อนเล่น <br />
                                    {summary.normalized_gain !== null &&
                                        summary.normalized_gain !== undefined &&
                                        ` ${gainLabel(summary.normalized_gain)}`}
                                </p>
                                {summary.normalized_gain !== null &&
                                    summary.normalized_gain !== undefined && (
                                        <p className="mt-0.5 text-sm text-gray-600">
                                            g = {summary.normalized_gain.toFixed(2)} (Normalized Gain, Hake 1998)
                                        </p>
                                    )}
                            </div>
                        </section>
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
                                            <th className="whitespace-nowrap px-4 py-3 text-center font-medium">
                                                ลบ
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {visibleRows.length === 0 && (
                                            <tr>
                                                <td colSpan={COLUMNS.length + 1} className="py-12 text-center text-gray-400">
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
                                                                    {s.streak_stars > 0 && (
                                                                        <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-500">
                                                                            <FiStar size={12} className="fill-amber-400" />
                                                                            {s.streak_stars} ดวง
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-600">
                                                            <p>{s.major_name}</p>
                                                            {activeScope === "all" && (
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
                                                        <td className="px-4 py-3 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setDeleteStudentError("");
                                                                    setStudentToDelete({
                                                                        user_id: s.user_id,
                                                                        name: fullName(s),
                                                                    });
                                                                }}
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                                                                aria-label={`ลบข้อมูลของ ${fullName(s)}`}
                                                                title="ลบนิสิตรายนี้"
                                                            >
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>

                                                    {/* แถวรายละเอียด: สไลด์ลงมาเมื่อกด */}
                                                    <tr>
                                                        <td colSpan={COLUMNS.length + 1} className="p-0">
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

            {showAddGroup && (
                <AddGroupModal
                    faculties={faculties}
                    onClose={() => setShowAddGroup(false)}
                    onAdded={handleGroupAdded}
                />
            )}

            {studentToDelete && (
                <DeleteStudentModal
                    student={studentToDelete}
                    deleting={deletingStudent}
                    error={deleteStudentError}
                    onClose={() => !deletingStudent && setStudentToDelete(null)}
                    onConfirm={handleConfirmDeleteStudent}
                />
            )}
        </div>
    );
}