import { IoMdSkipForward } from "react-icons/io";
import { FaLightbulb } from "react-icons/fa6";

import IntroDialog from "./IntroDialog";
import SceneTwoImg from "../../../../assets/unit1/finalLevel/intro/scene2.png";

export default function SceneTwo({
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
                src={SceneTwoImg}
                alt="Scene Two"
                className="absolute inset-0 w-full h-full object-cover"
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
                    speaker="หัวหน้าสืบสวน"
                    title="คิดให้รอบด้าน"
                    text={
                        <>
                            <span>
                                ทุกสถานการณ์มีเหตุผลและผลที่ตามมา
                            </span>
                            <br />

                            <span>
                                ลองทบทวนสิ่งที่เรียนรู้ แล้วพิจารณาว่า
                                <strong> การตัดสินใจใดถูกต้องและเป็นธรรม</strong>
                            </span>
                            <br />

                            <span className="mt-2 flex items-start gap-2 text-yellow-300">
                                <FaLightbulb className="mt-1 shrink-0" />
                                <span>
                                    <span className="font-bold">จำไว้:</span>{" "}
                                    อย่าตัดสินใจจากผลประโยชน์เพียงอย่างเดียว
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
