import { CheckCircle2, XCircle } from "lucide-react";
import { CASES } from "../data/cases";

export default function ProgressTrack({ caseIdx, results }) {
    return (
        <div className="flex items-center gap-2 mb-6">
            {CASES.map((caseItem, index) => {
                const status =
                    results[caseItem.id] === true
                        ? "pass"
                        : results[caseItem.id] === false
                            ? "fail"
                            : index === caseIdx
                                ? "current"
                                : "idle";

                return (
                    <div key={caseItem.id} className="flex items-center gap-2">
                        <div
                            className="w-12 h-12 rounded-full flex items-center justify-center border-2 cid-body text-xs font-semibold"
                            style={{
                                borderColor:
                                    status === "pass"
                                        ? "#2F6B4F"
                                        : status === "fail"
                                            ? "#A32638"
                                            : status === "current"
                                                ? "#B8863B"
                                                : "#C9BB98",
                                backgroundColor:
                                    status === "pass"
                                        ? "#2F6B4F"
                                        : status === "fail"
                                            ? "#A32638"
                                            : status === "current"
                                                ? "#FBF4E2"
                                                : "#EDE1C4",
                                color:
                                    status === "pass" || status === "fail"
                                        ? "#FBF4E2"
                                        : "#4A3B22",
                            }}
                        >
                            {status === "pass" ? (
                                <CheckCircle2 size={16} />
                            ) : status === "fail" ? (
                                <XCircle size={16} />
                            ) : (
                                index + 1
                            )}
                        </div>

                        {index < CASES.length - 1 && (
                            <div
                                className="w-6 h-px"
                                style={{ backgroundColor: "#B8A87C" }}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
