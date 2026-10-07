import { CheckCircle2, Lock, XCircle } from "lucide-react";
import ProgressTrack from "./ProgressTrack";
import BgGame from "../../../../assets/unit1/finalLevel/bgGame1.png";

export default function CaseSelect({
    cases,
    caseIdx,
    results,
    unlockedCaseCount,
    onOpenCase,
    onRestart,
}) {
    return (
        <div className="w-full min-h-dvh relative overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: `url(${BgGame})`,
                }}
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/70 z-0" />

            {/* Main Content */}
            <div className="relative z-10 w-full min-h-dvh flex flex-col items-center justify-center px-8 pt-16 pb-12">

                {/* Progress 1 - 2 - 3 - 4 - 5 */}
                <div className="w-full max-w-7xl mb-8">
                    <ProgressTrack
                        caseIdx={caseIdx}
                        results={results}
                    />
                </div>

                {/* Case Selection */}
                <div className="w-full max-w-7xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                        {cases.map((caseItem, index) => {
                            const isLocked = index > unlockedCaseCount;
                            const solved = results[caseItem.id];

                            return (
                                <button
                                    key={caseItem.id}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={() => onOpenCase(index)}
                                    className="
                                        text-left
                                        rounded-xl
                                        p-5
                                        border
                                        relative
                                        cid-paper
                                        min-h-[130px]
                                        transition-all
                                        duration-200
                                        hover:scale-[1.01]
                                        hover:shadow-xl
                                    "
                                    style={{
                                        borderColor:
                                            solved === true
                                                ? "#2F6B4F"
                                                : solved === false
                                                    ? "#A32638"
                                                    : "#C9BB98",

                                        opacity: isLocked ? 0.55 : 1,

                                        cursor: isLocked
                                            ? "not-allowed"
                                            : "pointer",
                                    }}
                                >
                                    {/* Case Header */}
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className="text-lg font-semibold tracking-wide"
                                            style={{
                                                color: "#8A6D3B",
                                            }}
                                        >
                                            {caseItem.code}
                                        </span>

                                        <div>
                                            {isLocked && (
                                                <Lock
                                                    size={18}
                                                    color="#8A6D3B"
                                                />
                                            )}

                                            {solved === true && (
                                                <CheckCircle2
                                                    size={20}
                                                    color="#2F6B4F"
                                                />
                                            )}

                                            {solved === false && (
                                                <XCircle
                                                    size={20}
                                                    color="#A32638"
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* Case Title */}
                                    <p
                                        className="font-bold text-xl"
                                        style={{
                                            color: "#2B2118",
                                        }}
                                    >
                                        {caseItem.title}
                                    </p>

                                    {/* Location */}
                                    <p
                                        className="text-base mt-1"
                                        style={{
                                            color: "#6B5B3D",
                                        }}
                                    >
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