import React from "react";
import { motion } from "framer-motion";

export default function ChoiceButtons({
    question,
    handleAnswer,
    reaction,
    playUI,
    show,
}) {
    if (!show) return null;
    const choices = question?.choice || [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="
                absolute
                bottom-[22%]
                left-1/2
                -translate-x-1/2
                w-[90%]
                md:w-[85%]
                flex
                flex-col
                md:flex-row
                items-stretch
                gap-4
                z-40
            "
        >
            {choices.map((choice) => (
                <button
                    key={choice.choice_id}
                    onClick={() => handleAnswer(choice.choice_key)}
                    onMouseEnter={() => playUI && playUI()}
                    disabled={reaction !== null}
                    className="
                        flex-1
                        h-[120px]
                        bg-blue-200
                        hover:bg-blue-400
                        text-black
                        hover:text-white
                        font-bold
                        rounded-3xl
                        shadow-lg
                        shadow-neutral-950
                        px-6
                        transition-all
                        duration-500
                        ease-in-out
                        hover:scale-105
                        hover:brightness-110
                        active:scale-95
                        flex
                        flex-col
                        items-center
                        justify-center
                        text-center
                    "
                >
                    {/* Choice Key */}
                    <div className="font-black text-3xl mb-3">
                        {choice.choice_key}
                    </div>

                    {/* Choice Text */}
                    <p className="text-base">
                        {choice.choice_text}
                    </p>
                </button>
            ))}
        </motion.div>
    );
}