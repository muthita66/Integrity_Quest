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

    // ปุ่มสต๊อป
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

    // Reset timer
    useEffect(() => {
        setTimeLeft(TIMER_SECONDS);
    }, [currentCase.id, checked === false && retryCount]);

    // Run timer
    useEffect(() => {
        if (checked) {
            clearInterval(intervalRef.current);
            return;
        }

        setTimeLeft(TIMER_SECONDS);

        intervalRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (pausedRef.current) return prev;

                if (prev <= 1) {
                    clearInterval(intervalRef.current);

                    if (onTimerExpired) {
                        onTimerExpired();
                    } else {
                        onSubmitAnalysis();
                    }

                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [currentCase.id, checked]);

    const timerUrgent = timeLeft <= 5;
    const timerPct = (timeLeft / TIMER_SECONDS) * 100;

    const timerColor =
        timeLeft > 10
            ? "#4CAF50"
            : timeLeft > 5
                ? "#FFA726"
                : "#E53935";

    return (
        <div className="w-full min-h-dvh flex items-center justify-center">
            {/* Main Content */}
            <div
                className="
                    cid-paper
                    w-full
                    min-h-dvh
                    flex
                    flex-col
                    relative
                    cid-pop
                    px-6
                    py-8
                    md:px-10
                    lg:px-14
                "
            >
                {/* Countdown timer */}
                {!checked && (
                    <div
                        className="fixed z-50"
                        style={{
                            top: "16px",
                            right: "16px",
                        }}
                        title={`เหลือเวลา ${timeLeft} วินาที`}
                    >
                        <div
                            className="flex items-center gap-3 px-4 py-2 rounded-full"
                            style={{
                                animation: timerUrgent
                                    ? "timerPulse 0.6s ease-in-out infinite alternate"
                                    : "none",
                            }}
                        >
                            {/* Circular progress */}
                            <div className="relative flex items-center justify-center w-12 h-12">
                                <svg
                                    width="48"
                                    height="48"
                                    viewBox="0 0 48 48"
                                    className="absolute inset-0"
                                >
                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        fill="none"
                                        stroke="rgba(0,0,0,0.1)"
                                        strokeWidth="4"
                                    />

                                    <circle
                                        cx="24"
                                        cy="24"
                                        r="20"
                                        fill="none"
                                        stroke={timerColor}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 20}`}
                                        strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
                                        transform="rotate(-90 24 24)"
                                        style={{
                                            transition:
                                                "stroke-dashoffset 0.9s linear, stroke 0.4s",
                                        }}
                                    />
                                </svg>

                                {/* Number */}
                                <span
                                    className="font-black tabular-nums absolute"
                                    style={{
                                        color: timerColor,
                                        fontSize: "20px",
                                        lineHeight: 1,
                                        textAlign: "center",
                                        transition: "color 0.4s",
                                    }}
                                >
                                    {timeLeft}
                                </span>
                            </div>

                            {/* Stop */}
                            <button
                                type="button"
                                onClick={openStopDialog}
                                aria-label="หยุดเวลา / กลับหน้าหลัก"
                                title="หยุดเวลา / กลับหน้าหลัก"
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-white
                                    text-[#2B2118]
                                    cursor-pointer
                                    transition-transform
                                    duration-200
                                    hover:scale-110
                                    active:scale-95
                                "
                            >
                                <FaPause size={18} />
                            </button>
                        </div>

                        <style>{`
                            @keyframes timerPulse {
                                from {
                                    transform: scale(1);
                                }

                                to {
                                    transform: scale(1.05);
                                }
                            }
                        `}</style>
                    </div>
                )}

                {/* Content wrapper */}
                <div className="w-full max-w-6xl mx-auto flex flex-col flex-1">
                    {/* Header */}
                    <div className="mb-3 flex items-center gap-2">
                        <FolderOpen size={22} color="#4A3B22" />

                        <p
                            className="cid-display text-xl font-bold"
                            style={{ color: "#2B2118" }}
                        >
                            แฟ้มคดี {currentCase.title}
                        </p>
                    </div>

                    <p
                        className="mb-5 text-sm md:text-base"
                        style={{ color: "#5A4B30" }}
                    >
                        เลือกหลักฐานสำคัญที่สนับสนุนการตัดสินคดีนี้
                        <br />
                        คุณสามารถเลือกหลักฐานอื่นเพิ่มเติมได้
                        แต่ต้องเลือกหลักฐานสำคัญให้ครบทุกชิ้น
                        แล้วกด “ยืนยันการวิเคราะห์”
                    </p>

                    {/* Evidence List */}
                    <div className="mb-3 overflow-y-auto px-2 py-1 space-y-2">
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
                                            size={18}
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
                                            size={18}
                                            color="#B8863B"
                                        />
                                    );
                                }

                                if (
                                    !evidence.relevant &&
                                    isPicked
                                ) {
                                    borderColor = "#A32638";
                                    backgroundColor = "#F5E2E2";

                                    badge = (
                                        <AlertTriangle
                                            size={18}
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
                                        flex
                                        w-full
                                        gap-3
                                        rounded-lg
                                        border
                                        px-4 py-2.5
                                        text-left
                                        transition
                                        hover:scale-[1.005]
                                        disabled:cursor-default
                                    "
                                    style={{
                                        backgroundColor,
                                        borderColor,
                                    }}
                                >
                                    <Icon
                                        size={20}
                                        color="#4A3B22"
                                        className="mt-0.5 shrink-0"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="text-[15px] font-semibold leading-tight"
                                            style={{
                                                color: "#2B2118",
                                            }}
                                        >
                                            {evidence.name}
                                        </p>

                                        <p
                                            className="mt-1 text-[13px] leading-snug"
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
                                                        mt-1
                                                        text-xs
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
                                                        mt-1
                                                        text-xs
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

                    {/* Bottom */}
                    {!checked ? (
                        <div className="flex justify-center pb-2">
                            <button
                                type="button"
                                disabled={picks.length === 0}
                                onClick={onSubmitAnalysis}
                                className="
                                    result-button
                                    result-button-amber
                                "
                            >
                                <span className="result-button-top">
                                    ยืนยันการวิเคราะห์
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Result Message */}
                            <div
                                className="mb-3 mx-2 rounded-lg py-2 px-4 text-center text-sm"
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

                            {/* Buttons */}
                            {evidenceResult ? (
                                <div className="flex justify-center pb-2">
                                    <button
                                        type="button"
                                        onClick={onContinue}
                                        className="
                                            result-button
                                            result-button-amber
                                        "
                                    >
                                        <span className="result-button-top">
                                            ตอบคำถามคดี
                                        </span>
                                    </button>
                                </div>
                            ) : retriesLeft > 0 ? (
                                <div className="flex justify-center pb-2">
                                    <button
                                        type="button"
                                        onClick={onRetryAnalysis}
                                        className="
                                            result-button
                                            result-button-red
                                        "
                                    >
                                        <span className="result-button-top">
                                            เลือกหลักฐานใหม่
                                        </span>
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Stop Dialog */}
                <StopDialog
                    isOpen={isPaused}
                    onResume={handleResume}
                    onRestart={handleRestart}
                    onExit={() => navigate("/map")}
                />
            </div>
        </div>
    );
}