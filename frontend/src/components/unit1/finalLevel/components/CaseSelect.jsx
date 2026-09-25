import { CheckCircle2, Lock, RotateCcw, XCircle } from "lucide-react";
import ProgressTrack from "./ProgressTrack";
import BgGame from "../../../../assets/unit1/finalLevel/bgGame1.png"

export default function CaseSelect({
    cases,
    caseIdx,
    results,
    unlockedCaseCount,
    onOpenCase,
    onRestart,
}) {
    return (
        <div className="w-full h-full pt-2">
            <div
                className="relative overflow-hidden w-full h-full max-w-6xl p-8 border-4 border-black"
                style={{
                    backgroundImage: `url(${BgGame})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/70 z-0" />

                {/* Content */}
                <div className="relative z-10">
                    <ProgressTrack caseIdx={caseIdx} results={results} />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10">
                        {cases.map((caseItem, index) => {
                            const isLocked = index > unlockedCaseCount;
                            const solved = results[caseItem.id];

                            return (
                                <button
                                    key={caseItem.id}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => onOpenCase(index)}
                                    className="text-left rounded-lg p-4 border relative cid-paper h-28 mb-2"
                                    style={{
                                        borderColor:
                                            solved === true
                                                ? "#2F6B4F"
                                                : solved === false
                                                    ? "#A32638"
                                                    : "#C9BB98",
                                        opacity: isLocked ? 0.55 : 1,
                                        cursor: isLocked ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {/* ในกล่อง */}
                                    <div className="flex items-center justify-between">
                                        <span

                                            className="text-lg font-semibold tracking-wide"
                                            style={{ color: "#8A6D3B" }}
                                        >
                                            {caseItem.code}
                                        </span>

                                        {isLocked && <Lock size={14} color="#8A6D3B" />}
                                        {solved === true && (
                                            <CheckCircle2 size={16} color="#2F6B4F" />
                                        )}
                                        {solved === false && (
                                            <XCircle size={16} color="#A32638" />
                                        )}
                                    </div>

                                    <p
                                        className="font-bold text-lg"
                                        style={{ color: "#2B2118" }}
                                    >
                                        {caseItem.title}
                                    </p>

                                    <p className="text-sm" style={{ color: "#6B5B3D" }}>
                                        {caseItem.location}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

