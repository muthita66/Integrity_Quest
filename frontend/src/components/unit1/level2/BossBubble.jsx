import { AnimatePresence } from "framer-motion";

import BossQuestionCard from "./components/BossQuestionCard";
import BossParticles from "./components/BossParticles";
import BossFailModal from "./components/BossFailModal";

import useBossGame from "./hooks/useBossGame";
import useGameSound from "./hooks/useGameSound";



export default function BossBubble({
    onFinish,
    onFail,
}) {
    const {
        playHoverSound,
        playPopSound,
    } = useGameSound();

    const {
        currentQuestion,
        flashStatus,
        isDefeated,
        particles,
        showFailPopup,
        handleAnswer,
        handleFail,
    } = useBossGame({
        onFinish,
        onFail,
        playPopSound,
    });

    if (!currentQuestion) {
        return null;
    }

    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                overflow-hidden
                bg-black/80
            "
        >
            <AnimatePresence>
                {!isDefeated && (
                    <BossQuestionCard
                        question={
                            currentQuestion.question
                        }
                        choices={
                            currentQuestion.choices
                        }
                        flashStatus={
                            flashStatus
                        }
                        disabled={
                            Boolean(
                                flashStatus
                            ) ||
                            showFailPopup
                        }
                        onAnswer={
                            handleAnswer
                        }
                        onHover={
                            playHoverSound
                        }
                    />
                )}
            </AnimatePresence>

            <BossParticles
                particles={particles}
            />

            <BossFailModal
                open={showFailPopup}
                onFail={handleFail}
                title="ตอบผิด!"
                message={
                    "คุณหลงเชื่อข้ออ้างของการโกง\nลองกลับไปเริ่มใหม่อีกครั้ง"
                }
            />
        </div>
    );
}