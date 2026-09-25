import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneMission from "./SceneMission";

export default function Level2IntroPage() {
    const navigate = useNavigate();

    const [currentScene, setCurrentScene] = useState(0);

    // Scene ทั้งหมดของ Level 2
    const scenes = [
        SceneOne,
        SceneTwo,
        SceneThree,
        SceneMission,
    ];

    const CurrentSceneComponent = scenes[currentScene];

    // Scene Data จาก Database
    const [sceneData, setSceneData] = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch Scene Data
    useEffect(() => {
        const fetchScenes = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    "http://localhost:5000/api/introDialog/level/2"
                );

                if (!response.ok) {
                    throw new Error(
                        "ไม่สามารถดึงข้อมูล Scene ของ Level 2 ได้"
                    );
                }

                const data = await response.json();

                console.log("Level 2 Scene Data:", data);

                setSceneData(data);

            } catch (error) {
                console.error(
                    "Error fetching Level 2 scenes:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchScenes();
    }, []);

    // Next
    const handleNext = () => {

        if (currentScene < scenes.length - 1) {

            setCurrentScene((prev) => prev + 1);

        } else {

            handleStartGame();

        }
    };

    // Back
    const handleBack = () => {

        if (currentScene > 0) {

            setCurrentScene((prev) => prev - 1);

        }
    };

    // Skip
    const handleSkip = () => {

        setCurrentScene(scenes.length - 1);

    };

    // startGame
    const handleStartGame = () => {

        navigate("/unit1/level2");
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <p className="text-xl sarabun-bold">
                    กำลังโหลดข้อมูล...
                </p>
            </main>
        );
    }

    // ถ้าไม่มีข้อมูล
    if (!sceneData.length) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-black text-white">
                <p className="text-xl sarabun-bold">
                    ไม่พบข้อมูล Scene ของ Level 2
                </p>
            </main>
        );
    }

    // Main
    return (
        <main className="min-h-screen relative overflow-hidden bg-black">
            <section className="relative z-20 flex items-start justify-center">
                <div className="w-full">
                    <CurrentSceneComponent
                        scene={sceneData[currentScene]}
                        onNext={handleNext}
                        onBack={handleBack}
                        handleSkip={handleSkip}
                        currentScene={currentScene}
                        totalScenes={scenes.length}
                    />
                </div>
            </section>
        </main>
    );
}