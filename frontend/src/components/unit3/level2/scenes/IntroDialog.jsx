import { IoMdSkipBackward } from "react-icons/io";
import { FaLightbulb } from "react-icons/fa6";

export default function IntroDialog({
    speaker,
    title,
    text,
    lesson,
    description,
    onNext,
    onBack,
    showBack = true,
    nextText = "ต่อไป",
    currentScene = 0,
    totalScenes = 5,
}) {
    const displaySpeaker = speaker || sceneData?.speaker;
    const displayText = text || sceneData?.text;
    const displayLesson = lesson || sceneData?.lesson;
    return (
        <div
            className="
                relative mx-auto w-[60%] h-[240px]
                bg-black/40 backdrop-blur-sm border-2 border-white/50 rounded-2xl text-white
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
                    bg-yellow-200 px-6 py-2
                    shadow-lg
                "
            >
                <p className="text-base font-black text-black md:text-lg">
                    {displaySpeaker}
                </p>
            </div>

            {/* Dialog content */}
            <div className="mt-1">
                {title && (
                    <h2 className="mb-1 text-lg font-black md:text-2xl drop-shadow-md">
                        {title}
                    </h2>
                )}

                <p className="text-sm leading-normal md:text-lg whitespace-pre-wrap drop-shadow-md">
                    {displayText}
                </p>

                {/* Lesson (yellow hint) */}
                {displayLesson && (
                    <span className="mt-2 flex items-start gap-2 text-yellow-300 text-sm md:text-base">
                        <FaLightbulb className="mt-1 shrink-0" />
                        <span>{displayLesson}</span>
                    </span>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-5 left-6 right-6 md:left-9 md:right-9 h-10">
                <div className="absolute left-0 top-1/2 -translate-y-1/2">
                    {showBack ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="button-with-icon-introScenes button-gray icon-left">
                            <span className="icon">◀</span>
                            <span className="text">ย้อนกลับ</span>
                        </button>
                    ) : (
                        <div className="w-[110px] h-[40px]" />
                    )}
                </div>

                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="hidden items-center gap-2 sm:flex">
                        {Array.from({
                            length: totalScenes,
                        }).map((_, index) => (
                            <div
                                key={index}
                                className={`
                                    h-3
                                    rounded-full
                                    transition-all
                                    duration-300
                                    ${index === currentScene
                                        ? "w-8 bg-green-300"
                                        : "w-3 bg-slate-300"
                                    }
                                `}
                            />
                        ))}
                    </div>
                </div>

                <div
                    className="absolute right-0 top-1/2 -translate-y-1/2">
                    <button
                        type="button"
                        onClick={onNext}
                        className="button-with-icon-introScenes button-green icon-right">
                        <span className="text text-black">{nextText}</span>
                        <span className="icon text-black">▶</span>
                    </button>
                </div>
            </div>
        </div>
    );
}