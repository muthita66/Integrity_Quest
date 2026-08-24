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
                sarabun-bold
            "
        >
            <div
                className="
                    w-full max-w-[520px]
                    rounded-[32px] border-4 border-black
                    bg-white p-8 text-center
                    shadow-2xl
                "
            >
                <div
                    className="
                        mx-auto mb-5
                        flex h-20 w-20
                        items-center justify-center
                        rounded-full border-4 border-slate-900
                        bg-yellow-300 text-4xl text-slate-900
                    "
                >
                    <FaPause />
                </div>

                <h2 className="mb-3 text-4xl font-black text-slate-900">
                    หยุดเกมชั่วคราว
                </h2>

                <p className="mb-8 text-sm font-medium text-slate-600">
                    เกมและเวลาถูกหยุดไว้แล้ว
                    <br />
                    ถ้าคุณเริ่มเกมใหม่หรือกลับหน้าหลักข้อมูลที่เล่นจะไม่ถูกบันทึก
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={onResume}
                        className="button w-40 mx-auto"
                    >
                        <div className="outline"></div>

                        <span className="relative z-10 flex items-center gap-3">
                            <FaPlay />
                            เล่นต่อ
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onRestart}
                        className="button w-40 mx-auto"
                    >
                        <div className="outline"></div>

                        <span className="relative z-10 flex items-center gap-3">
                            <FaRotateRight />
                            เริ่มภารกิจใหม่
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={onExit}
                        className="
                            button w-40 mx-auto"
                    >
                        <div className="outline"></div>

                        <span className="relative z-10 flex items-center gap-3">
                            กลับหน้าหลัก
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}