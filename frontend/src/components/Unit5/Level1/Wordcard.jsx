import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Keep the component dependency-free while still handling Thai combining marks.
const segmenter = typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("th", { granularity: "grapheme" })
    : null;

const splitGraphemes = (value) => segmenter
    ? Array.from(segmenter.segment(value), ({ segment }) => segment)
    : Array.from(value);

const rotations = [-1, 1, -0.5, 1.5, 0, -1];

export default function WordCard({ word, completed, onCorrect }) {
    const chars = splitGraphemes(word.answer);
    const remainingAnswer = chars.slice(word.revealed).join("");
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState(false);

    useEffect(() => {
        const answer = inputValue.trim();
        if ((answer === word.answer || answer === remainingAnswer) && !completed) {
            onCorrect(word.id);
        }
    }, [inputValue, completed, onCorrect, word.id, word.answer, remainingAnswer]);

    const typedChars = splitGraphemes(inputValue);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`
                relative
                w-full
                max-w-[225px]
                h-[150px]
                p-4
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
                <div className="flex flex-wrap justify-center gap-1.5 mb-3 mt-1">
                        {chars.map((char, index) => {
                            const revealed = index < word.revealed;

                            return (
                                <div
                                    key={index}
                                    className="
                                        w-8
                                        h-8
                                        bg-white
                                        border-b-[3px]
                                        border-[#7b6145]
                                        rounded-sm
                                        flex
                                        items-center
                                        justify-center
                                        text-[21px]
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
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError(false);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && inputValue.trim() !== word.answer && inputValue.trim() !== remainingAnswer) {
                                setError(true);
                            }
                        }}
                        aria-label={`คำตอบของคำใบ้: ${word.clue}`}
                        aria-invalid={error}
                        placeholder={`พิมพ์ ${remainingAnswer.length} ตัวอักษรที่เหลือ`}
                        className={`
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
                            focus:ring-2
                            focus:ring-amber-400/70
                            ${error ? "border-red-500 bg-red-50" : "border-[#c9b89e]"}
                        `}
                    />
                    {error && <p className="mt-1 text-center text-[11px] font-bold text-red-700">ยังไม่ตรงกับคำใบ้ ลองอีกครั้ง</p>}
                </>
            )}
        </motion.div>
    );
}
