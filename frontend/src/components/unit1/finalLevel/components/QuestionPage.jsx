import { useMemo } from "react";
import { CASES } from "../data/cases";
export default function QuestionPage({
    currentCase,
    selected,
    onSelect,
    onSubmit,
    caseIdx,
}) {
    const background = CASES[caseIdx]?.background;

    const shuffledOptions = useMemo(() => {
        const arr = currentCase.options.map((opt, i) => ({ text: opt, originalIndex: i }));
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [currentCase.id]);

    return (
        <div
            className="relative min-h-dvh w-full overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${currentCase.background})`,
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* เนื้อหา */}
            <div className="relative z-10 flex min-h-dvh items-center justify-center p-4 md:p-6">

                {/* กล่องแฟ้มคดี */}
                <div
                    className="w-full max-w-5xl rounded-3xl border-2 p-8 md:p-10 shadow-2xl"
                    style={{
                        background: "rgba(243,233,210,0.92)",
                        borderColor: "#9A7B4F",
                        backdropFilter: "blur(16px)",
                    }}
                >
                    <span
                        className="text-lg font-semibold tracking-wide"
                        style={{ color: "#8A6D3B" }}
                    >
                        {currentCase.code} คำถาม
                    </span>

                    <p
                        className="mt-2 mb-6 text-lg md:text-xl font-bold leading-relaxed"
                        style={{ color: "#2B2118" }}
                    >
                        {currentCase.question}
                    </p>

                    <div className="space-y-3 mb-6">
                        {shuffledOptions.map((optItem, index) => (
                            <button
                                key={`${currentCase.id}-${optItem.originalIndex}`}
                                type="button"
                                onClick={() => onSelect(optItem.originalIndex)}
                                className="w-full text-left text-base px-5 py-4 rounded-xl border-2 flex items-center gap-4 transition hover:scale-[1.01]"
                                style={{
                                    borderColor: selected === optItem.originalIndex ? "#2B2118" : "#C9BB98",
                                    backgroundColor:
                                        selected === optItem.originalIndex ? "#EDE1C4" : "rgba(255,255,255,0.4)",
                                    color: "#3A2E1B",
                                }}
                            >
                                <span
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                                    style={{
                                        backgroundColor:
                                            selected === optItem.originalIndex ? "#2B2118" : "#DCCFB0",
                                        color:
                                            selected === optItem.originalIndex ? "#F3E9D2" : "#5A4B30",
                                    }}
                                >
                                    {String.fromCharCode(65 + index)}
                                </span>

                                <span className="flex-1 leading-snug">
                                    {optItem.text}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            type="button"
                            disabled={selected === null}
                            onClick={onSubmit}
                            className="result-button result-button-amber"
                        >
                            <span className="result-button-top px-8 py-3 text-lg">ยืนยันคำตอบ</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
}
