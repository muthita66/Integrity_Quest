import { ChevronLeft, ChevronRight } from "lucide-react";
import ProgressTrack from "./ProgressTrack";
import { CASES } from "../data/cases";

export default function BriefingPage({
    currentCase,
    caseIdx,
    results,
    onEnterScene,
    onBack,
}) {
    return (
        <div
            className="relative h-full border-4 border-black overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${currentCase.background})`,
            }}
        >
            {/* ลดความมืดของรูปพื้นหลัง */}
            <div className="absolute inset-0 bg-black/5" />

            <div className="relative z-10 h-full p-6">
                <ProgressTrack caseIdx={caseIdx} results={results} />

                <div className="mt-15 max-w-[1100px] h-auto min-h-[340px] rounded-xl bg-[#F3E9D2]/90 p-6 shadow-xl">
                    <span
                        className="text-lg font-semibold tracking-wide"
                        style={{ color: "#8A6D3B" }}
                    >
                        {currentCase.code}
                    </span>

                    <h2
                        className="mt-1 mb-1 text-3xl font-bold"
                        style={{ color: "#2B2118" }}
                    >
                        {currentCase.title}
                    </h2>

                    <p
                        className="mb-4 text-lg"
                        style={{ color: "#6B5B3D" }}
                    >
                        สถานที่: {currentCase.location}
                    </p>

                    <div className="mb-5 rounded-lg bg-[#EDE1C4]/95 p-4">
                        <p
                            className="text-base leading-relaxed"
                            style={{ color: "#3A2E1B" }}
                        >
                            {currentCase.briefing}
                        </p>
                    </div>

                    <div className="flex items-center justify-between mt-8">
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-sm flex items-center gap-1 px-3 py-2 rounded font-semibold"
                            style={{ color: "#2B2118" }}
                        >
                            <ChevronLeft size={16} />
                            กลับไปเลือกคดี
                        </button>

                        <button
                            type="button"
                            onClick={onEnterScene}
                            className="result-button result-button-amber"
                        >
                            <span className="result-button-top">เข้าสู่สถานที่เกิดเหตุ</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}