import { IoMdSkipForward } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import "../../../../styles/unit1/Level1/button.css";
import SceneMissionImg from "../../../../assets/unit1/level2/intro/sceneMission.png";
import Target from "../../../../assets/unit1/level2/intro/target.png"
import Warn from "../../../../assets/unit1/level2/intro/warn.png"
import Lamp from "../../../../assets/unit1/level2/intro/lamp.png"

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
                    <div className="text-center mb-5">
                        <h2 className="
                            text-2xl md:text-3xl
                            font-bold
                            text-black
                            sarabun-bold
                        ">
                            ภารกิจ : บททดสอบความซื่อสัตย์
                        </h2>

                        <p className="
                            mt-0
                            text-base md:text-lg
                            text-black
                            sarabun-bold
                        ">
                            คิดให้รอบคอบ ก่อนเลือกสิ่งที่ถูกต้อง
                        </p>
                    </div>

                    {/* Description */}
                    <div className="
                        rounded-2xl
                        bg-purple-50
                        px-5 py-4
                        mb-5
                    ">
                        <p className="
                            text-center
                            text-gray-700
                            text-sm md:text-md
                            leading-relaxed
                            sarabun-bold
                        ">
                            “ค้นหาและทำลายฟองที่เกี่ยวข้องกับการโกงให้ถูกต้อง”
                        </p>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">

                        {/* Rule 1 */}
                        <div className="
                            rounded-2xl
                            bg-yellow-50
                            border border-yellow-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Target} alt="Target" className="w-12 h-12 object-contain" />
                            </div>
                            <p className="font-bold text-gray-800 sarabun-bold">
                                เลือกให้ถูกต้อง
                            </p>
                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                เลือกทำลายเฉพาะฟองที่เกี่ยวข้องกับพฤติกรรมการโกง
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
                                <img src={Warn} alt="Warn" className="w-12 h-12 object-contain" />
                            </div>
                            <p className="font-bold text-gray-800 sarabun-bold">
                                ระวังการเลือกผิด
                            </p>
                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                หากเลือกฟองผิด จะต้องเริ่มภารกิจใหม่
                            </p>
                        </div>

                        {/* Rule 3 */}
                        <div className="
                            rounded-2xl
                            bg-blue-50
                            border border-blue-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Lamp} alt="Lamp" className="w-12 h-12 object-contain" />
                            </div>
                            <p className="font-bold text-gray-800 sarabun-bold">
                                คิดก่อนตัดสินใจ
                            </p>
                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                ไม่มีการจับเวลา ค่อย ๆ พิจารณาและเลือกอย่างรอบคอบ
                            </p>
                        </div>

                    </div>

                    {/* Start Button */}
                    <div className="flex w-full justify-center">
                        <button
                            type="button"
                            className="circle-play-button purple"
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
