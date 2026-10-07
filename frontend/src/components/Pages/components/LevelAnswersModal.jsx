import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiX, FiCheck, FiMinus } from "react-icons/fi";
import { getLevelPlayDetail } from "../../services/teacherService";
import { formatDateTime, formatDuration } from "./teacherFormatters";

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

export default function LevelAnswersModal({ userId, studentName, level, onClose }) {
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
    return createPortal(
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
                                    <p className="text-[11px] text-emerald-600">Integrity Point</p>
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
        </div>,
        document.body
    );
}