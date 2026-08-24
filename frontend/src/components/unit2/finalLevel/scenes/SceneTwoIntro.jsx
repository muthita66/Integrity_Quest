import { IoMdSkipForward } from "react-icons/io";
import { motion } from "framer-motion";
import IntroDialog from "../../intro/IntroDialog";
import SceneTwo from "../../../../assets/unit2/FinalLevel/intro/sceneTwo.png"
import { FaLightbulb } from "react-icons/fa";

const CHOICES = [
    { label: "ถูกกว่า", icon: "💸", desc: "แต่ไม่เหมาะกับสถานการณ์", color: "border-rose-400 text-rose-300" },
    { label: "สะดวกกว่า", icon: "✨", desc: "แต่มีค่าใช้จ่ายสูง", color: "border-blue-400 text-blue-300" },
    { label: "ไม่เสียเงิน", icon: "🎁", desc: "แต่อาจไม่ได้ผลเสมอไป", color: "border-green-400 text-green-300" },
];

export default function SceneTwoIntro({
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={SceneTwo}
                alt="Scene Two"
                className="absolute inset-0 w-full h-full object-cover object-top"
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

            {/* Dialog */}
            <div className="absolute bottom-10 left-0 w-full z-20">
                <IntroDialog
                    speaker="นักวางแผนการเงิน"
                    title="คิดก่อนตัดสินใจ"
                    text={
                        <>
                            <span>
                                ในแต่ละสถานการณ์ คุณต้องเลือกว่าจะใช้เงินอย่างไร
                            </span>
                            <br />

                            <span>
                                พิจารณา <strong>ความจำเป็น ความคุ้มค่า และเงินคงเหลือ</strong>{" "}
                                ก่อนตัดสินใจ
                            </span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">เคล็ดลับ:</span>{" "}
                                    เลือกสิ่งที่เหมาะสมกับสถานการณ์ ไม่ใช่เพียงสิ่งที่อยากได้
                                </span>
                            </span>
                        </>
                    }
                    onNext={onNext}
                    onBack={onBack}
                    showBack={true}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}