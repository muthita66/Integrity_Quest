import React from "react";
import { motion } from "framer-motion";

export default function QuestionBox({ text, show, isTyping = true }) {
    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[92%] md:w-[85%] bg-slate-900/90 backdrop-blur-sm p-4 md:p-5 text-white z-30 rounded-2xl"
        >
            <p className="text-center text-base md:text-xl">
                {text}
                {isTyping && <span className="animate-pulse"></span>}
            </p>
        </motion.div>
    );
}
