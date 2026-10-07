import { motion } from "framer-motion";
import { useState } from "react";

// Keep the component dependency-free while still handling Thai combining marks.
const segmenter = typeof Intl !== "undefined" && Intl.Segmenter
    ? new Intl.Segmenter("th", { granularity: "grapheme" })
    : null;

const splitGraphemes = (value) => segmenter
    ? Array.from(segmenter.segment(value), ({ segment }) => segment)
    : Array.from(value);

const rotations = [-1, 1, -0.5, 1.5, 0, -1];

// word มาจาก backend: { id, word_id, clue, totalChars, revealedChars }
// (ไม่มีคำตอบเต็มอยู่ในหน้าเว็บแล้ว — กด Enter ส่งไปให้ backend ตรวจ)
export default function WordCard({ word, completed, onSubmit }) {
    const revealedCount = word.revealedChars.length;
    const remainingCount = Math.max(0, word.totalChars - revealedCount);
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");
    const [checking, setChecking] = useState(false);

    const typedChars = splitGraphemes(inputValue);

    // ช่องตัวอักษร: ตัวที่เปิดให้ + ตัวที่ผู้เล่นพิมพ์ (ถ้าพิมพ์ทั้งคำ ให้ข้ามส่วนที่เปิดไว้)
    const typedTail =
        typedChars.slice(0, revealedCount).join("") === word.revealedChars.join("")
            ? typedChars.slice(revealedCount)
            : typedChars;

    const submit = async () => {
        const text = inputValue.trim();
        if (!text || checking || completed) return;

        setChecking(true);
        setError("");

        try {
            const correct = await onSubmit(word, text);
            if (!correct) setError("ยังไม่ตรงกับคำใบ้ ลองอีกครั้ง");
        } catch (err) {
            setError(err.message || "ตรวจคำตอบไม่สำเร็จ ลองอีกครั้ง");
        } finally {
            setChecking(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`
                relative
                w-full
                max-w-[225px]
                min-h-[150px] [@media(max-height:820px)]:min-h-[128px]
                p-4 [@media(max-height:820px)]:p-3
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
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3 [@media(max-height:820px)]:mb-2 mt-1">
                        {Array.from({ length: word.totalChars }, (_, index) => {
                            const revealed = index < revealedCount;

                            return (
                                <div
                                    key={index}
                                    className="
                                        w-8 [@media(max-height:820px)]:w-7
                                        h-8 [@media(max-height:820px)]:h-7
                                        bg-white
                                        border-b-[3px]
                                        border-[#7b6145]
                                        rounded-sm
                                        flex
                                        items-center
                                        justify-center
                                        text-[21px] [@media(max-height:820px)]:text-[18px]
                                        font-black
                                        text-[#120700]
                                        shadow-sm
                                    "
                                >
                                    {revealed
                                        ? word.revealedChars[index]
                                        : typedTail[index - revealedCount] || ""}
                                </div>
                            );
                        })}
                    </div>

                    {/* Input */}
                    <input
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setError("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") submit();
                        }}
                        readOnly={checking}
                        aria-label={`คำตอบของคำใบ้: ${word.clue}`}
                        aria-invalid={Boolean(error)}
                        placeholder={checking ? "กำลังตรวจ..." : `พิมพ์ ${remainingCount} ตัว แล้วกด Enter`}
                        className={`
                            w-full
                            py-2 [@media(max-height:820px)]:py-1.5
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
                    {error && <p className="mt-1 text-center text-[11px] font-bold text-red-700">{error}</p>}
                </>
            )}
        </motion.div>
    );
}