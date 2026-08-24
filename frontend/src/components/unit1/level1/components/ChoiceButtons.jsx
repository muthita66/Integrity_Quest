import React from "react";
import { motion } from "framer-motion";

export default function ChoiceButtons({ question, handleAnswer, reaction, playUI, show }) {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-[22%] left-1/2 -translate-x-1/2 w-[90%] md:w-[85%] flex flex-col md:flex-row items-stretch gap-4 z-40"
        >
            <button
                onClick={() => handleAnswer("A")}
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
                    shadow-lg shadow-neutral-950
                    px-6
                    transition-all
                    duration-500
                    ease-in-out
                    hover:scale-105
                    hover:brightness-110
                    active:scale-95
                    flex flex-col
                    items-center
                    justify-center
                    text-center
                ">

                <div className="font-black text-3xl mb-3">A</div>
                <p className="text-base">{question.A}</p>
            </button>

            <button
                onClick={() => handleAnswer("B")}
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
                    shadow-lg shadow-neutral-950
                    px-6
                    transition-all
                    duration-500
                    ease-in-out
                    hover:scale-105
                    hover:brightness-110
                    active:scale-95
                    flex flex-col
                    items-center
                    justify-center
                    text-center
                ">

                <div className="font-black text-3xl mb-3">B</div>
                <p className="text-base">{question.B}</p>
            </button>
        </motion.div>
    );
}
