import React, { useState } from 'react';
import bgGame from "../../assets/bg_game.png"
import bgLevel1 from "../../assets/unit1/bg_Level1.png"
import Mirror from "../../assets/unit1/Mirror.png"
import Hero from "../../assets/hero_mascot.png"
import MirrorHero from "../../assets/unit1/mirror_hero.png"
// รายการคำถามจำลองวัดใจ (Scenario-based)
const QUIZ_DATA = [
    {
        id: 1,
        question: "เจอกระเป๋าตังค์ตกอยู่ที่พื้นสโมฯ ในเวลาที่ไม่มีใครมองเห็นเลย?",
        options: [
            {
                text: "หยิบไปส่งคืนเจ้าหน้าที่ หรือประกาศตามหาเจ้าของทันที",
                score: { integrity: 10, responsibility: 10 },
                expression: "smile" // อารมณ์ในกระจกเมื่อเลือกข้อนี้
            },
            {
                text: "หันซ้ายหันขวา ลังเลว่าจะเก็บไว้เองดีไหม...",
                score: { integrity: 0, responsibility: 2 },
                expression: "hesitant" // อารมณ์ในกระจกเมื่อเลือกข้อนี้
            }
        ]
    },
    {
        id: 2,
        question: "เพื่อนสนิทขอร้องให้คุณเซ็นชื่อเข้าเรียนแทนในคาบเช้าสุดโหด?",
        options: [
            {
                text: "ปฏิเสธอย่างสุภาพ และบอกให้เพื่อนตื่นมาเรียนเอง",
                score: { integrity: 10, responsibility: 5 },
                expression: "smile"
            },
            {
                text: "เซ็นให้ขำๆ ถือว่าช่วยๆ กัน ใครๆ เขาก็ทำกัน",
                score: { integrity: 0, responsibility: 0 },
                expression: "hesitant"
            }
        ]
    }
];

