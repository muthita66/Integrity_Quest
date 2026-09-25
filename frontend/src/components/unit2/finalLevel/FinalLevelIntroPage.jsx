import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdSkipForward } from "react-icons/io";

import "../../../styles/unit1/Level1/MirrorIntro.css";

import bgGame from "../../../assets/bg_game.png";

import SceneOne from "./scenes/SceneOneIntro";
import SceneTwo from "./scenes/SceneTwoIntro";
import SceneThree from "./scenes/SceneThreeIntro";
import SceneMission from "./scenes/SceneMission";


export default function FinalLevelIntroPage({ startMission, initialStep = 0 }) {
    const navigate = useNavigate();
    const [currentScene, setCurrentScene] = useState(initialStep);

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

    // fetch Scene Data จาก Database
    useEffect(() => {
        const fetchScenes = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    "http://localhost:5000/api/introDialog/level/7"
                );
                if (!response.ok) {
                    throw new Error("ไม่สามารถดึงข้อมูล Scene ของ Unit 2 Final Level ได้");
                }
                const data = await response.json();
                setSceneData(data);
            } catch (error) {
                console.error("Error fetching Unit 2 Final Level scenes:", error);
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
            if (startMission) startMission();
            else navigate("/unit2/final");
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


    return (
        <main className="mirror-scene min-h-screen relative overflow-hidden">
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
                        />
                    )}
                </div>
            </section>
        </main>
    );
}