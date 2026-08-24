import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "../../intro/IntroDialog";
import SceneTwoBg from "../../../../assets/unit2/Level1/intro/sceneTwo.png";

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
                src={SceneTwoBg}
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
                    speaker="ไกด์การเงิน"
                    title="ห้องเรียนการเงินส่วนบุคคล"
                    text="อาจารย์มอบภารกิจให้คุณเรียนรู้การแยก สิ่งจำเป็น (Need) และ สิ่งที่ต้องการ (Want) เพื่อวางแผนการใช้เงินอย่างมีวินัยและมีเหตุผล."
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