import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdSkipForward } from "react-icons/io";

import bgGameLevel2 from "../../../../assets/unit1/level2/bgGameLevel2.png";
import Tolsetmusic from "../../../../assets/sounds/tolsetmusic.mp3";
import uiSoundSfx from "../../../../assets/sounds/ui_sounds.mp3";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneMission from "./SceneMission";

export default function Level2IntroPage() {
    const navigate = useNavigate();
    const [hasStarted, setHasStarted] = useState(false);
    const [currentScene, setCurrentScene] = useState(0);

    const scenes = [
        SceneOne,
        SceneTwo,
        SceneThree,
        SceneMission,
    ];

    const CurrentSceneComponent = scenes[currentScene];

    const tolsetmusicAudioRef = useRef(new Audio(Tolsetmusic));
    const uiSoundSfxAudioRef = useRef(new Audio(uiSoundSfx));

    useEffect(() => {
        const bgm = tolsetmusicAudioRef.current;
        return () => {
            bgm.pause();
            bgm.currentTime = 0;
        };
    }, []);

    const handleInitialClick = () => {
        if (!hasStarted) {
            const audio = tolsetmusicAudioRef.current;
            audio.loop = true;
            audio.volume = 0.4;
            audio.play().catch(() => { });

            const sfx = uiSoundSfxAudioRef.current;
            sfx.volume = 0.5;
            sfx.play().then(() => {
                sfx.pause();
                sfx.currentTime = 0;
            }).catch(() => { });

            setHasStarted(true);
        }
    };

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene((prev) => prev + 1);
        } else {
            handleStartGame();
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
        const bgm = tolsetmusicAudioRef.current;
        bgm.pause();
        bgm.currentTime = 0;

        navigate("/unit1/level2");
    };

    return (
        <main className="min-h-screen relative overflow-hidden bg-black">
            <>
                {/* Scene */}
                <section className="relative z-20 flex items-start justify-center">
                    <div className="w-full">
                        <CurrentSceneComponent
                            onNext={handleNext}
                            onBack={handleBack}
                            handleSkip={handleSkip}
                            currentScene={currentScene}
                            totalScenes={scenes.length}
                        />
                    </div>
                </section>
            </>
        </main>
    );
}
