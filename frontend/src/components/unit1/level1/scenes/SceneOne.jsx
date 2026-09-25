import { useEffect, useRef } from "react";
import { IoMdSkipForward } from "react-icons/io";
import IntroDialog from "./IntroDialog";
import SceneOneImg from "../../../../assets/unit1/level1/intro/scene1.png";
import introOneSound from "../../../../assets/sounds/BackgroundGame/IntroOne.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

export default function SceneOne({
    scene,
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    const dialog = scene?.introDialog?.[0];
    const [muted] = useGameMuted();
    const audioRef = useRef(null);

    // เล่นเสียง IntroOne ครั้งเดียวตอนเข้าฉาก ไม่วน
    useEffect(() => {
        const audio = new Audio(introOneSound);
        audio.loop = false;
        audio.volume = 0.5;
        audio.muted = muted;
        audioRef.current = audio;

        audio.play().catch(() => { });

        // ออกจากฉากนี้แล้วหยุดเสียง จะได้ไม่ซ้อนกับเสียงฉากถัดไป
        return () => {
            audio.pause();
            audio.src = "";
            audioRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // เปิด/ปิดเสียงตามค่าที่ตั้งไว้
    useEffect(() => {
        if (audioRef.current) audioRef.current.muted = muted;
    }, [muted]);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Illustration */}
            <img
                src={SceneOneImg}
                alt="Scene One"
                className="absolute inset-0 w-full h-full object-cover object-top"
            />

            {/* Skip Button */}
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
            {dialog && (
                <div className="absolute bottom-10 left-0 w-full z-10">
                    <IntroDialog
                        speaker={dialog.speaker}
                        title={dialog.title}
                        text={dialog.text}
                        lesson={dialog.lesson}
                        onNext={onNext}
                        onBack={onBack}
                        showBack={currentScene > 0}
                        currentScene={currentScene}
                        totalScenes={totalScenes}
                    />
                </div>
            )}
        </div>
    );
}