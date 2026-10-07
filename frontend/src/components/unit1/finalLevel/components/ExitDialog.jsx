import { FaPause } from "react-icons/fa";
import {
    FaPlay,
    FaRotateRight,
    FaVolumeHigh,
    FaVolumeXmark,
} from "react-icons/fa6";
import useGameMuted from "../../../../hooks/useGameMuted";

export default function ExitDialog({
    isOpen,
    onResume,
    onRestart,
    onExit,
    hideResume = false,
}) {
    const [muted, toggleMuted] = useGameMuted();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 px-4">
            <div className="w-full max-w-md max-h-[94dvh] overflow-y-auto rounded-3xl border-4 border-black bg-white p-6 text-center shadow-[8px_8px_0px_black] sarabun-bold">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-yellow-300 text-3xl">
                    <FaPause />
                </div>

                <h2 className="mb-2 text-2xl font-black">ออกจากเกม</h2>

                <p className="mb-5 text-base text-gray-700">
                    ต้องการออกจากภารกิจใช่หรือไม่
                    <br />
                    ถ้าคุณเริ่มเกมใหม่หรือกลับหน้าหลักข้อมูลที่เล่นจะไม่ถูกบันทึก
                </p>

                <div className="flex flex-col gap-3">
                    {!hideResume && (
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
                    )}

                    <button
                        type="button"
                        onClick={toggleMuted}
                        aria-pressed={muted}
                        className="button w-40 mx-auto"
                    >
                        <div className="outline"></div>
                        <span className="relative z-10 flex items-center gap-3">
                            {muted ? <FaVolumeXmark /> : <FaVolumeHigh />}
                            {muted ? "เปิดเสียง" : "ปิดเสียง"}
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
                        className="button w-40 mx-auto"
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