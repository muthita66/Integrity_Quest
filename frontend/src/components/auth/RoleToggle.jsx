import { FiBookOpen, FiUsers } from "react-icons/fi";

// ============================================================
// สีตาม Role (ใช้ร่วมกันทุกไฟล์ในหน้า Login / Sign up)
// นักเรียน = น้ำเงิน, อาจารย์ = เขียว
// ============================================================

export const ROLE_THEME = {
    student: {
        text: "text-blue-600",
        button: "bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-300",
        link: "text-blue-600 hover:text-blue-700",
        focus: "focus:border-blue-500 focus:ring-blue-100",
    },
    teacher: {
        text: "text-emerald-600",
        button: "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300",
        link: "text-emerald-600 hover:text-emerald-700",
        focus: "focus:border-emerald-500 focus:ring-emerald-100",
    },
};

export const getRoleTheme = (role) =>
    ROLE_THEME[role] || ROLE_THEME.student;

const OPTIONS = [
    { value: "student", label: "นักเรียน", icon: FiBookOpen },
    { value: "teacher", label: "อาจารย์", icon: FiUsers },
];

// ============================================================
// ตัวเลือก นักเรียน / อาจารย์ (segmented control)
// ============================================================

export default function RoleToggle({ role, setRole, className = "" }) {
    return (
        <div
            role="radiogroup"
            aria-label="เลือกประเภทผู้ใช้"
            className={`grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 ${className}`}
        >
            {OPTIONS.map(({ value, label, icon: Icon }) => {
                const selected = role === value;
                const theme = getRoleTheme(value);

                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setRole(value)}
                        className={`
                            flex h-10 items-center justify-center gap-2 rounded-md
                            text-sm font-semibold transition
                            ${selected
                                ? `bg-white shadow-sm ${theme.text}`
                                : "text-gray-500 hover:text-gray-700"}
                        `}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}