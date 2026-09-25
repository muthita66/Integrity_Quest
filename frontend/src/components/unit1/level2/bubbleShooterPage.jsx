import { AnimatePresence } from "framer-motion";

import Bubble from "./components/Bubble";
import BubbleParticles from "./components/BubbleParticles";
import GameHeader from "./components/GameHeader";
import Background from "./components/Background";
import BossSection from "./components/BossSection";
import BossFailModal from "./components/BossFailModal";
import NavBar from "./components/Navbar";

import BgBubble from "../../../assets/unit1/level2/bgBubble.png";
import bgMusic from "../../../assets/sounds/Unit1/bg_game.mp3";

import useBubbleGame from "./hooks/useBubbleGame";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

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

  // ==========================================
  // เพลงพื้นหลัง เบา ๆ คลอเกม เล่นวน
  // เปิด/ปิดได้จากปุ่มใน ExitDialog
  // ==========================================
  const [muted] = useGameMuted();
  useBackgroundMusic(bgMusic, { volume: 0.12, muted });

  // ==========================================
  // หมายเหตุ: เอา useEffect ที่เคย navigate ไป
  // /unit1/level2/result ตอน gameStatus === "win"/"lose"
  // ออกแล้ว เพราะ:
  //
  // - "win" ตอนนี้ useBossGame.completeGame() เป็นคน
  //   navigate ไปหน้า Result เองอยู่แล้ว (พร้อมเก็บ
  //   level2Result ที่มี earned_ip ให้หน้า Result อ่าน)
  //   ถ้าปล่อย useEffect เดิมไว้จะ navigate ซ้ำและ
  //   เขียนทับด้วย key เก่า (bubbleScore/bubbleStatus)
  //   ที่หน้า Result เวอร์ชันใหม่ไม่ได้อ่านแล้ว
  //
  // - "lose" (ยิงโดน Good Bubble ผิด) เดิม navigate หนี
  //   ไปหน้า Result ทันที ซึ่งข้าม Retry/completeGame
  //   ไปเลย ผิดกติกา (ต้องให้ผู้เล่นกด Retry เพื่อเล่น
  //   ต่อด้วย play_id เดิม ไม่ใช่จบเกมไปดื้อ ๆ) — เปลี่ยน
  //   มาโชว์ BossFailModal ทับหน้าเกมแทน เหมือนตอน
  //   Boss ตอบผิด
  // ==========================================

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
              backgroundImage: `url("${BgBubble}")`,
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
                gameStatus === "playing" &&
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

            {/* ==================================
                ยิงโดน Good Bubble ผิด → Retry
                (play_id เดิม, wrong_count สะสมต่อ)
            ================================== */}
            <BossFailModal
              open={gameStatus === "lose"}
              onFail={restartGame}
              title="ยิงผิด!"
              message={
                "คุณยิงโดนแนวคิดที่ถูกต้องเข้าไป\nลองกลับไปเริ่มใหม่อีกครั้ง"
              }
            />

          </div>
        </div>
      </div>
    </Background>
  );
}