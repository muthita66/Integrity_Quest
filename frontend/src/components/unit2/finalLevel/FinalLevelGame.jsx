import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import bgGame from "../../../assets/bg_game.png";
import { FaPause, FaArrowLeft, FaPlay } from "react-icons/fa";
import ExitDialog from "../level1/components/ExitDialog";

import GameHeader from "./components/GameHeader";
import MissionCard from "./components/MissionCard";
import PauseModal from "../level2/PauseModal";
import ResultPage from "./ResultPage";
import TimeoutPage from "./TimeoutPage";
import FinalLevelIntroPage from "./FinalLevelIntroPage";

import { useFinalMissionGame } from "./hooks/useFinalMissionGame";

import bgMusic from "../../../assets/sounds/Unit2/bg_FinalLevel.mp3";
import useBackgroundMusic from "../../../hooks/useBackgroundMusic";
import useGameMuted from "../../../hooks/useGameMuted";

/**
 * เพลงพื้นหลังของ Final Level
 * แยกเป็น component เล็ก ๆ แล้ว render เฉพาะหน้าจอการเล่น
 * → เพลงเริ่มตอนเข้าเล่น และหยุดเองตอนไปหน้า Intro หรือหน้าสรุปผล
 * เปิด/ปิดเสียงได้จากปุ่มใน PauseModal
 */
function GameMusic() {
    const [muted] = useGameMuted();
    useBackgroundMusic(bgMusic, { volume: 0.15, muted });
    return null;
}

/**
 * Final Mission Game
 *
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
        verifiedMoney,
        baseIP,
        medalBonusIP,
        earnedIP,
        totalIntegrityPoints,
        isFirstTry,
        isTimedOut,
        handleSelectOption,
        startMission,
        isLoading,
        error,
    } = useFinalMissionGame({ skipStartPage });

    // ================= Loading =================
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900">
                <p className="text-2xl font-bold text-white">
                    กำลังโหลดข้อมูลเกม...
                </p>
            </div>
        );
    }

    // ================= Error =================
    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900">
                <p className="text-2xl font-bold text-red-400">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="button w-40"
                >
                    ลองใหม่
                </button>
            </div>
        );
    }

    // ================= ป้องกัน currentMission ไม่มีข้อมูล =================
    if (!currentMission) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900">
                <p className="text-2xl font-bold text-white">
                    ไม่พบข้อมูล Mission
                </p>
            </div>
        );
    }

    // ================= 1. หน้าจอ Intro Scenes =================
    if (gameState === "intro") {
        return (
            <FinalLevelIntroPage
                startMission={startMission}
                initialStep={introStep}
            />
        );
    }

    // ================= 2. หน้าจอสรุปผลลัพธ์ท้ายเกม =================
    if (gameState === "result") {
        // หมดเวลา → หน้าหมดเวลา (โทนแดง)
        if (isTimedOut) {
            return (
                <TimeoutPage
                    MISSIONS={shuffledMissions}
                    userChoices={userChoices}
                    money={verifiedMoney}
                    totalCorrect={totalCorrect}
                />
            );
        }

        return (
            <ResultPage
                isPassed={isPassed}
                timeLeft={timeLeft}
                totalCorrect={totalCorrect}
                MISSIONS={shuffledMissions}
                userChoices={userChoices}
                setGameState={setGameState}
                setIntroStep={setIntroStep}
                money={verifiedMoney}
                medal={medal}
                baseIP={baseIP}
                medalBonusIP={medalBonusIP}
                earnedIP={earnedIP}
                totalIntegrityPoints={totalIntegrityPoints}
                isFirstTry={isFirstTry}
                playCount={playCount}
            />
        );
    }

    // ================= 3. หน้าจอการเล่น =================
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4 sarabun-bold">
            {/* เพลงพื้นหลัง (เล่นเฉพาะหน้าจอการเล่น) */}
            <GameMusic />

            {/* Background */}
            <div
                className="absolute inset-0 z-0 h-full w-full bg-cover bg-top transition-all duration-500"
                style={{
                    backgroundImage: `url(${currentMission.image || bgGame})`,
                }}
            />

            {/* Header แถบบน */}
            <div className="absolute top-6 left-0 right-0 z-30 flex w-full items-start justify-between px-6 md:px-10 pointer-events-none">

                {/* ปุ่มย้อนกลับ - มุมซ้ายบน */}
                <div className="pointer-events-auto flex gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setShowExitDialog(true);
                            setIsPaused(true);
                        }}
                        className="flex h-[40px] w-[40px] items-center justify-center rounded-full border-4 border-white bg-yellow-400 text-2xl text-slate-900 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-slate-200 active:scale-95"
                        title="ย้อนกลับ"
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                {/* เวลา (ตรงกลาง) */}
                <div className="pointer-events-auto flex flex-1 justify-center">
                    <div className="text-white drop-shadow-lg px-6 py-2">
                        <p
                            className={`text-4xl md:text-5xl font-black tracking-wider transition-all duration-300 ${timeLeft <= 10
                                ? "text-red-500 animate-pulse"
                                : "text-yellow-300"
                                }`}
                        >
                            00:{String(timeLeft).padStart(2, "0")}
                        </p>
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
                        timeLeft={timeLeft}
                        currentStep={currentStep}
                        totalMissions={shuffledMissions.length}
                    />
                </div>
            </div>

            {/* Pause Modal */}
            <PauseModal
                isOpen={isPaused && !showExitDialog}
                onResume={() => setIsPaused(false)}
                onRestart={() => {
                    setIsPaused(false);
                    startMission();
                }}
                onExit={() => navigate("/map")}
            />

            {/* Custom Exit Dialog */}
            {showExitDialog && (
                <div
                    className="
                        fixed inset-0 z-[9999]
                        flex items-center justify-center
                        bg-black/70 p-4
                        sarabun-bold
                    "
                >
                    <div
                        className="
                            w-full max-w-[520px]
                            rounded-[32px] border-4 border-black
                            bg-white p-8 text-center
                            shadow-2xl
                        "
                    >
                        <h2 className="mb-3 text-3xl font-black text-slate-900">
                            กลับไปหน้าภารกิจหลัก
                        </h2>

                        <p className="mb-4 text-base font-medium text-slate-600">
                            คุณแน่ใจแล้วใช่ไหม?
                            <br />
                            <span className="text-red-500 font-bold">
                                ระบบจะไม่บันทึกเกมที่เล่นไป
                            </span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowExitDialog(false);
                                    setIsPaused(false);
                                }}
                                className="button w-40 mx-auto"
                            >
                                <div className="outline"></div>

                                <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                                    ยกเลิก
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/unit2/final/introMission"
                                    )
                                }
                                className="button w-40 mx-auto"
                            >
                                <div className="outline"></div>

                                <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                                    ตกลง
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}