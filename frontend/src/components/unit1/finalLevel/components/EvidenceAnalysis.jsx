import {
    AlertTriangle,
    CheckCircle2,
    ChevronRight,
    FolderOpen,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPause } from "react-icons/fa";
import StopDialog from "./StopDialog";

export default function EvidenceAnalysis({
    currentCase,
    picks,
    checked,
    evidenceResult,
    failReason,
    retryCount,
    onTogglePick,
    onSubmitAnalysis,
    onContinue,
    onRetryAnalysis,
    onTimerExpired,
    onRestart,
}) {
    const navigate = useNavigate();

    // ปุ่มสต๊อป: เปิด dialog แล้วหยุดนับเวลาไว้ก่อน
    const [isPaused, setIsPaused] = useState(false);
    const pausedRef = useRef(false);

    const openStopDialog = () => {
        pausedRef.current = true;
        setIsPaused(true);
    };

    const handleResume = () => {
        pausedRef.current = false;
        setIsPaused(false);
    };

    const handleRestart = () => {
        pausedRef.current = false;
        setIsPaused(false);
        if (onRestart) onRestart();
        else window.location.reload();
    };

    const MAX_RETRIES = 3;
    const retriesLeft = MAX_RETRIES - retryCount - 1;
    const shuffledEvidence = useMemo(() => {
        const arr = [...currentCase.evidence];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }, [currentCase.id]);

    // Countdown timer
    const TIMER_SECONDS = 20;
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const intervalRef = useRef(null);

    // Reset timer when a new case loads or when retry resets checked
    useEffect(() => {
        setTimeLeft(TIMER_SECONDS);
    }, [currentCase.id, checked === false && retryCount]);

    // Run timer only while waiting for user to pick (!checked)
    useEffect(() => {
        if (checked) {
            clearInterval(intervalRef.current);
            return;
        }
        setTimeLeft(TIMER_SECONDS);
        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                // หยุดชั่วคราว: ไม่ลดเวลา
                if (pausedRef.current) return prev;

                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    // แจ้ง parent ว่าเวลาหมด (parent จะแสดง popup)
                    if (onTimerExpired) onTimerExpired();
                    else onSubmitAnalysis();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [currentCase.id, checked]);

    const timerUrgent = timeLeft <= 5;
    const timerPct = (timeLeft / TIMER_SECONDS) * 100;
    const timerColor = timeLeft > 10 ? "#4CAF50" : timeLeft > 5 ? "#FFA726" : "#E53935";

    return (
        <div
            className="cid-paper border-4 border-black p-6 pb-8 cid-pop h-full flex flex-col"
        >
            {/* Countdown timer badge (top-right, left of Home button*/}
            {!checked && (
                <div
                    className="absolute z-30"
                    style={{ top: "10px", right: "10px" }}
                    title={`เหลือเวลา ${timeLeft} วินาที`}
                >
                    <div
                        className="flex items-center gap-1.5 px-2.5 py-1"
                        style={{
                            backdropFilter: "none",
                            transition: "color 0.4s",
                            animation: timerUrgent
                                ? "timerPulse 0.6s ease-in-out infinite alternate"
                                : "none",
                        }}
                    >
                        {/* Circular progress */}
                        <svg width="22" height="22" viewBox="0 0 22 22" className="shrink-0">
                            <circle
                                cx="11"
                                cy="11"
                                r="9"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="2.5"
                            />
                            <circle
                                cx="11"
                                cy="11"
                                r="9"
                                fill="none"
                                stroke={timerColor}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 9}`}
                                strokeDashoffset={`${2 * Math.PI * 9 * (1 - timerPct / 100)}`}
                                transform="rotate(-90 11 11)"
                                style={{
                                    transition: "stroke-dashoffset 0.9s linear, stroke 0.4s",
                                }}
                            />
                        </svg>

                        {/* Number */}
                        <span
                            className="font-black tabular-nums"
                            style={{
                                color: timerColor,
                                fontSize: "13px",
                                lineHeight: 1,
                                minWidth: "18px",
                                textAlign: "center",
                                transition: "color 0.4s",
                            }}
                        >
                            {timeLeft}
                        </span>

                        {/* ปุ่มสต๊อป (ขวาของเวลา) */}
                        <button
                            type="button"
                            onClick={openStopDialog}
                            aria-label="หยุดเวลา"
                            title="หยุดเวลา"
                            className="
                                ml-1 flex h-7 w-7 items-center justify-center
                                rounded-full border-2 border-[#2B2118]
                                bg-yellow-300 text-[#2B2118]
                                shadow-sm cursor-pointer
                                transition-transform duration-200
                                hover:scale-110 active:scale-95
                            "
                        >
                            <FaPause size={11} />
                        </button>
                    </div>

                    <style>{`
    @keyframes timerPulse {
        from {
            transform: scale(1);
        }
        to {
            transform: scale(1.07);
        }
    }
`}</style>
                </div>
            )}
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
                         * ต้อง Retry (ดู failReason === "overpick")
                         * แต่ยัง highlight เป็นสีเตือนแทนสีปกติ เพื่อ
                         * ให้เห็นชัดว่าเป็นตัวที่ทำให้ไม่ผ่าน
                         */
                        if (
                            !evidence.relevant &&
                            isPicked
                        ) {
                            borderColor = "#A32638";
                            backgroundColor = "#F5E2E2";

                            badge = (
                                <AlertTriangle
                                    size={16}
                                    color="#A32638"
                                />
                            );
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
                                                font-semibold
                                            "
                                            style={{
                                                color: "#A32638",
                                            }}
                                        >
                                            หลักฐานชิ้นนี้ไม่เกี่ยวข้องกับคดี
                                            การเลือกมาด้วยทำให้การวิเคราะห์ไม่ผ่าน
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
                                    : failReason === "overpick"
                                        ? `คุณเลือกหลักฐานที่ไม่เกี่ยวข้องกับคดีปะปนมาด้วย เหลือโอกาสอีก ${retriesLeft} ครั้ง`
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

            <StopDialog
                isOpen={isPaused}
                onResume={handleResume}
                onRestart={handleRestart}
                onExit={() => navigate("/map")}
            />
        </div>
    );
}