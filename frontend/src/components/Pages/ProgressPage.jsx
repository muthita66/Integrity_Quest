import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowLeft,
    FiCheck,
    FiLock,
    FiPlay,
    FiChevronRight,
    FiRotateCcw,
    FiClock,
    FiFilter,
    FiChevronDown,
} from "react-icons/fi";

import bg_login from "../../assets/bg_login.png";
import { getOverview } from "../services/profileService";

// ============================================================
// หน้า "ความคืบหน้าของฉัน"
// ------------------------------------------------------------
// - รวมทุกบท (6 บท) : % ที่เล่นไป, ด่านไหนได้กี่คะแนน
// - Filter : ทั้งหมด / เล่นจบแล้ว / กำลังเล่น / ยังไม่ได้เล่น
// - กดที่ด่าน หรือปุ่มท้ายการ์ด → ไปหน้าเล่นด่านนั้นได้เลย
// ============================================================

// ต้องตรงกับ LEVEL_ROUTES ใน MapPage/GameMap/FloatingStonePath.jsx
const LEVEL_ROUTES = {
    // Unit 1
    1: "/unit1/Level1IntroPage",
    2: "/unit1/level2/intro",
    3: "/unit1/final",

    // Unit 2
    5: "/unit2/intro",
    6: "/unit2/level2/intro",
    7: "/unit2/final/intro",

    // Unit 3
    8: "/unit3/level1/intro",
    9: "/unit3/level2/intro",
    10: "/unit3/final/start",
};

const getLevelRoute = (level, unitId) =>
    LEVEL_ROUTES[level.level_id] || `/unit/unit${unitId}`;

// ------------------------------------------------------------
// Filter
// ------------------------------------------------------------

const FILTERS = [
    { key: "all", label: "ทั้งหมด" },
    { key: "completed", label: "เล่นจบแล้ว" },
    { key: "in_progress", label: "กำลังเล่น" },
    { key: "not_played", label: "ยังไม่ได้เล่น" },
];

const matchFilter = (unit, filter) => {
    if (filter === "all") return true;
    if (filter === "not_played") {
        return ["not_started", "locked", "coming_soon"].includes(unit.status);
    }
    return unit.status === filter;
};

// ------------------------------------------------------------
// ป้ายสถานะของบท
// ------------------------------------------------------------

const UNIT_BADGE = {
    completed: { label: "เล่นจบแล้ว", className: "bg-emerald-100 text-emerald-700" },
    in_progress: { label: "กำลังเล่น", className: "bg-amber-100 text-amber-700" },
    not_started: { label: "ยังไม่ได้เล่น", className: "bg-blue-100 text-blue-700" },
    locked: { label: "ยังไม่ปลดล็อก", className: "bg-gray-100 text-gray-500" },
    coming_soon: { label: "เร็ว ๆ นี้", className: "bg-slate-100 text-slate-500" },
};

const BAR_COLOR = {
    completed: "bg-emerald-500",
    in_progress: "bg-amber-400",
    not_started: "bg-blue-500",
    locked: "bg-gray-300",
    coming_soon: "bg-gray-300",
};

// ------------------------------------------------------------
// ไอคอนสถานะของด่าน
// ------------------------------------------------------------

const LevelIcon = ({ state }) => {
    if (state === "passed") {
        return (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <FiCheck size={15} strokeWidth={3} />
            </span>
        );
    }

    if (state === "ready") {
        return (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-400 text-white">
                <FiPlay size={13} className="ml-0.5" />
            </span>
        );
    }

    return (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-400">
            <FiLock size={13} />
        </span>
    );
};

// ============================================================
// Filter แบบ Dropdown (กด 1 ปุ่ม → เมนูสไลด์ลงมา)
// ============================================================

