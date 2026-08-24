import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "./IntroDialog";
import SceneOneImg from "../../../../assets/unit1/finalLevel/intro/scene1.png";

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
                    speaker="สำนักงานกิจการนักศึกษา"
                    title="แฟ้มลับจากสำนักงานตรวจสอบภายใน"
                    text={
                        <>
                            มีรายงานความผิดปกติทางการเงินเกิดขึ้นหลายจุดในรั้วมหาวิทยาลัย มหาวิทยาลัยจึงแต่งตั้งให้คุณเป็น
                            <br />
                            "นักสืบความซื่อสัตย์ประจำมหาวิทยาลัย"
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
