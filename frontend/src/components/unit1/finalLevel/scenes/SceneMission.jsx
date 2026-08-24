import { IoMdSkipForward } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import "../../../../styles/unit1/Level1/button.css";
import SceneMissionImg from "../../../../assets/unit1/finalLevel/intro/sceneMission.png";
import Paper from "../../../../assets/unit1/finalLevel/intro/paper.png";
import Warn from "../../../../assets/unit1/level2/intro/warn.png";
import Magnifier from "../../../../assets/unit1/finalLevel/intro/magnifier.png";

export default function SceneMission({
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Illustration */}
            <img
                src={SceneMissionImg}
                alt="Scene Mission"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Skip Button */}
            <button
                type="button"
                onClick={handleSkip}
                className={`
                    absolute top-4 right-4 z-20
                    rounded-full border-2 border-white/80
                    bg-black/40 p-2
                    text-white shadow-lg
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:bg-black/60
                    active:scale-95
                    ${currentScene < totalScenes - 1 ? "" : "invisible"}
                `}
            >
                <IoMdSkipForward className="text-2xl" />
            </button>

            {/* Game Instruction Box */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-4xl">
                <div className="
                    rounded-3xl
                    border border-white/70
                    bg-white/55
                    px-8 py-5
                    shadow-2xl
                    backdrop-blur-md
                ">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h2 className="
                            text-2xl md:text-3xl
                            font-bold
                            text-black
                            sarabun-bold
                        ">
                            ภารกิจ : บททดสอบสุดท้าย
                        </h2>
                        <p className="
                            mt-2
                            text-base md:text-lg
                            text-black
                            sarabun-bold
                        ">
                            ค้นหาความจริง และตัดสินอย่างเป็นธรรม
                        </p>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        {/* Rule 1 */}
                        <div className="
                            rounded-2xl
                            bg-blue-50
                            border border-blue-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Paper} alt="Target" className="w-10 h-10 object-contain" />
                            </div>
                            <p className="font-bold text-gray-800 sarabun-bold">
                                ① รวบรวมหลักฐาน
                            </p>
                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                รวบรวมหลักฐานที่เกี่ยวข้องในคดี
                            </p>
                        </div>

                        {/* Rule 2 */}
                        <div className="
                            rounded-2xl
                            bg-red-50
                            border border-red-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Warn} alt="Warn" className="w-10 h-10 object-contain" />
                            </div>
                            <p className="font-bold text-gray-800 sarabun-bold">
                                ② วิเคราะห์พฤติกรรม
                            </p>
                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                วิเคราะห์พฤติกรรมที่ขัดต่อหลักความซื่อสัตย์ทางการเงิน
                            </p>
                        </div>

                        {/* Rule 3 */}
                        <div className="
                            rounded-2xl
                            bg-yellow-50
                            border border-yellow-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Magnifier} alt="Lamp" className="w-10 h-10 object-contain" />
                            </div>
                            <p className="font-bold text-gray-800 sarabun-bold">
                                ③ อ้างอิงจากหลักฐาน
                            </p>
                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                ทุกคำตัดสินต้องอ้างอิงจากหลักฐาน ไม่ใช่ความรู้สึก
                            </p>
                        </div>
                    </div>

                    {/* Scoring */}
                    <div className="
                        rounded-2xl
                        bg-white/80
                        border border-white/90
                        px-5 py-3
                        mb-5
                        text-center
                        sarabun-bold
                    ">
                        <p className="font-bold text-gray-800 mb-1">ระดับความสามารถของนักสืบ</p>
                        <p className="text-sm text-black flex flex-wrap justify-center gap-x-4 gap-y-1">
                            <span>🥇 <span className="font-semibold text-yellow-600">ปรมาจารย์</span><span className="font-light text-gray-400 mr-1"></span> : ตอบถูกทั้งหมด</span>
                            <span>🥈 <span className="font-semibold text-gray-500">มือฉมัง</span><span className="font-light text-gray-400 mr-1"></span> : ผิด 1-2 ครั้ง</span>
                            <span>🥉 <span className="font-semibold text-amber-700">เริ่มต้น</span><span className="font-light text-gray-400 mr-1"></span> : ผิด 3 ครั้งขึ้นไป</span>
                        </p>
                    </div>

                    {/* Start Button */}
                    <div className="flex w-full justify-center">
                        <button
                            type="button"
                            className="circle-play-button orange"
                            onClick={onNext}
                            aria-label="เริ่มภารกิจ"
                        >
                            <div className="circle-play-button__outer">
                                <div className="circle-play-button__shadow"></div>
                                <div className="circle-play-button__main">
                                    <FaPlay
                                        className="circle-play-button__icon"
                                        size={26}
                                    />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
