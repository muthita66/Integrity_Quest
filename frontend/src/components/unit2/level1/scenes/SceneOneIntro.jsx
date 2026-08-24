import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "../../intro/IntroDialog";
import sceneOne from "../../../../assets/unit2/Level1/intro/sceneOne.png";

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
                <IntroDialog
                    speaker="ไกด์การเงิน"
                    title="ตลาดนัดมหาวิทยาลัย"
                    text="ท่ามกลางสินค้ามากมายและโปรโมชั่นดึงดูดใจ คุณต้องเรียนรู้ที่จะคิดก่อนตัดสินใจซื้อ"
                    onNext={onNext}
                    showBack={false}
                    currentScene={currentScene}
                    totalScenes={totalScenes}
                />
            </div>
        </div>
    );
}