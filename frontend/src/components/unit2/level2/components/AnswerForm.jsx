import FeedbackMessage from "./FeedbackMessage";

export default function AnswerForm({
    userInput,
    setUserInput,
    feedback,
    handleSubmit,
    buttonText,
    hint,
    hasMistakeOnCurrent,
}) {
    return (
        <form
            onSubmit={handleSubmit}
            className="
                w-full
                flex
                flex-col
                md:flex-row
                gap-3
                md:gap-4
                items-center
            "
        >

            {/* Input */}
            <div className="relative flex-1 w-full">

                <input
                    type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="พิมพ์ตัวเลขคำตอบ..."
                    disabled={feedback !== null}
                    className={`
                        w-full
                        text-center
                        text-lg
                        md:text-2xl
                        font-bold
                        placeholder:text-sm
                        md:placeholder:text-base
                        placeholder:font-medium
                        py-3
                        md:py-3.5
                        px-5
                        md:px-6
                        rounded-2xl
                        border-4
                        outline-none
                        transition-all

                        ${
                            feedback === "correct"
                                ? "border-emerald-500 bg-emerald-50 text-emerald-700"

                                : feedback === "wrong"
                                ? "border-rose-500 bg-rose-50 animate-shake"

                                : feedback === "timeout"
                                ? "border-slate-400 bg-slate-100 text-slate-400"

                                : "border-[#D6B879] bg-white/80 text-[#3D2B1F] focus:border-[#B8874A] focus:bg-white shadow-inner"
                        }
                    `}
                />

                <FeedbackMessage
                    feedback={feedback}
                    hint={hint}
                    hasMistakeOnCurrent={hasMistakeOnCurrent}
                />

            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!userInput || feedback !== null}
                className={`
                    w-full
                    md:w-auto
                    min-w-[150px]
                    py-3.5
                    px-8
                    rounded-2xl
                    font-sara
                    font-black
                    text-lg
                    shadow-lg
                    transform
                    transition-all
                    active:scale-95
                    whitespace-nowrap
                    shrink-0

                    ${
                        !userInput || feedback !== null
                            ? "button-with-icon cursor-not-allowed opacity-60"
                            : "button-with-icon hover:scale-105"
                    }
                `}
            >
                {buttonText}
            </button>

        </form>
    );
}