function FilterDropdown({ value, onChange, counts }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // คลิกนอกกล่อง / กด Esc → ปิด
    useEffect(() => {
        if (!open) return;

        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open]);

    const current = FILTERS.find((f) => f.key === value) || FILTERS[0];

    return (
        <div ref={ref} className="relative inline-block">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${open
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
            >
                <FiFilter />
                <span>{current.label}</span>
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                    {counts[current.key] ?? 0}
                </span>
                <FiChevronDown
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* เมนูที่สไลด์ลงมา */}
            <div
                className={`absolute left-0 z-20 mt-2 w-56 origin-top overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg transition-all duration-200 ${open
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
            >
                {FILTERS.map((f) => {
                    const active = f.key === value;

                    return (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => {
                                onChange(f.key);
                                setOpen(false);
                            }}
                            className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${active
                                ? "bg-blue-50 font-semibold text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                <FiCheck
                                    className={active ? "opacity-100" : "opacity-0"}
                                />
                                {f.label}
                            </span>
                            <span className="text-xs text-gray-400">
                                {counts[f.key] ?? 0}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================
// การ์ดของแต่ละบท
// ============================================================

function UnitCard({ unit, preTestDone, onGo }) {
    const badge = UNIT_BADGE[unit.status];
    const disabled = unit.is_locked;

    // ด่านที่ควรเล่นต่อ = ด่านแรกที่ยังไม่ผ่านและเล่นได้
    const nextLevel =
        unit.levels.find((l) => l.state === "ready") || unit.levels[0] || null;

    let actionLabel;
    let ActionIcon = FiChevronRight;

    if (unit.status === "coming_soon") {
        actionLabel = "เร็ว ๆ นี้";
        ActionIcon = FiClock;
    } else if (disabled) {
        actionLabel =
            unit.order_number === 1 && !preTestDone
                ? "ทำ Pre-Test ก่อน"
                : "ผ่านบทก่อนหน้าก่อน";
        ActionIcon = FiLock;
    } else if (unit.status === "completed") {
        actionLabel = "เล่นซ้ำ";
        ActionIcon = FiRotateCcw;
    } else if (unit.status === "not_started") {
        actionLabel = "เริ่มเล่นบทนี้";
    } else {
        actionLabel = `เล่นต่อ ด่าน ${nextLevel?.order_no ?? ""}`;
    }

    return (
        <div
            className={`flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition ${unit.status === "coming_soon" ? "opacity-60" : "hover:shadow-md"
                }`}
        >
            {/* ชื่อบท + สถานะ */}
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400">
                        บทที่ {unit.order_number}
                    </p>
                    <h3 className="truncate text-lg font-bold text-gray-800">
                        {unit.name_th || unit.name_en}
                    </h3>
                    {unit.name_th && unit.name_en && (
                        <p className="truncate text-xs text-gray-400">
                            {unit.name_en}
                        </p>
                    )}
                </div>

                <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}
                >
                    {badge.label}
                </span>
            </div>

            {/* % ความคืบหน้าของบท */}
            <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                    <span>
                        ผ่าน {unit.passed_levels}/{unit.total_levels || 0} ด่าน
                    </span>
                    <span className="font-semibold text-gray-700">
                        {unit.percent}%
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                        className={`h-full rounded-full transition-all ${BAR_COLOR[unit.status]}`}
                        style={{ width: `${unit.percent}%` }}
                    />
                </div>
            </div>

            {/* รายการด่าน */}
            <ul className="mt-3 flex-1 space-y-1">
                {unit.levels.length === 0 && (
                    <li className="py-3 text-center text-sm text-gray-400">
                        ยังไม่มีด่านในบทนี้
                    </li>
                )}

                {unit.levels.map((level) => {
                    const canPlay = level.state !== "locked";

                    return (
                        <li key={level.level_id}>
                            <button
                                type="button"
                                disabled={!canPlay}
                                onClick={() => onGo(level, unit.unit_id)}
                                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${canPlay
                                    ? "hover:bg-gray-50"
                                    : "cursor-not-allowed"
                                    }`}
                            >
                                <LevelIcon state={level.state} />

                                <div className="min-w-0 flex-1">
                                    <p
                                        className={`truncate text-sm font-medium ${canPlay ? "text-gray-800" : "text-gray-400"
                                            }`}
                                    >
                                        ด่าน {level.order_no}
                                        {level.title ? ` · ${level.title}` : ""}
                                        {level.is_final && (
                                            <span className="ml-1.5 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-semibold text-purple-600">
                                                FINAL
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {level.times_played > 0
                                            ? `เล่นแล้ว ${level.times_played} ครั้ง`
                                            : "ยังไม่เคยเล่น"}
                                    </p>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p
                                        className={`text-sm font-bold ${level.times_played > 0
                                            ? "text-gray-800"
                                            : "text-gray-300"
                                            }`}
                                    >
                                        {level.best_ip} IP
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                        คะแนนดีที่สุด
                                    </p>
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>

            {/* ปุ่มไปที่บทนี้ */}
            <button
                type="button"
                disabled={disabled || !nextLevel}
                onClick={() => onGo(nextLevel, unit.unit_id)}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${disabled || !nextLevel
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : unit.status === "completed"
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
            >
                <ActionIcon />
                {actionLabel}
            </button>
        </div>
    );
}

// ============================================================
// Page
// ============================================================

export default function ProgressPage() {
    const navigate = useNavigate();

    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            navigate("/", { replace: true });
            return;
        }

        getOverview()
            .then(setOverview)
            .catch((err) => {
                console.error("Load overview error:", err);

                if (err.status === 401 || err.status === 403) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/", { replace: true });
                    return;
                }

                setError(err.message || "โหลดข้อมูลไม่สำเร็จ");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const units = useMemo(() => overview?.units || [], [overview]);

    const counts = useMemo(
        () =>
            Object.fromEntries(
                FILTERS.map((f) => [
                    f.key,
                    units.filter((u) => matchFilter(u, f.key)).length,
                ])
            ),
        [units]
    );

    const visibleUnits = units.filter((u) => matchFilter(u, filter));

    const completedUnits = units.filter((u) => u.status === "completed").length;
    const passedLevels = units.reduce((sum, u) => sum + u.passed_levels, 0);
    const totalLevels = units.reduce((sum, u) => sum + u.total_levels, 0);

    const handleGo = (level, unitId) => {
        if (!level || level.state === "locked") return;
        navigate(getLevelRoute(level, unitId));
    };

    return (
        <div
            className="fixed inset-0 overflow-y-auto bg-cover bg-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ backgroundImage: `url(${bg_login})` }}
        >
            <div className="flex min-h-full items-center justify-center p-6 lg:p-8">
                <div className="w-full max-w-7xl rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur lg:p-8">
                    {/* ================= HEADER ================= */}
                    <button
                        type="button"
                        onClick={() => navigate("/map")}
                        className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
                    >
                        <FiArrowLeft />
                        กลับ
                    </button>

                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-blue-600">
                                ความคืบหน้าของฉัน
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                ดูผลการเล่นทุกบท และกดเพื่อไปเล่นต่อได้เลย
                            </p>
                        </div>

                        {overview && (
                            <div className="flex gap-3">
                                <div className="rounded-xl bg-blue-50 px-4 py-2 text-center">
                                    <p className="text-xl font-bold text-blue-600">
                                        {overview.overall_percent}%
                                    </p>
                                    <p className="text-xs text-gray-500">ภาพรวม</p>
                                </div>
                                <div className="rounded-xl bg-emerald-50 px-4 py-2 text-center">
                                    <p className="text-xl font-bold text-emerald-600">
                                        {completedUnits}/{units.length}
                                    </p>
                                    <p className="text-xs text-gray-500">บทที่จบแล้ว</p>
                                </div>
                                <div className="rounded-xl bg-amber-50 px-4 py-2 text-center">
                                    <p className="text-xl font-bold text-amber-600">
                                        {passedLevels}/{totalLevels}
                                    </p>
                                    <p className="text-xs text-gray-500">ด่านที่ผ่าน</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ================= FILTER ================= */}
                    <div className="mt-5">
                        <FilterDropdown
                            value={filter}
                            onChange={setFilter}
                            counts={counts}
                        />
                    </div>

                    {/* ================= CONTENT ================= */}
                    <div className="mt-5">
                        {loading && (
                            <p className="py-16 text-center text-gray-500">
                                กำลังโหลดข้อมูล...
                            </p>
                        )}

                        {!loading && error && (
                            <p className="py-16 text-center text-red-500">{error}</p>
                        )}

                        {!loading && !error && visibleUnits.length === 0 && (
                            <p className="py-16 text-center text-gray-400">
                                ไม่มีบทในหมวดนี้
                            </p>
                        )}

                        {!loading && !error && visibleUnits.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {visibleUnits.map((unit) => (
                                    <UnitCard
                                        key={unit.unit_id}
                                        unit={unit}
                                        preTestDone={overview?.pre_test_done}
                                        onGo={handleGo}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}