export default function MirrorQuiz({ onQuizComplete }) {
    const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'result'
    const [currentIdx, setCurrentIdx] = useState(0);
    const [hoveredOption, setHoveredOption] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [savedScores, setSavedScores] = useState({ integrity: 0, responsibility: 0 });
    const [isFinished, setIsFinished] = useState(false);

    const currentQuiz = QUIZ_DATA[currentIdx];

    const handleSelectOption = (option) => {
        setSelectedOption(option);
    };

    const handleContinue = () => {
        if (!selectedOption) return;

        const score = selectedOption.score;
        const updatedScores = {
            integrity: savedScores.integrity + score.integrity,
            responsibility: savedScores.responsibility + score.responsibility
        };
        setSavedScores(updatedScores);

        if (currentIdx + 1 < QUIZ_DATA.length) {
            setCurrentIdx(currentIdx + 1);
            setSelectedOption(null);
            setHoveredOption(null);
        } else {
            setIsFinished(true);
            if (onQuizComplete) onQuizComplete(updatedScores);
        }
    };

    // เลือกการแสดงผลใบหน้าตัวละครในกระจกวิเศษ
    const renderMirrorCharacter = () => {
        const currentExpression = hoveredOption
            ? hoveredOption.expression
            : (selectedOption ? selectedOption.expression : "normal");

        switch (currentExpression) {
            case "smile":
                return (
                    <div className="flex flex-col items-center animate-fade-in">
                        <div className="text-6xl mb-2">😊</div>
                        <p className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">ซื่อสัตย์สุจริต</p>
                    </div>
                );
            case "hesitant":
                return (
                    <div className="flex flex-col items-center animate-pulse">
                        <div className="text-6xl mb-2">😟</div>
                        <p className="text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-full text-xs">กำลังลังเล...</p>
                    </div>
                );
            default:
                return (
                    <div className="flex flex-col items-center">
                        <div className="text-6xl mb-2">😐</div>
                        <p className="text-slate-400 text-xs">สะท้อนจิตใจของคุณ</p>
                    </div>
                );
        }
    };

    if (isFinished) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative"
                style={{
                    backgroundImage: `url(${bgGame})`,
                }}>

                {/* Main Card */}
                <div className="w-full max-w-2xl bg-slate-50/80 backdrop-blur-sm rounded-[2rem] py-8 px-12 border-4 border-slate-800 shadow-2xl relative text-center">
                    <div className="flex justify-center mb-3">
                        <div className="relative inline-block">
                            <img
                                src={MirrorHero}
                                alt="Mirror Hero"
                                className="w-64 h-auto object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.15)]"
                            />
                            {/* แสงแวบวับแนวเฉียง — ครอบเฉพาะพื้นที่กระจก */}
                            <div
                                className="mirror-glint"
                                style={{
                                    top: '12%',
                                    left: '20%',
                                    width: '60%',
                                    height: '76%',
                                    borderRadius: '4px',
                                }}
                            />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">กระจกวิเศษได้บันทึกจิตใจของคุณแล้ว</h2>
                    <div className="flex justify-center mt-5 mb-1">
                        <button className="bg-orange-600 hover:bg-orange-500 text-white font-black text-xl px-10
                         py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all tracking-wider">
                            NEXT LEVEL
                        </button>
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}
        >
            <div className="w-full max-w-5xl bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-16 border-3 border-black shadow-2xl relative overflow-hidden text-center">

                {/* Header unit */}
                <div className="absolute top-0 left-0 bg-orange-600 hover:bg-orange-500 text-white font-bold px-6 py-2 rounded-br-2xl text-lg shadow-md">
                    Unit 1: กำเนิดผู้พิทักษ์ (The Origin)
                </div>

                <div className='mb-6'>
                    <div>
                        <h2 className="text-2xl mt-4 md:text-3xl font-black text-slate-700 tracking-wider">Level 1: Mirror of Integrity</h2>
                        <h1 className="text-xl font-bold mt-1 text-black">กระจกวิเศษส่องจิต (Mirror of Integrity)</h1>
                    </div>
                </div>

                {/* Main Gameplay Screen */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center justify-center p-6 rounded-2xl border border-slate-800/60 max-w-4xl mx-auto w-full"
                    style={{
                        backgroundImage: `url(${bgLevel1})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}>

                    {/* บานกระจกวิเศษตรงกลาง */}
                    <div className="flex-1 flex justify-center">
                        <div className="relative flex items-center justify-center group">
                            {/* รูปกระจก */}
                            <img
                                src={Mirror}
                                alt="Magic Mirror"
                                className="w-64 h-auto object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                            />
                            {/* overlay อารมณ์ตรงกลางกระจก (ส่วนแก้ว = ~top 15% ถึง 70% ของรูป) */}
                            <div className="absolute top-[15%] left-0 right-0 h-[55%] flex flex-col items-center justify-center">
                                {renderMirrorCharacter()}
                            </div>
                        </div>
                    </div>

                    {/* ส่วนคำถามและกล่องคำตอบ (ด้านขวา) */}
                    <div className="flex-1 w-full max-w-md flex flex-col justify-center space-y-4">
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-inner">
                            <h3 className="text-md font-semibold text-slate-300 leading-relaxed text-left">
                                {currentQuiz.question}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {currentQuiz.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(opt)}
                                    onMouseEnter={() => setHoveredOption(opt)}
                                    onMouseLeave={() => setHoveredOption(null)}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 group text-sm font-medium
                                        ${selectedOption === opt
                                            ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200 ring-2 ring-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                                            : 'border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:border-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.15)] text-slate-200'}`}
                                >
                                    <div className={`mt-0.5 w-5 h-5 flex items-center justify-center rounded-lg text-xs font-bold transition-colors
                                        ${selectedOption === opt
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-700 text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                        {idx === 0 ? 'A' : 'B'}
                                    </div>
                                    <span className="flex-1 leading-relaxed">{opt.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* ปุ่ม CONTINUE */}
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleContinue}
                        disabled={!selectedOption}
                        className={`border-2 px-6 py-2.5 rounded-xl font-bold transition-all duration-200
                            ${selectedOption
                                ? 'bg-white/90 hover:bg-white border-indigo-500 text-slate-800 shadow-md active:scale-95 cursor-pointer'
                                : 'bg-white/20 border-slate-300 text-slate-400 cursor-not-allowed'}`}
                    >
                        {currentIdx === QUIZ_DATA.length - 1 ? 'FINISH' : 'CONTINUE'}
                    </button>
                </div>
            </div>
        </div>
    );
};
