import { AnimatePresence } from "framer-motion";

import Bubble from "./components/Bubble";
import BubbleParticles from "./components/BubbleParticles";
import GameHeader from "./components/GameHeader";
import Background from "./components/Background";
import BossSection from "./components/BossSection";
import NavBar from "./components/Navbar";

import BgBubble from "../../../assets/unit1/level2/bgBubble.png"

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import useBubbleGame from "./hooks/useBubbleGame";

export default function BubbleShooterPage() {
    const {
        bubbles,
        score,
        gameStatus,
        showBoss,
        particles,
        handleShoot,
        restartGame,
        finishBoss,
        failBoss,
    } = useBubbleGame();
    const navigate = useNavigate();

    useEffect(() => {
        if (gameStatus === "win" || gameStatus === "lose") {
            localStorage.setItem("bubbleScore", score);
            localStorage.setItem("bubbleStatus", gameStatus);
            // wait a little bit to let user see particles before redirect (optional, but instant is fine)
            navigate("/unit1/level2/result");
        }
    }, [gameStatus, navigate, score]);

    return (
        <Background>
            <div className="h-screen w-full overflow-hidden flex flex-col pb-4">
                <GameHeader score={score} />

                {/* NavBar และพื้นที่เกมใช้ความกว้างเดียวกัน */}
                <div className="mx-auto mt-4 w-[1160px] max-w-[calc(100vw-2rem)] border-4 border-black flex flex-col flex-1 min-h-0">
                    <NavBar />

                    <div
                        className="
                            relative
                            flex-1
                            w-full
                            overflow-hidden
                            border-4
                            border-t-0
                            border-black
                            sarabun-bold
                        "
                        style={{
                            backgroundImage: `url("${BgBubble}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        <AnimatePresence>
                            {bubbles.map((bubble) => (
                                <Bubble
                                    key={bubble.id}
                                    bubble={bubble}
                                    onShoot={handleShoot}
                                />
                            ))}
                        </AnimatePresence>

                        <BubbleParticles particles={particles} />

                        <BossSection
                            open={showBoss && gameStatus === "playing"}
                            onFinish={finishBoss}
                            onFail={failBoss}
                        />
                    </div>
                </div>
            </div>
        </Background>
    );
}