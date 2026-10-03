import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FaBars } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import Bubble from "./components/Bubble";
import BubbleParticles from "./components/BubbleParticles";
import Background from "./components/Background";
import BossSection from "./components/BossSection";
import BossFailModal from "./components/BossFailModal";
import ExitDialog from "./components/ExitDialog";

import BgBubble from "../../../assets/unit1/level2/bgBubble.png";
import bgMusic from "../../../assets/sounds/Unit1/bg_game.mp3";

import useBubbleGame from "./hooks/useBubbleGame";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

export default function BubbleShooterPage() {
  const levelId = 2;

  const navigate = useNavigate();

  // ==========================================
  // Exit Dialog
  // ==========================================
  const [showExitDialog, setShowExitDialog] = useState(false);

  const {
    bubbles,
    score,
    gameStatus,
    showBoss,
    particles,
    handleShoot,
    restartGame,
    finishBoss,
    failBoss,
    isLoading,
    error,
    playId,
  } = useBubbleGame(levelId);

  // ==========================================
  // เพลงพื้นหลัง
  // ==========================================
  const [muted] = useGameMuted();

  useBackgroundMusic(bgMusic, {
    volume: 0.12,
    muted,
  });

  // Loading
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <p className="text-2xl sarabun-bold text-white">
          กำลังโหลดเกม...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <Background>
        <div className="h-screen w-full flex items-center justify-center">
          <div
            className="
              bg-white
              border-4 border-black
              rounded-2xl
              px-10 py-8
              text-center
              shadow-[6px_6px_0px_black]
              max-w-lg
            "
          >
            <p className="text-2xl text-red-600 sarabun-bold mb-4">
              ไม่สามารถโหลดเกมได้
            </p>

            <p className="text-lg sarabun-bold mb-6">
              {error}
            </p>

            <button
              onClick={restartGame}
              className="
                px-6 py-3
                bg-purple-400
                border-4 border-black
                rounded-xl
                text-xl
                sarabun-bold
                shadow-[4px_4px_0px_black]
                hover:translate-x-1
                hover:translate-y-1
                hover:shadow-none
                transition-all
              "
            >
              ลองใหม่
            </button>
          </div>
        </div>
      </Background>
    );
  }

  // Main Game
  return (
    <Background>
      <div className="relative h-screen w-screen overflow-hidden">
        <div
          className="
            relative
            w-full
            h-full
            overflow-hidden
            sarabun-bold
          "
          style={{
            backgroundImage: `url("${BgBubble}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div
            className="
              absolute
              top-[3%]
              left-1/2
              -translate-x-1/2
              z-40
              text-center
              pointer-events-none
              w-full
              px-4
            "
          >
            <h1
              className="
                text-white
                text-3xl
                md:text-4xl
                font-black
                drop-shadow-[0_4px_4px_rgba(0,0,0,0.45)]
              "
            >
              จิตวิทยาคนโกง
            </h1>

            <p
              className="
                mt-2
                text-white
                text-lg
                md:text-xl
                font-bold
                drop-shadow-[0_3px_3px_rgba(0,0,0,0.45)]
              "
            >
              ยิงทำลายข้ออ้างของการโกงให้หมด
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowExitDialog(true)}
            aria-label="เปิดเมนู"
            className="
              absolute
              top-6
              right-6
              z-[100]

              w-12
              h-12

              flex
              items-center
              justify-center

              rounded-full

              bg-purple-300/90
              border-4
              border-white

              text-white
              text-2xl

              shadow-[0_4px_8px_rgba(0,0,0,0.35)]

              hover:scale-105
              hover:bg-purple-400

              active:scale-95

              transition-all
            "
          >
            <FaBars />
          </button>

          <AnimatePresence>
            {!showBoss &&
              gameStatus === "playing" &&
              bubbles.map((bubble) => (
                <Bubble
                  key={bubble.id}
                  bubble={bubble}
                  onShoot={handleShoot}
                />
              ))}
          </AnimatePresence>

          <BubbleParticles particles={particles} />

          <BossSection
            levelId={levelId}
            playId={playId}
            open={showBoss && gameStatus === "playing"}
            onFinish={finishBoss}
            onFail={failBoss}
          />

          <BossFailModal
            open={gameStatus === "lose"}
            onFail={restartGame}
            title="ยิงผิด!"
            message={
              "คุณยิงโดนแนวคิดที่ถูกต้องเข้าไป\nลองกลับไปเริ่มใหม่อีกครั้ง"
            }
          />

        </div>

        <ExitDialog
          isOpen={showExitDialog}
          onResume={() => setShowExitDialog(false)}
          onRestart={() => {
            setShowExitDialog(false);
            restartGame();
          }}
          onExit={() => {
            setShowExitDialog(false);
            navigate("/unit1");
          }}
        />

      </div>
    </Background>
  );
}

