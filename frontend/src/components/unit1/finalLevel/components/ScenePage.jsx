import {
    ChevronLeft,
    FolderOpen,
} from "lucide-react";
import { useMemo } from "react";
import { CASES } from "../data/cases";

export default function ScenePage({
    currentCase,
    caseIdx,
    collectedList,
    allCollected,
    onOpenEvidence,
    onBack,
    onAnalyze,
}) {
    const background = CASES[caseIdx]?.background;

    const shuffledEvidence = useMemo(() => {
        const arr = [...currentCase.evidence];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [currentCase.id]);

    return (
        <div
            className="relative h-full p-8 border-4 border-black overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `url(${currentCase.background})`,
            }}
        >

            <div className="cid-cork rounded-xl p-5 mt-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <span className="text-xl font-semibold tracking-wide text-white">
                            {currentCase.code}
                        </span>

                        <h2 className="text-2xl font-bold text-white">
                            {currentCase.location}
                        </h2>
                    </div>

                    <div
                        className="text-sm px-3 py-2 rounded-full font-semibold"
                        style={{
                            backgroundColor: "#cdc9c5ff",
                            color: "#000000",
                        }}
                    >
                        หลักฐาน {collectedList.length}/{currentCase.evidence.length}
                    </div>
                </div>

                {/* Grid หลักฐาน */}
                <div className="grid grid-cols-2 gap-4">
                    {shuffledEvidence.map((evidence) => {
                        const isCollected = collectedList.includes(evidence.id);
                        const Icon = evidence.icon;

                        return (
                            <button
                                key={evidence.id}
                                type="button"
                                onClick={() => onOpenEvidence(evidence)}
                                className="relative rounded p-4 text-left cid-paper"
                                style={{
                                    transform: isCollected ? "rotate(-1.5deg)" : "rotate(1deg)",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                                }}
                            >
                                <div
                                    className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full cid-pin"
                                    style={{
                                        backgroundColor: isCollected ? "#2F6B4F" : "#B8863B",
                                    }}
                                />

                                <Icon size={22} color="#4A3B22" />

                                <p
                                    className="cid-display text-base font-bold mt-2 leading-snug"
                                    style={{ color: "#2B2118" }}
                                >
                                    {evidence.name}
                                </p>

                                <p
                                    className="text-xs mt-1 font-semibold"
                                    style={{
                                        color: isCollected ? "#2F6B4F" : "#8A6D3B",
                                    }}
                                >
                                    {isCollected ? "เก็บแล้ว" : "คลิกเพื่อตรวจสอบ"}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="flex items-center justify-between mt-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="text-sm text-white flex items-center gap-1 px-3 py-2 rounded"
                    >
                        <ChevronLeft size={16} />
                        กลับไปแฟ้มคดี
                    </button>

                    <button
                        type="button"
                        disabled={!allCollected}
                        onClick={onAnalyze}
                        className="result-button result-button-amber"
                    >
                        <span className="result-button-top">วิเคราะห์หลักฐาน</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
