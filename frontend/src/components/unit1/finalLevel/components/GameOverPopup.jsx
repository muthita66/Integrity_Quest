export default function GameOverPopup({ popup, onRestart, onDismiss }) {
    if (!popup) return null;

    const isEvidenceLimit = popup.type === "evidence_limit";

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[10000]"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        >
            <div
                className="cid-paper border-4 border-black rounded-2xl p-8 max-w-sm w-full mx-4 text-center cid-pop"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
            >
                {/* stamp */}
                <div
                    className="inline-block px-5 py-2 rounded-lg border-4 mb-5 cid-stamp-anim"
                    style={{ borderColor: "#A32638", color: "#A32638" }}
                >
                    <p className="cid-display text-2xl font-black tracking-widest">
                        นักสืบฝึกหัด
                    </p>
                </div>

                <h3
                    className="cid-display text-lg font-bold mb-2"
                    style={{ color: "#2B2118" }}
                >
                    {isEvidenceLimit
                        ? "วิเคราะห์หลักฐานไม่สำเร็จ"
                        : "ตอบคำถามคดีผิด"}
                </h3>

                <p className="cid-body text-sm mb-6" style={{ color: "#5A4B30" }}>
                    {isEvidenceLimit
                        ? `คุณใช้โอกาสวิเคราะห์หลักฐานในคดี "${popup.caseTitle}" ครบ 3 ครั้งแล้ว ลองทบทวนหลักฐานใหม่แล้วเริ่มใหม่`
                        : `การตอบคำถามคดี "${popup.caseTitle}" ยังไม่ถูกต้อง นักสืบฝึกหัดต้องทบทวนหลักฐานอีกครั้ง`}
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="result-button result-button-red"
                    >
                        <span className="result-button-top">ต่อไป</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
