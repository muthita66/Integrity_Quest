import { FaPlay, FaRotateRight } from "react-icons/fa6";
import { FaPause } from "react-icons/fa";

export default function PauseModal({
    isOpen,
    onResume,
    onRestart,
    onExit,
}) {
    if (!isOpen) return null;

    return (
        <div
            className="
                fixed inset-0 z-[9999]
                flex items-center justify-center
                bg-black/70 p-4
            "
        >
            <div
                className="
                    w-full max-w-[480px]
                    rounded-3xl border-4 border-amber-800
                    bg-yellow-50 p-8 text-center
                    shadow-2xl
                "
            >
                {/* Icon */}
                <div
                    className="
                        mx-auto mb-5
                        flex h-20 w-20
                        items-center justify-center
                        rounded-full border-4 border-amber-800
                        bg-amber-300 text-4xl text-amber-900
                    "
                >
                    <FaPause />
                </div>

                <h2 className="mb-3 text-3xl font-black text-amber-900">
                    หยุดเกมชั่วคราว
                </h2>

                <p className="mb-8 text-sm font-medium text-amber-700">
                    เกมและเวลาถูกหยุดไว้แล้ว
                    <br />
                    ถ้าเริ่มใหม่หรือกลับหน้าหลัก ข้อมูลจะไม่ถูกบันทึก
                </p>

                <div className="flex flex-col gap-3">
                    {/* Resume */}
                    <button
                        type="button"
                        onClick={onResume}
                        className="mx-auto flex w-44 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-700 bg-emerald-500 px-6 py-3 font-black text-white shadow-md transition-all hover:bg-emerald-600 active:scale-95"
                    >
                        <FaPlay />
                        เล่นต่อ
                    </button>

                    {/* Restart */}
                    <button
                        type="button"
                        onClick={onRestart}
                        className="mx-auto flex w-44 items-center justify-center gap-2 rounded-2xl border-2 border-amber-700 bg-amber-400 px-6 py-3 font-black text-amber-900 shadow-md transition-all hover:bg-amber-500 active:scale-95"
                    >
                        <FaRotateRight />
                        เริ่มใหม่
                    </button>

                    {/* Exit */}
                    <button
                        type="button"
                        onClick={onExit}
                        className="mx-auto flex w-44 items-center justify-center gap-2 rounded-2xl border-2 border-slate-400 bg-slate-200 px-6 py-3 font-black text-slate-700 shadow-md transition-all hover:bg-slate-300 active:scale-95"
                    >
                        กลับหน้าหลัก
                    </button>
                </div>
            </div>
        </div>
    );
}
