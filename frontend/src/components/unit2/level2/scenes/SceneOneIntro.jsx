import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "../../intro/IntroDialog";
import { FaLightbulb } from "react-icons/fa";
import SceneOne from "../../../../assets/unit2/Level2/intro/sceneOne.png";

export default function SceneOneIntro({
    onNext,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Illustration */}
            <img
                src={SceneOne}
                alt="Scene One"
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

            <div className="absolute bottom-10 left-0 z-10 w-full">
                <IntroDialog
                    speaker="ผู้วางแผนการเงิน"
                    title="เริ่มต้นวางแผน"
                    text={
                        <>
                            <span>
                                หลังจากแยก <strong>ความจำเป็น (Need)</strong> และ{" "}
                                <strong>ความต้องการ (Want)</strong> ได้แล้ว
                            </span>
                            <br />

                            <span>
                                คุณต้องนำข้อมูลเหล่านั้นมาใช้ในการวางแผนการเงิน
                                และก่อนใช้เงิน ต้องรู้ก่อนว่ามีเงินเท่าไร
                            </span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">เรียนรู้จากสถานการณ์:</span>{" "}
                                    รู้จักสำรวจและประเมินสถานะทางการเงินของตนเอง
                                </span>
                            </span>
                        </>
                    }
                    onNext={onNext}
                    showBack={false}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}