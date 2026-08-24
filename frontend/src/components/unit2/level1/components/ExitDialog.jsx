
import { FaHome } from "react-icons/fa";

function ExitDialog({ isOpen, onResume, onRestart, onExit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
            <div className="w-full max-w-lg overflow-hidden rounded-3xl border-8 border-black bg-white shadow-2xl">

                {/* Header */}
                <div className="bg-white px-6 py-5 text-center">
                    <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white text-black shadow-md">
                        <FaHome className="text-4xl" />
                    </div>

                    <h2 className="text-2xl font-extrabold text-black">
                        ออกจากภารกิจ?
                    </h2>
                </div>

                {/* Content */}
                <div className="px-6 py-6 text-center">

                    <p className="text-lg font-semibold leading-relaxed text-[#6B7280]">
                        ความคืบหน้าในรอบนี้จะไม่ถูกบันทึก
                    </p>

                    <p className="mt-2 text-base text-[#9CA3AF]">
                        คุณต้องการออกจากเกมหรือไม่?
                    </p>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">

                        {/* Resume */}
                        <button
                            onClick={onResume}
                            className="play-button"
                        >
                            เล่นต่อ
                        </button>

                        {/* Exit */}
                        <button
                            onClick={onExit}
                            className="play-button red"
                        >
                            ออกจากเกม
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExitDialog;
