import bgGame1 from "../../../assets/unit3/level1/bgGame1.png";
import bgMusic from "../../../assets/sounds/Unit3/Level1.mp3";

import DocumentCard from "./components/DocumentCard";
import GameBoard from "./components/GameBoard";
import GameHeader from "./components/GameHeader";
import PauseModal from "./components/PauseModal";
import ResultModel from "./components/ResultModel";
import TaskBox from "./components/TaskBox";

import useReceiptGame from "./hooks/useReceiptGame";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";
import { useEffect } from "react";

export default function ReceiptGamePage() {
    const {
        documents,
        found,
        wrongIds,
        foundCount,
        wrong,
        timeLeft,
        gameStatus,
        isPaused,
        totalDocuments,
        maxWrong,

        handleClickDoc,
        restartGame,
        handlePause,
        handleResume,
        handleBackToMap,
    } = useReceiptGame();

    // เพลงพื้นหลัง เบา ๆ เล่นวน เปิด/ปิดได้จากปุ่มใน PauseModal
    // จบเกม (ชนะ/แพ้) แล้วเพลงหยุด และเริ่มใหม่ตั้งแต่ต้นเมื่อกดเริ่มภารกิจใหม่
    const [muted] = useGameMuted();
    const isGameOver = gameStatus === "win" || gameStatus === "lose";

    const musicRef = useBackgroundMusic(bgMusic, {
        volume: 0.15,
        muted: muted || isGameOver,
    });

    useEffect(() => {
        const audio = musicRef.current;
        if (!audio || !isGameOver) return;

        audio.pause();
        audio.currentTime = 0;
    }, [isGameOver, musicRef]);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
            <img
                src={bgGame1}
                alt=""
                className="absolute inset-0 z-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 z-0 bg-white/70" />

            <GameBoard>
                <GameHeader
                    foundCount={foundCount}
                    totalDocuments={totalDocuments}
                    wrong={wrong}
                    maxWrong={maxWrong}
                    timeLeft={timeLeft}
                    onPause={handlePause}
                    onExit={handleBackToMap}
                />

                {documents.map((doc) => (
                    <DocumentCard
                        key={doc.id}
                        doc={doc}
                        isFound={found.includes(doc.id)}
                        isWrong={wrongIds.includes(doc.id)}
                        handleClickDoc={handleClickDoc}
                    />
                ))}

                <TaskBox />

                <PauseModal
                    isOpen={isPaused}
                    onResume={handleResume}
                    onRestart={restartGame}
                    onExit={handleBackToMap}
                />

                {/* แสดง popup ผลเฉพาะตอน "แพ้จริง" เท่านั้น
                    เดิม render ตลอด → ช่วง loading ก่อนเริ่มเกม
                    (gameStatus = "loading") popup ภารกิจไม่สำเร็จเลยโผล่แวบหนึ่ง
                    (ชนะ = เด้งไปหน้า Result อยู่แล้ว ไม่ต้องใช้ popup) */}
                {gameStatus === "lose" && (
                    <ResultModel
                        gameStatus={gameStatus}
                        restartGame={restartGame}
                    />
                )}
            </GameBoard>
        </div>
    );
}