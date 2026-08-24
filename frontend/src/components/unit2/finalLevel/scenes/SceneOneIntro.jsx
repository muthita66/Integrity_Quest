import { IoMdSkipForward } from "react-icons/io";
import { motion } from "framer-motion";
import IntroDialog from "../../intro/IntroDialog";
import SceneOne from "../../../../assets/unit2/FinalLevel/intro/sceneOne.png";
import { FaLightbulb } from "react-icons/fa";

export default function SceneOneIntro({
    onNext,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={SceneOne}
                alt="Scene One"
                className="absolute inset-0 w-full h-full object-cover object-top"
            />

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

            {/* Dialog */}
            <div className="absolute bottom-10 left-0 w-full z-20">
                <IntroDialog
                    speaker="นักวางแผนการเงิน"
                    title="บททดสอบสุดท้าย"
                    text={
                        <>
                            <span>
                                เช้าวันนี้คุณมีเงิน <strong>500 บาท</strong>
                                ตลอดทั้งวัน จงตัดสินใจใช้เงินอย่างรอบคอบ
                                และบริหารเงินให้เพียงพอจนจบวัน
                            </span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">จำไว้:</span>{" "}
                                    ทุกการตัดสินใจส่งผลต่อเงินที่เหลืออยู่
                                </span>
                            </span>
                        </>
                    }
                    onNext={onNext}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}