import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ExitDialog from "./ExitDialog";
import { FaHome } from "react-icons/fa";
import { FaVolumeHigh, FaVolumeXmark } from "react-icons/fa6";

import bgMusic from "../../../../assets/sounds/Unit1/bg_FinalLevel.mp3";
import useBackgroundMusic from "../../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../../hooks/useGameMuted";

const ICON_BUTTON_CLASS = `
    rounded-full border-2 border-white/80
    bg-black/40 p-2
    text-white shadow-lg
    backdrop-blur-sm
    transition-all duration-300 cursor-pointer
    hover:scale-105 hover:bg-black/60
    active:scale-95
`;

export default function NavBar({
    onRestart,
    stage
}) {
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);

    // เพลงพื้นหลัง FinalLevel เบา ๆ เล่นวน
    // NavBar แสดงเฉพาะตอนเล่นเกม (ไม่แสดงช่วง intro) เพลงจึงเริ่มตอนเข้าเกม
    const [muted, toggleMuted] = useGameMuted();
    const isEnd = stage === "end";

    // หน้าสรุปผล (stage "end") ให้เพลงเกมหยุด จะได้ไม่ทับเสียง Bonus/Good
    const musicRef = useBackgroundMusic(bgMusic, {
        volume: 0.15,
        muted: muted || isEnd,
    });

    useEffect(() => {
        const audio = musicRef.current;
        if (!audio) return;

        if (isEnd) {
            audio.pause();
            audio.currentTime = 0; // กดเล่นอีกครั้งแล้วเพลงเริ่มใหม่ตั้งแต่ต้น
        }
    }, [isEnd, musicRef]);

    const handleRestart = () => {
        if (onRestart) {
            onRestart();
            setShowExitDialog(false);
        } else {
            window.location.reload();
        }
    };

    return (
        <>
            {/* Sound button — fixed top-left */}
            <button
                type="button"
                onClick={toggleMuted}
                aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
                title={muted ? "เปิดเสียง" : "ปิดเสียง"}
                className={`fixed top-4 left-4 z-50 ${ICON_BUTTON_CLASS}`}
            >
                {muted ? <FaVolumeXmark size={22} /> : <FaVolumeHigh size={22} />}
            </button>

            {/* Exit button — fixed top-right */}
            <button
                type="button"
                onClick={() => setShowExitDialog(true)}
                className={`fixed top-4 right-4 z-50 ${ICON_BUTTON_CLASS}`}
            >
                <FaHome size={22} />
            </button>

            <ExitDialog
                isOpen={showExitDialog}
                onResume={() => setShowExitDialog(false)}
                onRestart={handleRestart}
                onExit={() => navigate("/map")}
                hideResume={stage === "end"}
            />
        </>
    );
}