import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "./IntroDialog";
import SceneOneImg from "../../../../assets/unit1/level1/intro/scene1.png";

export default function SceneOne({
    onNext,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Illustration */}
            <img
                src={SceneOneImg}
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
                <IntroDialog
                    speaker="ศูนย์ผู้พิทักษ์ความซื่อสัตย์"
                    title="ยินดีต้อนรับ"
                    text={
                        <>
                            <span>
                                ยินดีต้อนรับ นักศึกษาจากมหาวิทยาลัยอินทิกริตี้
                                สู่โครงการ <strong>ผู้พิทักษ์แห่งความซื่อสัตย์</strong>
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
