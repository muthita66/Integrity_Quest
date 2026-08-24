import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "../../intro/IntroDialog";
import { FaLightbulb } from "react-icons/fa";
import SceneTwo from "../../../../assets/unit2/Level2/intro/sceneTwo.png";

export default function SceneTwoIntro({
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
                src={SceneTwo}
                alt="Scene Two"
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
                    title="คิดก่อนใช้"
                    text={
                        <>
                            <span>
                                แต่เพียงแค่รู้ว่าอะไรควรซื้อ...ก็ยังไม่เพียงพอ หากใช้เงินโดยไม่คำนวณ สุดท้ายเงินก็อาจหมดก่อนสิ้นเดือน
                            </span>
                            <br />
                            <span>
                                ลองพิจารณาดูว่าค่าใช้จ่ายใดจำเป็น ค่าใช้จ่ายใดรอได้ และควรเหลือเงินไว้เท่าไร
                            </span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">เรียนรู้จากสถานการณ์:</span>{" "}
                                    เปรียบเทียบรายรับกับรายจ่ายก่อนตัดสินใจ
                                </span>
                            </span>
                        </>}
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