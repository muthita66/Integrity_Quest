import { IoMdSkipForward } from "react-icons/io";
import { FaLightbulb } from "react-icons/fa6";
import IntroDialog from "../../intro/IntroDialog";
import sceneOne from "../../../../assets/unit2/Level1/intro/sceneOne.png";

export default function SceneOne({
    scene,
    onNext,
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
                src={sceneOne}
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

            {/* Dialog */}
            <div className="absolute bottom-10 left-0 w-full z-10">
                {dialog && (
                    <IntroDialog
                        speaker={dialog.speaker}
                        title={dialog.title}
                        text={dialog.text}
                        lesson={dialog.lesson}
                        onNext={onNext}
                        showBack={false}
                        currentScene={currentScene}
                        totalScenes={totalScenes}
                    />
                )}
            </div>
        </div>
    );
}