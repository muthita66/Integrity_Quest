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
        message,
        error,

        handleClickDoc,
        restartGame,
        handlePause,
        handleResume,
        handleBackToMap,
    } = useReceiptGame();

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
        <div className="relative flex h-dvh w-full items-center justify-center overflow-hidden">
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

                {/* ข้อความตอบกลับตอนกด (พบ/ไม่ใช่เอกสารการเงิน/error จาก server)
                    เดิม hook ส่ง message มาแต่หน้าไม่เคยแสดง ทำให้เห็นไม่ได้เลย
                    ว่า server ปฏิเสธการกดหรือจบเกมไม่สำเร็จ */}
                {message && (
                    <div className="pointer-events-none absolute left-1/2 top-24 z-[60] max-w-[80%] -translate-x-1/2 rounded-xl bg-black/80 px-5 py-2 text-center text-base font-bold text-white shadow-lg">
                        {message}
                    </div>
                )}

                {/* จบเกมไม่สำเร็จ (เช่น เก็บครบแล้วแต่ server ไม่ยอมจบ) */}
                {error && gameStatus !== "lose" && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/50">
                        <div className="max-w-[80%] rounded-2xl bg-white px-6 py-5 text-center shadow-xl">
                            <p className="text-lg font-black text-red-700">
                                เกิดข้อผิดพลาด
                            </p>
                            <p className="mt-1 text-sm text-gray-700">
                                {error}
                            </p>
                            <div className="mt-4 flex justify-center gap-3">
                                <button
                                    onClick={restartGame}
                                    className="rounded-lg bg-green-600 px-4 py-2 font-bold text-white"
                                >
                                    เริ่มใหม่
                                </button>
                                <button
                                    onClick={handleBackToMap}
                                    className="rounded-lg bg-gray-500 px-4 py-2 font-bold text-white"
                                >
                                    กลับหน้าหลัก
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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