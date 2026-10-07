import { ChevronLeft } from "lucide-react";
import ProgressTrack from "./ProgressTrack";

export default function BriefingPage({
    currentCase,
    caseIdx,
    results,
    onEnterScene,
    onBack,
}) {
    return (
        <div
            className="relative w-full min-h-dvh overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${currentCase.background})`,
            }}
        >
            {/* Background Overlay */}
            <div className="absolute inset-0 bg-black/10" />

            {/* Main Content */}
            <div className="relative z-10 w-full min-h-dvh flex flex-col items-center justify-center px-8 pt-16 pb-12">

                {/* Progress 1 - 2 - 3 - 4 - 5 */}
                <div className="w-full max-w-7xl mb-8">
                    <ProgressTrack
                        caseIdx={caseIdx}
                        results={results}
                    />
                </div>

                {/* Briefing Card */}
                <div
                    className="
                        w-full
                        max-w-6xl
                        rounded-2xl
                        bg-[#F3E9D2]/90
                        p-8
                        shadow-2xl
                    "
                >
                    {/* Case Code */}
                    <span
                        className="text-lg font-semibold tracking-wide"
                        style={{
                            color: "#8A6D3B",
                        }}
                    >
                        {currentCase.code}
                    </span>

                    {/* Case Title */}
                    <h2
                        className="mt-1 mb-1 text-3xl font-bold"
                        style={{
                            color: "#2B2118",
                        }}
                    >
                        {currentCase.title}
                    </h2>

                    {/* Location */}
                    <p
                        className="mb-5 text-lg"
                        style={{
                            color: "#6B5B3D",
                        }}
                    >
                        สถานที่: {currentCase.location}
                    </p>

                    {/* Briefing */}
                    <div className="mb-6 rounded-xl bg-[#EDE1C4]/95 p-5">
                        <p
                            className="text-base leading-relaxed"
                            style={{
                                color: "#3A2E1B",
                            }}
                        >
                            "{currentCase.briefing}"
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between">
                        {/* Back */}
                        <button
                            type="button"
                            onClick={onBack}
                            className="
                                flex
                                items-center
                                gap-1
                                rounded-lg
                                px-4
                                py-3
                                text-sm
                                font-semibold
                                transition-all
                                duration-200
                                hover:bg-black/5
                            "
                            style={{
                                color: "#2B2118",
                            }}
                        >
                            <ChevronLeft size={18} />
                            กลับไปเลือกคดี
                        </button>

                        {/* Enter Scene */}
                        <button
                            type="button"
                            onClick={onEnterScene}
                            className="result-button result-button-amber"
                        >
                            <span className="result-button-top">
                                เข้าสู่สถานที่เกิดเหตุ
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}