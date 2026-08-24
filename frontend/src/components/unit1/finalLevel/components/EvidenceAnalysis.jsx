import {
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    FolderOpen,
} from "lucide-react";
import { useMemo } from "react";

export default function EvidenceAnalysis({
    currentCase,
    picks,
    checked,
    evidenceResult,
    retryCount,
    onTogglePick,
    onSubmitAnalysis,
    onContinue,
    onRetryAnalysis,
}) {
    const MAX_RETRIES = 3;
    const retriesLeft = MAX_RETRIES - retryCount;

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
            className="cid-paper border-4 border-black p-6 pb-8 cid-pop h-full flex flex-col"
        >
            <div className="mb-2 flex items-center gap-2">
                <FolderOpen size={20} color="#4A3B22" />

                <p
                    className="cid-display text-lg font-bold"
                    style={{ color: "#2B2118" }}
                >
                    แฟ้มคดี {currentCase.title}
                </p>
            </div>

            <p
                className="mb-4 text-base"
                style={{ color: "#5A4B30" }}
            >
                เลือกหลักฐานสำคัญที่สนับสนุนการตัดสินคดีนี้
                คุณสามารถเลือกหลักฐานอื่นเพิ่มเติมได้
                แต่ต้องเลือกหลักฐานสำคัญให้ครบทุกชิ้น
                แล้วกด “ยืนยันการวิเคราะห์”
            </p>

            <div className="mb-5 space-y-2 flex-1 overflow-y-auto pr-2">
                {shuffledEvidence.map((evidence) => {
                    const Icon = evidence.icon;
                    const isPicked = picks.includes(evidence.id);

                    let borderColor = isPicked
                        ? "#2B2118"
                        : "#C9BB98";

                    let backgroundColor = isPicked
                        ? "#EDE1C4"
                        : "transparent";

                    let badge = null;

                    if (checked) {
                        /*
                         * หลักฐานที่เกี่ยวข้องและเลือกแล้ว
                         */
                        if (
                            evidence.relevant &&
                            isPicked
                        ) {
                            borderColor = "#2F6B4F";
                            backgroundColor = "#E3EFE3";

                            badge = (
                                <CheckCircle2
                                    size={16}
                                    color="#2F6B4F"
                                />
                            );
                        }

                        /*
                         * หลักฐานที่เกี่ยวข้องแต่ไม่ได้เลือก
                         */
                        if (
                            evidence.relevant &&
                            !isPicked
                        ) {
                            borderColor = "#B8863B";
                            backgroundColor = "#FAF0DA";

                            badge = (
                                <AlertTriangle
                                    size={16}
                                    color="#B8863B"
                                />
                            );
                        }

                        /*
                         * หลักฐานที่ไม่เกี่ยวข้องแต่เลือกมา
                         * ไม่ถือว่าผิด จึงใช้สีปกติ
                         */
                        if (
                            !evidence.relevant &&
                            isPicked
                        ) {
                            borderColor = "#8B7355";
                            backgroundColor = "#EDE1C4";
                        }
                    }

                    return (
                        <button
                            key={evidence.id}
                            type="button"
                            disabled={checked}
                            onClick={() =>
                                onTogglePick(evidence.id)
                            }
                            className="
                                flex w-full gap-3 rounded-lg
                                border p-3 text-left
                                transition
                                disabled:cursor-default
                            "
                            style={{
                                backgroundColor,
                                borderColor,
                            }}
                        >
                            <Icon
                                size={18}
                                color="#4A3B22"
                                className="mt-0.5 shrink-0"
                            />

                            <div className="min-w-0 flex-1">
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: "#2B2118",
                                    }}
                                >
                                    {evidence.name}
                                </p>

                                <p
                                    className="mt-0.5 text-xs"
                                    style={{
                                        color: "#5A4B30",
                                    }}
                                >
                                    {evidence.detail}
                                </p>

                                {checked &&
                                    evidence.relevant &&
                                    !isPicked && (
                                        <p
                                            className="
                                                mt-1 text-xs
                                                font-semibold
                                            "
                                            style={{
                                                color: "#B8863B",
                                            }}
                                        >
                                            คุณยังไม่ได้เลือกหลักฐานสำคัญชิ้นนี้
                                        </p>
                                    )}

                                {checked &&
                                    !evidence.relevant &&
                                    isPicked && (
                                        <p
                                            className="
                                                mt-1 text-xs
                                                font-medium
                                            "
                                            style={{
                                                color: "#6B5A3E",
                                            }}
                                        >
                                            หลักฐานชิ้นนี้ไม่เกี่ยวข้องโดยตรง
                                            แต่ไม่ส่งผลต่อการผ่าน
                                        </p>
                                    )}
                            </div>

                            <div className="shrink-0">
                                {badge}
                            </div>
                        </button>
                    );
                })}
            </div>

            {!checked ? (
                <button
                    type="button"
                    disabled={picks.length === 0}
                    onClick={onSubmitAnalysis}
                    className="result-button result-button-amber self-center"
                >
                    <span className="result-button-top">ยืนยันการวิเคราะห์</span>
                </button>
            ) : (
                <div>
                    <div
                        className="mb-4 rounded-lg p-3"
                        style={{
                            backgroundColor: evidenceResult
                                ? "#E3EFE3"
                                : "#F5E2E2",
                        }}
                    >
                        <p
                            className="text-sm font-semibold"
                            style={{
                                color: evidenceResult
                                    ? "#2F6B4F"
                                    : "#A32638",
                            }}
                        >
                            {evidenceResult
                                ? "คุณเลือกหลักฐานสำคัญที่เกี่ยวข้องกับคดีได้ครบถ้วน"
                                : retriesLeft <= 0
                                    ? "คุณใช้โอกาสวิเคราะห์หลักฐานครบ 3 ครั้งแล้ว"
                                    : `คุณยังเลือกหลักฐานสำคัญไม่ครบ เหลือโอกาสอีก ${retriesLeft} ครั้ง`}
                        </p>
                    </div>

                    {evidenceResult ? (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={onContinue}
                                className="result-button result-button-amber"
                            >
                                <span className="result-button-top">ตอบคำถามคดี</span>
                            </button>
                        </div>
                    ) : retriesLeft > 0 ? (
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={onRetryAnalysis}
                                className="result-button result-button-red"
                            >
                                <span className="result-button-top">เลือกหลักฐานใหม่</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}