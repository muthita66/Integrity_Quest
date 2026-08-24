import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdSkipForward } from "react-icons/io";

import "../../../styles/unit1/Level1/MirrorIntro.css";

import bgMarket from "../../../assets/unit2/Level1/intro/bgmarket.jpg";

import IntroSound from "../../../assets/sounds/IntroSound.mp3";
import uiSoundSfx from "../../../assets/sounds/ui_sounds.mp3";

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

export default function Unit2IntroPage() {
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

    const textAudioRef = useRef(new Audio(IntroSound));
    const uiSoundSfxAudioRef = useRef(new Audio(uiSoundSfx));

    const handleInitialClick = () => {
        if (!hasStarted) {
            textAudioRef.current.play().then(() => {
                textAudioRef.current.pause();
                textAudioRef.current.currentTime = 0;
            }).catch(() => { });

            uiSoundSfxAudioRef.current.play().then(() => {
                uiSoundSfxAudioRef.current.pause();
                uiSoundSfxAudioRef.current.currentTime = 0;
            }).catch(() => { });

            setHasStarted(true);
        }
    };

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene((prev) => prev + 1);
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
        <main
            className="mirror-scene min-h-screen relative overflow-hidden"
            style={{ cursor: hasStarted ? "default" : "pointer" }}
            onClick={!hasStarted ? handleInitialClick : undefined}
        >
            {/* Background */}
            <div
                className="mirror-scene__bg absolute inset-0"
                style={{ backgroundImage: `url(${bgMarket})` }}
            />
            <div className="mirror-scene__vignette absolute inset-0" />

            {/* Sweep light */}
            {hasStarted && <div className="mirror-scene__sweep" />}

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