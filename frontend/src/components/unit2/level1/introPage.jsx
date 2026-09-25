import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "../../../styles/unit1/Level1/MirrorIntro.css";

import bgMarket from "../../../assets/unit2/Level1/intro/bgmarket.png";

import SceneOne from "./scenes/SceneOneIntro";
import SceneTwo from "./scenes/SceneTwoIntro";
import SceneThree from "./scenes/SceneThreeIntro";
import SceneMission from "./scenes/SceneMission";

const SHIMMER_DOTS = [
    { left: "12%", delay: "0s", duration: "9s", size: 3 },
    { left: "22%", delay: "2.4s", duration: "11s", size: 2 },
    { left: "38%", delay: "1.1s", duration: "8s", size: 2 },
    { left: "55%", delay: "3.6s", duration: "12s", size: 3 },
    { left: "68%", delay: "0.6s", duration: "10s", size: 2 },
    { left: "80%", delay: "2s", duration: "9.5s", size: 2 },
    { left: "90%", delay: "4s", duration: "11.5s", size: 3 },
];

const scenes = [
    SceneOne,
    SceneTwo,
    SceneThree,
    SceneMission,
];

export default function Unit2IntroPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const initialScene = state?.startAtMission ? scenes.length - 1 : 0;

    const [currentScene, setCurrentScene] = useState(initialScene);

    // Scene Data จาก Database
    const [sceneData, setSceneData] = useState([]);
    const [loading, setLoading] = useState(true);

    const CurrentSceneComponent = scenes[currentScene];

    // fetch Scene Data จาก Database
    useEffect(() => {
        const fetchScenes = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    "http://localhost:5000/api/introDialog/level/5"
                );

                if (!response.ok) {
                    throw new Error(
                        "ไม่สามารถดึงข้อมูล Scene ของ Unit 2 Level 1 ได้"
                    );
                }

                const data = await response.json();

                console.log("Unit 2 Level 1 Scene Data:", data);

                setSceneData(data);

            } catch (error) {
                console.error(
                    "Error fetching Unit 2 Level 1 scenes:",
                    error
                );
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
            navigate("/unit2/level1");
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
            {/* Background */}
            <div
                className="mirror-scene__bg absolute inset-0"
                style={{ backgroundImage: `url(${bgMarket})` }}
            />
            <div className="mirror-scene__vignette absolute inset-0" />

            {/* Sweep light */}
            <div className="mirror-scene__sweep" />

            {/* Particles */}
            <div className="mirror-scene__particles">
                {SHIMMER_DOTS.map((dot, i) => (
                    <span
                        key={i}
                        className="mirror-scene__dot"
                        style={{
                            left: dot.left,
                            width: dot.size,
                            height: dot.size,
                            animationDelay: dot.delay,
                            animationDuration: dot.duration,
                        }}
                    />
                ))}
            </div>
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
                            />
                        )}
                    </div>
                </section>
            </>
        </main>
    );
}