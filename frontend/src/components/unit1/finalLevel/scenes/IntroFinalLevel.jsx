import { useState, useEffect } from "react";
import { IoMdSkipForward } from "react-icons/io";

import "../../../../styles/unit1/Level1/MirrorIntro.css";

import bgGameLevel1 from "../../../../assets/unit1/level1/bg_game.png";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneMission from "./SceneMission";

// จุดฝุ่นแสงลอยรอบฉาก
const SHIMMER_DOTS = [
    { left: "12%", delay: "0s", duration: "9s", size: 3 },
    { left: "22%", delay: "2.4s", duration: "11s", size: 2 },
    { left: "38%", delay: "1.1s", duration: "8s", size: 2 },
    { left: "55%", delay: "3.6s", duration: "12s", size: 3 },
    { left: "68%", delay: "0.6s", duration: "10s", size: 2 },
    { left: "80%", delay: "2s", duration: "9.5s", size: 2 },
    { left: "90%", delay: "4s", duration: "11.5s", size: 3 },
];

export default function IntroScenes({ onComplete }) {
    const [currentScene, setCurrentScene] = useState(0);

    // ข้อมูล Scene จาก Database
    const [sceneData, setSceneData] = useState([]);
    const [loading, setLoading] = useState(true);

    const scenes = [
        SceneOne,
        SceneTwo,
        SceneThree,
        SceneMission,
    ];

    const CurrentSceneComponent = scenes[currentScene];

    // ดึง Scene + Dialog จาก Database (level_id = 3 คือ finalLevel)
    useEffect(() => {
        const fetchScenes = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "http://localhost:5000/api/introDialog/level/3"
                );
                if (!response.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูล Scene ได้");
                }
                const data = await response.json();
                console.log("FinalLevel Scene Data:", data);
                setSceneData(data);
            } catch (error) {
                console.error("Error fetching final level scenes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchScenes();
    }, []);

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene((prev) => prev + 1);
        } else {
            onComplete && onComplete();
        }
    };

    const handleBack = () => {
        if (currentScene > 0) {
            setCurrentScene((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        setCurrentScene(scenes.length - 1);
    };

    const handleStartGame = () => {
        onComplete && onComplete();
    };

    return (
        <main className="mirror-scene min-h-screen relative overflow-hidden sarabun-bold">
            <>
                {/* Scene */}
                <section className="relative z-20 flex items-start justify-center">
                    <div className="w-full">
                        {!loading && sceneData.length > 0 && (
                            <CurrentSceneComponent
                                scene={sceneData[currentScene]}
                                onNext={handleNext}
                                onBack={handleBack}
                                handleSkip={handleSkip}
                                currentScene={currentScene}
                                totalScenes={scenes.length}
                                onStartGame={handleStartGame}
                            />
                        )}
                    </div>
                </section>
            </>
        </main>
    );
}