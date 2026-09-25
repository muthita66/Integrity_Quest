const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, 'bubbleShooterPage.jsx');

const content = `import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Bubble from "./components/Bubble";
import BubbleParticles from "./components/BubbleParticles";
import GameHeader from "./components/GameHeader";
import Background from "./components/Background";
import BossSection from "./components/BossSection";
import NavBar from "./components/Navbar";

import BgBubble from "../../../assets/unit1/level2/bgBubble.png";

import useBubbleGame from "./hooks/useBubbleGame";

export default function BubbleShooterPage() {
  const levelId = 2;

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

  const navigate = useNavigate();

  // ==========================================
  // เมื่อเกมจบจริง → ไปหน้า Result
  // ==========================================
  useEffect(() => {
    if (gameStatus === "win" || gameStatus === "lose") {
      localStorage.setItem("bubbleScore", score);
      localStorage.setItem("bubbleStatus", gameStatus);

      navigate("/unit1/level2/result");
    }
  }, [gameStatus, navigate, score]);

  // ==========================================
  // Loading
  // ==========================================
  if (isLoading) {
    return (
      <Background>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="bg-white border-4 border-black rounded-2xl px-10 py-6 text-center shadow-[6px_6px_0px_black]">
            <p className="text-2xl sarabun-bold">
              กำลังโหลดเกม...
            </p>
          </div>
        </div>
      </Background>
    );
  }

  // ==========================================
  // Error
  // ==========================================
  if (error) {
    return (
      <Background>
        <div className="h-screen w-full flex items-center justify-center">
          <div className="bg-white border-4 border-black rounded-2xl px-10 py-8 text-center shadow-[6px_6px_0px_black] max-w-lg">
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

  // ==========================================
  // Main Game
  // ==========================================
  return (
    <Background>
      <div className="h-screen w-full overflow-hidden flex flex-col pb-4">

        {/* ======================================
            Game Header
        ====================================== */}
        <GameHeader score={score} />

        {/* ======================================
            Game Container
        ====================================== */}
        <div
          className="
            mx-auto
            mt-4
            w-[1160px]
            max-w-[calc(100vw-2rem)]
            border-4
            border-black
            flex
            flex-col
            flex-1
            min-h-0
          "
        >

          {/* ====================================
              Navigation Bar
          ==================================== */}
          <NavBar />

          {/* ====================================
              Game Area
          ==================================== */}
          <div
            className="
              relative
              flex-1
              w-full
              overflow-hidden
              border-4
              border-t-0
              border-black
              sarabun-bold
            "
            style={{
              backgroundImage: \`url("\${BgBubble}")\`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >

            {/* ==================================
                Bubble Shooter
            ================================== */}
            <AnimatePresence>
              {!showBoss &&
                bubbles.map((bubble) => (
                  <Bubble
                    key={bubble.id}
                    bubble={bubble}
                    onShoot={handleShoot}
                  />
                ))}
            </AnimatePresence>

            {/* ==================================
                Bubble Particles
            ================================== */}
            <BubbleParticles particles={particles} />

            {/* ==================================
                Boss Section
            ================================== */}
            <BossSection
              levelId={levelId}
              playId={playId}
              open={showBoss && gameStatus === "playing"}
              onFinish={finishBoss}
              onFail={failBoss}
            />

          </div>
        </div>
      </div>
    </Background>
  );
}
`;

fs.writeFileSync(outPath, content, 'utf8');
console.log('bubbleShooterPage.jsx written successfully, lines:', content.split('\\n').length);
