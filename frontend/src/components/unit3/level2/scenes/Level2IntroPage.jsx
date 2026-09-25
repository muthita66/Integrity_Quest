import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneFour from "./SceneFour";
import SceneMission from "./SceneMission";
import IntroDialog from "./IntroDialog";
import { IoMdSkipForward } from "react-icons/io";

import bgLevel2 from "../../../../assets/unit3/level2/bgLevel2.png"

const scenes = [
    SceneOne,
    SceneTwo,
    SceneThree,
    SceneFour,
    SceneMission,
];

export default function Level2IntroPage() {
    const navigate = useNavigate();
    const [currentScene, setCurrentScene] = useState(0);

    // Scene Data จาก Database
    const [sceneData, setSceneData] = useState([]);
    const [loading, setLoading] = useState(true);

    // fetch Scene Data จาก Database
    useEffect(() => {
        const fetchScenes = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    "http://localhost:5000/api/introDialog/level/9"
                );

                if (!response.ok) {
                    throw new Error(
                        "ไม่สามารถดึงข้อมูล Scene ของ Unit 3 Level 2 ได้"
                    );
                }

                const data = await response.json();

                console.log("Unit 3 Level 2 Scene Data:", data);

                setSceneData(data);

            } catch (error) {
                console.error(
                    "Error fetching Unit 3 Level 2 scenes:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchScenes();
    }, []);

    const CurrentScene = scenes[currentScene];

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene((previous) => previous + 1);
        } else {
            navigate("/unit3/level2/game");
        }
    };

    const handleBack = () => {
        if (currentScene > 0) {
            setCurrentScene((previous) => previous - 1);
        }
    };

    const handleSkip = () => {
        setCurrentScene(scenes.length - 1);
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-black font-sara">

            <button
                type="button"
                onClick={handleSkip}
                className={`
                                absolute top-4 right-4 z-50
                                rounded-full border-2 border-white/80
                                bg-black/40 p-2
                                text-white shadow-lg
                                backdrop-blur-sm
                                transition-all duration-300
                                hover:scale-105 hover:bg-black/60
                                active:scale-95
                                ${currentScene < scenes.length - 1 ? "" : "invisible"}
                            `}
            >
                <IoMdSkipForward className="text-2xl" />
            </button>

            {/* Scene */}
            <section className="relative z-20 flex items-start justify-center">

                <div className="w-full">

                    {!loading && sceneData.length > 0 && (
                        <CurrentScene
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

            {/* Dialog positioned relative to main */}
            {currentScene < 4 && !loading && sceneData.length > 0 && (
                <div className="absolute bottom-10 left-0 w-full z-30">
                    <IntroDialog
                        speaker={sceneData[currentScene]?.introDialog?.[0]?.speaker}
                        title={sceneData[currentScene]?.introDialog?.[0]?.title}
                        text={sceneData[currentScene]?.introDialog?.[0]?.text}
                        lesson={sceneData[currentScene]?.introDialog?.[0]?.lesson}
                        onNext={handleNext}
                        onBack={handleBack}
                        showBack={currentScene > 0}
                        nextText={sceneData[currentScene]?.introDialog?.[0]?.nextText || "ต่อไป"}
                        currentScene={currentScene}
                        totalScenes={4}
                    />
                </div>
            )}
        </main>
    );
}