import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import bgGame from "../../../assets/bg_game.png";
import { FaPause, FaArrowLeft } from "react-icons/fa";
import ExitDialog from "../level1/components/ExitDialog";

import GameHeader from "./components/GameHeader";
import MissionCard from "./components/MissionCard";
import PauseModal from "../level2/PauseModal";
import ResultPage from "./ResultPage";
import FinalLevelIntroPage from "./FinalLevelIntroPage";

import { useFinalMissionGame } from "./hooks/useFinalMissionGame";
import { MISSIONS } from "./data/missions";

/**
 * @param {boolean} skipStartPage - ถ้า true จะข้ามหน้า StartPage แล้วเริ่มเล่นทันที
 *   ใช้กรณีที่มาต่อจาก intro scenes (SceneOneIntro -> SceneTwoIntro -> SceneThreeIntro)
 *   ที่ปุ่ม "เริ่มภารกิจ" ถูกย้ายไปอยู่ใน SceneThreeIntro แล้ว
 */
export default function FinalMissionGame({ skipStartPage = false }) {
    const navigate = useNavigate();
    const [showExitDialog, setShowExitDialog] = useState(false);

    const {
        gameState,
        setGameState,
        introStep,
        setIntroStep,
        currentStep,
        timeLeft,
        userChoices,
        isPaused,
        setIsPaused,
        money,
        playCount,
        currentMission,
        shuffledMissions,
        totalCorrect,
        isPassed,
        medal,
        expBonus,
        handleSelectOption,
        startMission,
    } = useFinalMissionGame({ skipStartPage });

    // 1. หน้าจอ Intro Scenes 
    if (gameState === "intro") {
        return <FinalLevelIntroPage startMission={startMission} initialStep={introStep} />;
    }

    // 2. หน้าจอสรุปผลลัพธ์ท้ายเกม 
    if (gameState === "result") {
        return (
            <ResultPage
                isPassed={isPassed}
                timeLeft={timeLeft}
                totalCorrect={totalCorrect}
                MISSIONS={shuffledMissions}
                userChoices={userChoices}
                setGameState={setGameState}
                setIntroStep={setIntroStep}
                money={money}
                medal={medal}
                expBonus={expBonus}
                playCount={playCount}
            />
        );
    }

    // ================= 3. หน้าจอการเล่น =================
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sarabun-bold">
            {/* Background */}
            <div
                className="absolute inset-0 z-0 h-full w-full bg-cover bg-top transition-all duration-500"
                style={{ backgroundImage: `url(${currentMission.image || bgGame})` }}
            />

            {/* Header แถบบน */}
            <div className="absolute top-6 left-0 right-0 z-30 flex w-full items-start justify-between px-6 md:px-10 pointer-events-none">

                {/* ปุ่มย้อนกลับ - มุมซ้ายบน */}
                <div className="pointer-events-auto flex gap-3">
                    <button
                        type="button"
                        onClick={() => setShowExitDialog(true)}
                        className="flex h-[50px] w-[50px] items-center justify-center rounded-full border-4 border-white bg-slate-100 text-2xl text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-200 active:scale-95"
                        title="ย้อนกลับ"
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                {/* เวลาและ Progress - ตรงกลาง */}
                <div className="pointer-events-auto flex flex-col items-center gap-2">
                    <div className="text-white drop-shadow-md">
                        <p
                            className={`text-4xl font-black tracking-wider transition-all duration-300 ${timeLeft <= 10
                                ? "text-red-500 animate-pulse"
                                : "text-yellow-300"
                                }`}
                        >
                            00:{String(timeLeft).padStart(2, "0")}
                        </p>
                    </div>

                    {/* Progress (Dots) */}
                    <div className="flex items-center gap-3">
                        {Array.from({ length: MISSIONS.length }).map((_, index) => {
                            const isCompleted = index < currentStep;
                            const isCurrent = index === currentStep;

                            return (
                                <div
                                    key={index}
                                    className={`
                                        rounded-full
                                        transition-all
                                        duration-300
                                        ${isCompleted || isCurrent
                                            ? "h-3 w-3 bg-yellow-400 shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                                            : "h-3 w-3 bg-white/40"
                                        }
                                        ${isCurrent
                                            ? "scale-125 ring-4 ring-yellow-400/40"
                                            : ""
                                        }
                                    `}
                                    title={`ภารกิจที่ ${index + 1}`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* ปุ่มควบคุม - ขวาสุด */}
                <div className="flex gap-3 pointer-events-auto">
                    {!isPaused && (
                        <button
                            type="button"
                            onClick={() => setIsPaused(true)}
                            className="flex h-[50px] w-[50px] items-center justify-center rounded-2xl border-4 border-white bg-yellow-400 text-2xl text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-yellow-500 active:scale-95"
                            title="หยุดเกม"
                        >
                            <FaPause />
                        </button>
                    )}
                </div>
            </div>

            {/* เนื้อหาภายใน */}
            <div className="relative z-20 flex flex-col items-center justify-end w-full h-full pt-32 px-4 -bottom-34">
                <div className="w-full max-w-4xl flex flex-col gap-6">
                    <MissionCard
                        currentMission={currentMission}
                        handleSelectOption={handleSelectOption}
                        money={money}
                    />
                </div>
            </div>

            <PauseModal
                isOpen={isPaused}
                onResume={() => setIsPaused(false)}
                onRestart={() => { setIsPaused(false); startMission(); }}
                onExit={() => navigate("/map")}
            />
            {/* Custom Exit Dialog */}
            {showExitDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border-8 border-black bg-white shadow-2xl">
                        <div className="bg-white px-6 py-5 text-center border-b-2 border-slate-100">
                            <h2 className="text-2xl font-extrabold text-black">
                                กลับไปหน้าหลัก
                            </h2>
                        </div>
                        <div className="px-6 py-6 text-center">
                            <p className="text-xl font-bold leading-relaxed text-slate-800">
                                คุณแน่ใจแล้วใช่ไหม?
                            </p>
                            <p className="mt-2 text-base font-bold text-red-500">
                                ระบบจะไม่บันทึกเกมที่เล่นไป
                            </p>

                            <div className="mt-8 flex gap-4 justify-center">
                                <button
                                    onClick={() => setShowExitDialog(false)}
                                    className="px-6 py-3 min-w-[120px] rounded-2xl bg-slate-200 text-slate-800 font-bold hover:bg-slate-300 transition-all active:scale-95"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => window.location.href = "/unit2/final"}
                                    className="px-6 py-3 min-w-[120px] rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-md active:scale-95"
                                >
                                    ตกลง
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
