import { IoMdSkipForward } from "react-icons/io";
import { FaLightbulb } from "react-icons/fa6";
import IntroDialog from "../../intro/IntroDialog";
import sceneThree from "../../../../assets/unit2/level1/intro/sceneThree.png";

export default function SceneThree({
    scene,
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    // ข้อมูล Dialog จาก Database
    const dialog = scene?.introDialog?.[0];
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Illustration */}
            <img
                src={sceneThree}
                alt="Scene Three"
                className="absolute inset-0 w-full h-full object-cover object-center"
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
                {dialog && (
                    <IntroDialog
                        speaker={dialog.speaker}
                        title={dialog.title}
                        text={dialog.text}
                        lesson={dialog.lesson}
                        onNext={onNext}
                        onBack={onBack}
                        showBack={true}
                        currentScene={currentScene}
                        totalScenes={totalScenes}
                    />
                )}
            </div>
        </div>
    );
}