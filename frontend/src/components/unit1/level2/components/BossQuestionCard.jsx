import { motion } from "framer-motion";

import bossBubble from "../../../../assets/unit1/level2/bossBubble.jpg";

import BossChoiceButton from "./BossChoiceButton";

export default function BossQuestionCard({
    question = "",
    choices = [],
    flashStatus = null,
    disabled = false,
    onAnswer,
    onHover,
}) {
    const getAnimation = () => {
        if (
            flashStatus === "correct"
        ) {
            return {
                scale: [
                    1,
                    1.05,
                    1,
                    1.05,
                    1,
                ],
                y: [
                    0,
                    -20,
                    0,
                    -20,
                    0,
                ],
                filter: [
                    "drop-shadow(0 0 0px rgba(74,222,128,0))",
                    "drop-shadow(0 0 30px rgba(196,229,209,1))",
                    "drop-shadow(0 0 0px rgba(74,222,128,0))",
                ],
            };
        }

        if (flashStatus === "wrong") {
            return {
                scale: [
                    1,
                    1.05,
                    1,
                    1.05,
                    1,
                ],
                y: [
                    0,
                    -20,
                    0,
                    -20,
                    0,
                ],
                filter: [
                    "drop-shadow(0 0 0px rgba(248,113,113,0))",
                    "drop-shadow(0 0 30px rgba(248,113,113,1))",
                    "drop-shadow(0 0 0px rgba(248,113,113,0))",
                ],
            };
        }

        return {
            scale: 1,
            y: [0, -15, 0],
        };
    };

    const getTransition = () => {
        if (flashStatus) {
            return {
                duration: 0.5,
            };
        }

        return {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
        };
    };

    return (
        <motion.div
            className="relative"
            animate={getAnimation()}
            transition={getTransition()}
            exit={{
                scale: 1.5,
                opacity: 0,
                filter:
                    "brightness(1.5) blur(10px)",
                transition: {
                    duration: 0.5,
                    ease: "easeOut",
                },
            }}
            style={{
                filter:
                    "drop-shadow(0 0 20px rgba(255,255,255,0.8))",
            }}
        >
            <img
                src={bossBubble}
                alt="บอสฟองข้ออ้าง"
                className="w-[590px]"
            />

            <div
                className="
                    absolute
                    inset-0
                    flex
                    flex-col
                    items-center
                    justify-center
                    px-10
                "
            >
                <h2
                    className="
                        mb-6
                        text-center
                        text-xl
                        font-bold
                        text-black
                    "
                >
                    {question}
                </h2>

                <div
                    className="
                        mt-2
                        flex
                        w-full
                        justify-center
                        gap-5
                    "
                >
                    {choices.map(
                        (choice) => (
                            <BossChoiceButton
                                key={
                                    choice.value
                                }
                                text={
                                    choice.text
                                }
                                value={
                                    choice.value
                                }
                                disabled={
                                    disabled
                                }
                                onAnswer={
                                    onAnswer
                                }
                                onHover={
                                    onHover
                                }
                            />
                        )
                    )}
                </div>
            </div>
        </motion.div>
    );
}