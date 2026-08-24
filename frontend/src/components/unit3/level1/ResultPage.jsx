import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bgGameLevel1 from "../../../assets/unit3/level1/bgGameLevel1.png";
import ResultPass from "../../../assets/unit3/level1/resultPass.png";
import ConfettiBurst from "./components/ConfettiBurst";
import "../../../styles/unit3/level1/resultAnimation.css";

export default function ResultPage() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const found = state?.found ?? 8;
    const wrong = state?.wrong ?? 0;
    const timeLeft = state?.timeLeft ?? 0;

    const [showConfetti, setShowConfetti] = useState(true);
    const [showPaper, setShowPaper] = useState(false);
    const [showStamp, setShowStamp] = useState(false);

    const stats = [
        { label: "เอกสารที่พบ", value: `${found}/8`, color: "#2F6B4F" },
        { label: "กดผิด", value: `${wrong}/5`, color: "#A63D2F" },
        { label: "เวลาเหลือ", value: `${timeLeft}s`, color: "#B4802E" },
    ];

    useEffect(() => {
        const t1 = setTimeout(() => setShowPaper(true), 300);
        const t2 = setTimeout(() => setShowStamp(true), 1300);
        const t3 = setTimeout(() => setShowConfetti(false), 3800);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen font-sara overflow-hidden touch-none overscroll-none sarabun-bold">
            {/* ฉากหลัง */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 blur-[2px]"
                style={{ backgroundImage: `url(${bgGameLevel1})` }}
            />
            <div className="absolute inset-0 bg-[#14100b]/70" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0c0906_85%)]" />

            {/* พลุตรงกลางจอ */}
            {showConfetti && <ConfettiBurst />}

            {/* กึ่งกลางจอ ทั้งแนวตั้งแนวนอน */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-6">
                {/* กระดาษ */}
                <div
                    className="relative w-full max-w-xl"
                    style={{
                        filter: "drop-shadow(0 20px 35px rgba(0,0,0,0.55))",
                        opacity: showPaper ? 1 : 0,
                        // paper-shake delay = stamp lands at 1300+550=1850ms → 1850-300=1550ms after showPaper
                        animation: showPaper
                            ? "paper-rise 0.9s cubic-bezier(0.22,1,0.36,1) forwards, paper-shake 0.18s ease-in-out 1.55s"
                            : "none",
                    }}
                >
                    {/* ใบเสร็จ */}
                    <div
                        className="relative pt-12 px-7 pb-12"
                        style={{
                            background: `
            repeating-linear-gradient(
                0deg,
                rgba(0,0,0,0.015) 0px,
                rgba(0,0,0,0.015) 1px,
                transparent 1px,
                transparent 3px
            ),
            #F8F3E3
        `,
                            border: "2px solid #000000",
                            borderTopLeftRadius: "0.75em",
                            borderTopRightRadius: "0.75em",
                            borderBottomLeftRadius: "0.75em",
                            borderBottomRightRadius: "0.75em",
                            boxShadow: "0px 6px 0px 0px #000000", // เงาทึบด้านล่าง แบบเดียวกับปุ่ม
                            clipPath: `polygon(
                                0% 0%, 100% 0%, 100% 96%,
                                98% 100%, 94% 96%, 90% 100%, 86% 96%, 82% 100%, 78% 96%, 74% 100%,
                                70% 96%, 66% 100%, 62% 96%, 58% 100%, 54% 96%, 50% 100%, 46% 96%, 42% 100%,
                                38% 96%, 34% 100%, 30% 96%, 26% 100%, 22% 96%, 18% 100%, 14% 96%, 10% 100%,
                                6% 96%, 2% 100%, 0% 96%
                            )`,
                        }}
                    >
                        {/* หัวใบเสร็จ */}
                        <div
                            className="text-center mb-4"
                            style={{
                                opacity: 0,
                                animation: showStamp ? "line-in 0.4s ease-out 0s both" : "none",
                            }}
                        >
                            <p className="text-[40px] font-bold" style={{ color: "#B4802E" }}>
                                ภารกิจสำเร็จ
                            </p>
                            <h1 className="text-2xl font-black mt-1" style={{ color: "#2B2118" }}>
                                ตามหาใบเสร็จ
                            </h1>
                        </div>

                        <div
                            className="border-t-2 border-dashed mb-4"
                            style={{
                                borderColor: "#c9b48f",
                                opacity: 0,
                                animation: showStamp ? "line-in 0.3s ease-out 0.15s both" : "none",
                            }}
                        />

                        {/* รายการสถิติ */}
                        <div className="flex flex-col gap-2.5 mb-4">
                            {stats.map((s, idx) => (
                                <div
                                    key={s.label}
                                    className="flex items-baseline justify-between gap-3"
                                    style={{
                                        opacity: 0,
                                        animation: showStamp
                                            ? `line-in 0.4s ease-out ${0.25 + idx * 0.18}s both`
                                            : "none",
                                    }}
                                >
                                    <span className="text-base font-bold whitespace-nowrap" style={{ color: "#2B2118" }}>
                                        {s.label}
                                    </span>
                                    <span className="flex-1 border-b border-dotted mb-1" style={{ borderColor: "#c9b48f" }} />
                                    <span
                                        className="font-mono font-bold tracking-wider text-base whitespace-nowrap"
                                        style={{ color: s.color }}
                                    >
                                        {s.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div
                            className="border-t-2 border-dashed mb-4"
                            style={{
                                borderColor: "#c9b48f",
                                opacity: 0,
                                animation: showStamp ? "line-in 0.3s ease-out 0.82s both" : "none",
                            }}
                        />

                        {/* ข้อความสรุป */}
                        <p
                            className="text-base leading-start text-center mb-1"
                            style={{
                                color: "#4a4033",
                                opacity: 0,
                                animation: showStamp
                                    ? "line-in 0.4s ease-out 0.95s both"
                                    : "none",
                            }}
                        >
                            คุณตามหาใบเสร็จที่หายไปครบแล้ว เอกสารการเงินเป็นหลักฐานสำคัญในการตรวจสอบรายรับรายจ่าย
                            ทุกครั้งที่ใช้เงินกองกลาง ควรเก็บใบเสร็จหรือหลักฐานให้ครบถ้วน
                        </p>

                        <div
                            className="border-t-2 border-dashed mt-4 mb-5"
                            style={{
                                borderColor: "#c9b48f",
                                opacity: 0,
                                animation: showStamp ? "line-in 0.3s ease-out 1.15s both" : "none",
                            }}
                        />

                        {/* ปุ่ม */}
                        <div
                            className="flex justify-center items-center gap-3"
                            style={{
                                opacity: 0,
                                animation: showStamp ? "line-in 0.4s ease-out 1.3s both" : "none",
                            }}
                        >
                            <button
                                onClick={() => navigate("/map")}
                                className="result-button result-button-yellow"
                            >
                                <span className="result-button-top">กลับหน้าหลัก</span>
                            </button>
                            <button
                                onClick={() => navigate("/unit3/level2/intro")}
                                className="result-button result-button-green"
                            >
                                <span className="result-button-top">ด่านต่อไป</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ตราปั๊มหมึก "สำเร็จ" เอียงทับมุมขวาบน */}
                {/* แสดงเฉพาะเมื่อ showStamp=true เพื่อไม่ให้โผล่ก่อน animation */}
                {showStamp && (
                    <div
                        className="absolute top-12 right-100 z-20 select-none"
                        style={{
                            // ใช้ both: ระหว่าง delay ให้อยู่ที่ keyframe แรก (opacity 0)
                            animation: "stamp-pop 0.55s ease-out both",
                        }}
                    >
                        <div
                            className="w-40 h-40 rounded-full border-[3px] flex flex-col items-center justify-center gap-0.5 bg-[#F8F3E3]/90"
                            style={{
                                borderColor: "#2F6B4F",
                                mixBlendMode: "multiply",
                            }}
                        >
                            <div
                                className="w-[150px] h-[150px] rounded-full border border-dashed flex flex-col items-center justify-center"
                                style={{ borderColor: "#2F6B4F" }}
                            >
                                <img
                                    src={ResultPass}
                                    alt=""
                                    className="w-36 h-36 rounded-full object-cover mb-0.5 opacity-90"
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
