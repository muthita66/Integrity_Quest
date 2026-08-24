import IntroDialog from "./IntroDialog";
import { IoMdSkipForward } from "react-icons/io";
import { FaLightbulb } from "react-icons/fa6";

import SceneTwoImg from "../../../../assets/unit1/level2/intro/scene2.png";

export default function SceneTwo({
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div>
            {/* Illustration */}
            <div className="relative w-full h-screen overflow-hidden">
                {/* Illustration */}
                <img
                    src={SceneTwoImg}
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
            </div>
            {/* Dialog */}
            <div className="absolute bottom-10 left-0 w-full z-10">
                <IntroDialog
                    speaker="ผู้พิทักษ์แห่งความซื่อสัตย์"
                    title="ทำไมคนถึงโกง?"
                    text={
                        <>
                            <span>
                                บางครั้งคนเราเลือกโกงเพราะต้องการผลประโยชน์
                                หรือหลีกเลี่ยงผลเสียที่อาจเกิดขึ้น
                            </span>
                            <br />

                            <span>
                                แต่เหตุผลของการตัดสินใจนั้น อาจสะท้อนระดับการคิดทางศีลธรรมของเรา
                            </span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">เรียนรู้:</span>{" "}
                                    ทำความเข้าใจเหตุผลเบื้องหลังการโกง
                                </span>
                            </span>
                        </>
                    }
                    onNext={onNext}
                    onBack={onBack}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}
