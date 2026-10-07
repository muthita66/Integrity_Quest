import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ExitDialog from "./ExitDialog";
import { FaBars } from "react-icons/fa6";
import bgMusic from "../../../../assets/sounds/Unit1/bg_FinalLevel.mp3";
import useBackgroundMusic from "../../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../../hooks/useGameMuted";

const ICON_BUTTON_CLASS = `rounded-full border-2 border-white/80 bg-black/40 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-300 cursor-pointer hover:scale-105 hover:bg-black/60 active:scale-95`;

export default function NavBar({ onRestart, stage }) {
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);

    // ปุ่มเปิด/ปิดเสียงย้ายไปอยู่ใน ExitDialog แล้ว
    // ที่นี่อ่านแค่สถานะ muted เพื่อคุมเพลงพื้นหลัง
    const [muted] = useGameMuted();

    const isEnd = stage === "end";

    const musicRef = useBackgroundMusic(bgMusic, {
        volume: 0.15,
        muted: muted || isEnd,
    });

    useEffect(() => {
        const audio = musicRef.current;
        if (!audio) return;

        if (isEnd) {
            audio.pause();
            audio.currentTime = 0;
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
            {/* Menu button — fixed top-right (เปิด ExitDialog: เล่นต่อ / เสียง / เริ่มใหม่ / กลับหน้าหลัก) */}
            {stage !== "file" && (
                <button
                    type="button"
                    onClick={() => setShowExitDialog(true)}
                    aria-label="เปิดเมนู"
                    title="เมนู"
                    className={`fixed top-4 right-4 z-50 ${ICON_BUTTON_CLASS}`}
                >
                    <FaBars size={22} />
                </button>
            )}

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