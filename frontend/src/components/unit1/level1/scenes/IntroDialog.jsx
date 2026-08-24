import { IoMdSkipBackward } from "react-icons/io";

export default function IntroDialog({
    speaker,
    title,
    text,
    onNext,
    onBack,
    showBack = true,
    nextText = "ต่อไป",
    currentScene = 0,
    totalScenes = 5,
}) {
    return (
        <div
            className="
                relative mx-auto w-[60%] h-[240px]
                bg-black/60 backdrop-blur-sm border-2 border-white/50 rounded-2xl text-white
                px-6 pb-5 pt-8
                shadow-2xl
                md:px-9 md:pb-7
                sarabun-bold
            "
        >
            {/* Speaker name */}
            <div
                className="
                    absolute -top-7 left-6
                    rounded-2xl border-2 border-white/50
                    bg-blue-200 px-6 py-2
                    shadow-lg
                "
            >
                <p className="text-base font-black text-black md:text-lg">
                    {speaker}
                </p>
            </div>

            {/* Dialog content */}
            <div className="mt-1">
                {title && (
                    <h2 className="mb-1 text-lg font-black md:text-2xl drop-shadow-md">
                        {title}
                    </h2>
                )}

                <p className="min-h-[72px] text-sm leading-normal md:text-lg whitespace-pre-wrap drop-shadow-md">
                    {text}
                </p>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between gap-4">
                {showBack ? (
                    <button
                        type="button"
                        onClick={onBack}
                        className="button-with-icon-introScenes button-gray icon-left"
                    >
                        <span className="icon">◀</span>
                        <span className="text">ย้อนกลับ</span>
                    </button>
                ) : (
                    <div className="w-[110px]" />
                )}

                {/* Scene indicators */}
                <div className="hidden items-center gap-2 sm:flex">
                    {Array.from({ length: totalScenes }).map((_, index) => (
                        <div
                            key={index}
                            className={`
                                w-3 h-3 rounded-full transition-all duration-300
                                ${index === currentScene
                                    ? "w-8 bg-blue-300"
                                    : "w-3 bg-slate-300"
                                }
                            `}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    className="button-with-icon-introScenes button-blue icon-right"
                >
                    <span className="text">{nextText}</span>
                    <span className="icon">▶</span>
                </button>
            </div>
        </div>
    );
}