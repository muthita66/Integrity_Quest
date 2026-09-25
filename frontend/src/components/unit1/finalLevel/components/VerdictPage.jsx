import {
    AlertTriangle,
    CheckCircle2,
} from "lucide-react";

export default function VerdictPage({
    currentCase,
    isCorrect,
    evidenceResult,
    isLastCase,
    onNext,
    onRestart,
}) {

    //เมื่อตอบคำถามผิด → หลักฐานถือว่าไม่ผ่านด้วย (ไม่ว่าจะเลือกหลักฐานถูกต้องก่อนหน้าแค่ไหน)
    const displayEvidenceOk = isCorrect && evidenceResult;

    const explainText = isCorrect
        ? currentCase.correctExplain
        : currentCase.wrongExplain;

    return (
        <div
            className="cid-paper border-4 border-black h-full p-6 border flex flex-col items-center justify-center gap-4"
        >
            {/* stamp */}
            <div
                className="inline-block px-6 py-3 rounded-lg border-4 mb-4 cid-stamp-anim"
                style={{
                    borderColor: isCorrect ? "#2F6B4F" : "#A32638",
                    color: isCorrect ? "#2F6B4F" : "#A32638",
                }}
            >
                <p className="text-3xl font-black tracking-widest">
                    {isCorrect ? "ผ่านคดีนี้" : "ต้องทบทวนใหม่"}
                </p>
            </div>

            {/* คำอธิบาย */}
            {explainText && (
                <div
                    className="rounded-lg p-4 mb-3 text-left"
                    style={{ backgroundColor: "#EDE1C4" }}
                >
                    <p
                        className="text-base leading-relaxed"
                        style={{ color: "#3A2E1B" }}
                    >
                        {explainText}
                    </p>
                </div>
            )}

            {/* ── ผลหลักฐาน ── */}
            <div
                className="rounded-lg p-3 mb-5 text-left flex items-center gap-2"
                style={{
                    backgroundColor: "#F3E9D2",
                    border: "1px solid #C9BB98",
                }}
            >
                {displayEvidenceOk ? (
                    <CheckCircle2 size={16} color="#2F6B4F" />
                ) : (
                    <AlertTriangle size={16} color="#B8863B" />
                )}

                <p className="text-sm" style={{ color: "#5A4B30" }}>
                    การระบุหลักฐานที่เกี่ยวข้อง:{" "}
                    {displayEvidenceOk
                        ? "ถูกต้องครบถ้วน"
                        : "ยังไม่ครบถ้วนหรือเลือกเกิน"}
                </p>
            </div>

            {/* ── ปุ่ม ── */}
            {isCorrect ? (
                <button
                    type="button"
                    onClick={onNext}
                    className="result-button result-button-green"
                >
                    <span className="result-button-top">
                        {isLastCase ? "ดูผลสรุป" : "ไปคดีถัดไป"}
                    </span>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={onRestart}
                    className="result-button result-button-red"
                >
                    <span className="result-button-top">เริ่มคดีนี้ใหม่</span>
                </button>
            )}
        </div>
    );
}