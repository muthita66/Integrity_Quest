import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "../../intro/IntroDialog";
import { FaLightbulb } from "react-icons/fa";
import sceneThree from "../../../../assets/unit2/Level2/intro/sceneThree.png";

export default function SceneThreeIntro({
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
                src={sceneThree}
                alt="Scene Three"
                className="absolute inset-0 w-full h-full object-cover object-top"
            />

            <button
                type="button"
                onClick={handleSkip}
                className={`
                    absolute top-4 right-4 z-10
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
            <div className="absolute bottom-10 left-0 w-full z-10">
                <IntroDialog
                    speaker="ผู้วางแผนการเงิน"
                    title="ลงมือวางแผน"
                    text={
                        <>
                            <span>
                                ถึงเวลานำความรู้มาใช้จริง คำนวณรายรับ–รายจ่าย และวางแผนเงินให้เพียงพอ
                            </span>
                            <br />
                            <span>หน้าที่ของคุณคือคำนวณและตัดสินใจว่าจะใช้เงินอย่างไร ทุกการเลือกจะส่งผลต่อเงินคงเหลือ</span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">ลงมือปฏิบัติ:</span>{" "}
                                    ทดลองวางแผนและตัดสินใจด้วยตนเอง
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