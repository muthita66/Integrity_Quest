import { useEffect } from "react";
import { createPortal } from "react-dom";
import { FiTrash2 } from "react-icons/fi";

export default function DeleteStudentModal({ student, onClose, onConfirm, deleting, error }) {
    // ปิดด้วย Esc (ยกเว้นระหว่างกำลังลบ)
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && !deleting && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, deleting]);

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => !deleting && onClose()}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <FiTrash2 size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800">
                            ยืนยันการลบข้อมูลนิสิต
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                            ท่านกำลังจะลบข้อมูลของ{" "}
                            <span className="font-semibold text-gray-800">{student.name}</span>{" "}
                            ออกจากระบบ การดำเนินการนี้ไม่สามารถเรียกคืนข้อมูลของนิสิตได้
                        </p>
                        <p className="mt-2 text-sm font-medium text-gray-700">
                            ยืนยันที่จะดำเนินการต่อหรือไม่
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                        {error}
                    </p>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={deleting}
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                        ยกเลิก
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {deleting ? "กำลังลบ..." : "ยืนยันการลบ"}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}