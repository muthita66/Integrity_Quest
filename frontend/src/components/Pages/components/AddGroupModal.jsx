import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { addTeacherGroup } from "../../services/teacherService";

export default function AddGroupModal({ faculties, onClose, onAdded }) {
    const [faculty, setFaculty] = useState("");
    const [major, setMajor] = useState("");
    const [year, setYear] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const majorOptions = faculty
        ? faculties.find((f) => String(f.faculty_id) === String(faculty))?.majors || []
        : [];

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!faculty && !major && !year && !note.trim()) {
            setError("กรุณาเลือกหรือกรอกอย่างน้อย 1 เงื่อนไข");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const created = await addTeacherGroup({
                faculty: faculty || null,
                major: major || null,
                year: year || null,
                note: note.trim() || null,
            });
            onAdded(created);
        } catch (err) {
            setError(err.message || "เพิ่มกลุ่มไม่สำเร็จ");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">เพิ่มกลุ่มนักเรียน</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                        aria-label="ปิด"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        <select
                            value={faculty}
                            onChange={(e) => {
                                setFaculty(e.target.value);
                                setMajor("");
                            }}
                            className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">ทุกคณะ</option>
                            {faculties.map((f) => (
                                <option key={f.faculty_id} value={f.faculty_id}>
                                    {f.faculty_name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">{faculty ? "ทุกสาขา" : "ทุกสาขา (เลือกคณะก่อน)"}</option>
                            {majorOptions.map((m) => (
                                <option key={m.major_id} value={m.major_id}>
                                    {m.major_name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none focus:border-emerald-500"
                        >
                            <option value="">ทุกชั้นปี</option>
                            <option value="1">ปี 1</option>
                            <option value="2">ปี 2</option>
                            <option value="3">ปี 3</option>
                            <option value="4">ปี 4</option>
                            <option value="5">ปี 5</option>
                            <option value="6">ปี 6</option>
                        </select>
                    </div>

                    <input
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="รายละเอียดกลุ่ม เช่น วิชาที่สอน (ไม่บังคับ)"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                    />

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {saving ? "กำลังบันทึก..." : "เพิ่มกลุ่ม"}
                    </button>
                </form>
            </div>
        </div>
    );
}