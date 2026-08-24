import { IoMdSkipForward } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import "../../../../styles/unit1/Level1/button.css";
import SceneFourImg from "../../../../assets/unit1/level1/intro/sceneMission.png";
import Star from "../../../../assets/unit1/level1/intro/star.png";
import Cross from "../../../../assets/unit1/level1/intro/cross.png";
import Replay from "../../../../assets/unit1/level1/intro/replay.png";

export default function SceneMission({
    onNext,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">

            {/* Illustration */}
            <img
                src={SceneFourImg}
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
                            ภารกิจ : กระจกวิเศษ
                        </h2>

                        <p className="
                            mt-0
                            text-base md:text-lg
                            text-black
                            sarabun-bold
                        ">
                            เลือกคำตอบที่ตรงกับสิ่งที่คุณคิดว่าจะทำจริง
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
                            “ในแต่ละสถานการณ์ จะมีคำถามและตัวเลือกให้คุณตัดสินใจ คำตอบที่คุณเลือกจะสะท้อนแนวคิดและการตัดสินใจของคุณ”
                        </p>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">

                        {/* EXP */}
                        <div className="
                            rounded-2xl
                            bg-yellow-50
                            border border-yellow-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Star} alt="Star" className="w-12 h-12 object-contain" />
                            </div>

                            <p className="font-bold text-gray-800 sarabun-bold">
                                รับ EXP +5
                            </p>

                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                ตอบถูกครบทุกข้อ
                                ในการเล่นครั้งแรก
                            </p>
                        </div>

                        {/* Replay */}
                        <div className="
                            rounded-2xl
                            bg-blue-50
                            border border-blue-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Replay} alt="Replay" className="w-12 h-12 object-contain" />
                            </div>

                            <p className="font-bold text-gray-800 sarabun-bold">
                                เล่นซ้ำได้
                            </p>

                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                ครั้งที่ 2 เป็นต้นไป จะไม่ได้รับ EXP เพิ่ม
                            </p>
                        </div>

                        {/* Wrong */}
                        <div className="
                            rounded-2xl
                            bg-red-50
                            border border-red-200
                            px-4 py-2
                            text-center
                        ">
                            <div className="mb-1 mx-auto flex justify-center">
                                <img src={Cross} alt="Cross" className="w-12 h-12 object-contain" />
                            </div>

                            <p className="font-bold text-gray-800 sarabun-bold">
                                ระวังการตอบผิด
                            </p>

                            <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                ผิดมากกว่า 3 ครั้ง ต้องเริ่มเกมใหม่
                            </p>
                        </div>

                    </div>

                    <div className="flex flex-row w-full justify-center">

                    </div>

                    {/* Start Button */}
                    <div className="flex w-full justify-center">
                        <button
                            type="button"
                            className="circle-play-button blue"
                            onClick={onNext}
                            aria-label="เริ่มภารกิจ"
                        >
                            <div className="circle-play-button__outer">

                                {/* เงาด้านหลัง */}
                                <div className="circle-play-button__shadow"></div>

                                {/* วงกลมหลัก */}
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