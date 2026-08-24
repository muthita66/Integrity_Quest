import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import GraphemeSplitter from "grapheme-splitter";

const splitter = new GraphemeSplitter();
const rotations = [-1, 1, -0.5, 1.5, 0, -1];

export default function WordCard({ word, completed, onCorrect }) {
    const chars = splitter.splitGraphemes(word.answer);
    const [inputValue, setInputValue] = useState("");

    useEffect(() => {
        if (inputValue.trim() === word.answer && !completed) {
            onCorrect(word.id);
        }
    }, [inputValue, completed, onCorrect, word.id, word.answer]);

    const typedChars = splitter.splitGraphemes(inputValue);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`
                relative
                w-[225px]
                h-[175px]
                p-5
                rounded-sm
                shadow-[3px_5px_12px_rgba(0,0,0,0.45)]
                transition-all
                duration-300
                ${completed
                    ? "bg-[#dff3d8] border-2 border-[#4b8b45]"
                    : "bg-[#f4ead9] border border-[#c9b89e]"
                }
            `}
            style={{ rotate: `${rotations[word.id - 1]}deg` }}
        >
            {/* หมุดปัก */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#2f87d8] border border-[#175a93] shadow-md" />

            {completed ? (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col justify-center items-center h-full"
                >
                    <div className="text-[22px] font-black text-[#245d23] tracking-wide text-center">
                        พบหลักฐานแล้ว
                    </div>

                    <div className="mt-3 text-[14px] font-bold text-[#356a34] opacity-90">
                        หลักฐานถูกบันทึกเรียบร้อย
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* ช่องตัวอักษร */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4 mt-1">
                        {chars.map((char, index) => {
                            const revealed = index < word.revealed;

                            return (
                                <div
                                    key={index}
                                    className="
                                        w-9
                                        h-10
                                        bg-white
                                        border-b-[3px]
                                        border-[#7b6145]
                                        rounded-sm
                                        flex
                                        items-center
                                        justify-center
                                        text-[26px]
                                        font-black
                                        text-[#120700]
                                        shadow-sm
                                    "
                                >
                                    {revealed
                                        ? char
                                        : typedChars[index - word.revealed] || ""}
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="พิมพ์คำตอบ..."
                        className="
                            w-full
                            py-2
                            px-2
                            bg-white
                            border
                            rounded-sm
                            text-center
                            text-[15px]
                            font-black
                            text-[#140700]
                            placeholder:text-[#7b5d42]
                            placeholder:font-bold
                            shadow-inner
                            focus:outline-none
                            focus:bg-white
                        "
                    />
                </>
            )}
        </motion.div>
    );
}