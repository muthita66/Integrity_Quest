import { useEffect } from "react";

import gameOverSound from "../../../../assets/sounds/BackgroundGame/GameOver2.mp3";
import useGameMuted from "../../../../hooks/useGameMuted";

export default function GameOverPopup({ popup, onRestart, onDismiss }) {
    const [muted] = useGameMuted();

    useEffect(() => {
        if (popup?.type !== "timer_expired" || muted) return;

        const audio = new Audio(gameOverSound);
        audio.volume = 0.6;
        audio.play().catch(() => { });

        return () => {
            audio.pause();
            audio.src = "";
        };
    }, [popup]);

    if (!popup) return null;

    const isEvidenceLimit = popup.type === "evidence_limit";
    const isTimerExpired = popup.type === "timer_expired";
    const isWrongVerdict = popup.type === "wrong_verdict";

    const stampText = isTimerExpired
        ? "หมดเวลา!"
        : "ลองอีกครั้ง!";

    const stampColor = isTimerExpired ? "#B8500A" : "#A32638";

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[10000] sarabun-bold"
            style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
        >
            <div
                className="cid-paper border-4 border-black rounded-2xl p-8 max-w-sm w-full mx-4 text-center cid-pop"
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
            >
                {/* stamp */}
                <div
                    className="inline-block px-5 py-2 rounded-lg border-4 mb-5 cid-stamp-anim"
                    style={{ borderColor: stampColor, color: stampColor }}
                >
                    <p className="cid-display text-2xl font-black tracking-widest">
                        {stampText}
                    </p>
                </div>

                <h3
                    className="text-lg font-bold mb-2"
                    style={{ color: "#2B2118" }}
                >
                    {isTimerExpired
                        ? "เวลาในการเลือกหลักฐานหมดแล้ว"
                        : isEvidenceLimit
                            ? "วิเคราะห์หลักฐานไม่สำเร็จ"
                            : "ตอบคำถามคดีผิด"}
                </h3>

                <p className="cid-body text-base mb-3" style={{ color: "#5A4B30" }}>
                    {isTimerExpired
                        ? `คุณใช้เวลาเลือกหลักฐานในคดีเกินกำหนด ต้องเลือกหลักฐานใหม่อีกครั้ง`
                        : isEvidenceLimit
                            ? `คุณใช้โอกาสวิเคราะห์หลักฐานในคดีครบ 3 ครั้งแล้ว ลองทบทวนหลักฐานใหม่แล้วเริ่มใหม่`
                            : `การตอบคำถามคดียังไม่ถูกต้อง นักสืบฝึกหัดต้องทบทวนหลักฐานอีกครั้ง`}
                </p>

                {/* คำเตือนเรื่อง rank เมื่อ timeout */}
                {isTimerExpired && (
                    <p
                        className="cid-body text-sm mb-5 px-3 py-2 rounded-lg"
                        style={{
                            color: "#7A4010",
                            backgroundColor: "#FFF3E0",
                            border: "1px solid #F4A84A",
                        }}
                    >
                        การหมดเวลาจะลดระดับสูงสุดที่ได้รับเป็น <br /><strong>"นักสืบฝึกหัด"</strong>
                    </p>
                )}

                <div className="flex justify-center gap-3">
                    {isTimerExpired ? (
                        /* ปิด popup แล้วให้เลือกหลักฐานใหม่ (state ถูก reset ไปแล้วใน hook ตอน timerExpired()) */
                        <button
                            type="button"
                            onClick={onDismiss}
                            className="result-button result-button-amber"
                        >
                            <span className="result-button-top">เลือกหลักฐานใหม่</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={onRestart}
                            className="result-button result-button-red"
                        >
                            <span className="result-button-top">ลองใหม่อีกครั้ง</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}