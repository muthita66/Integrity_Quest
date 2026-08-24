import React from 'react';

export default function MissionCard({ currentMission, handleSelectOption, money, image }) {
    return (
        <div className="flex flex-col gap-4 w-full">
            {/* กล่องคำถาม */}
            <div className="relative w-full max-w-5xl h-auto bg-white/60 backdrop-blur-md p-5 md:p-6 pt-8 md:pt-8 rounded-[2rem] shadow-xl border-4 border-white/50 flex flex-col justify-center mx-auto mt-6 md:mt-0 sarabud-bold">
                {/* เงินคงเหลือ (มุมขวาบนของกล่อง) */}
                <div className="absolute -top-6 right-4 md:-top-8 md:-right-4 px-4 py-2 rounded-2xl bg-emerald-100 border-2 border-emerald-500 shadow-lg transform rotate-2 md:rotate-3 z-10 flex flex-col items-center justify-center min-w-[100px] md:min-w-[120px]">
                    <p className="text-xs md:text-sm font-bold text-emerald-700 text-center mb-0.5">
                        เงินคงเหลือ
                    </p>
                    <p className="text-lg md:text-2xl font-black text-emerald-600 text-center leading-none">
                        {money} <span className="text-sm md:text-xl font-bold">บาท</span>
                    </p>
                </div>

                {/* ชื่อเฟสของวัน (มุมซ้ายบนของกล่อง) */}
                <div className="absolute -top-4 left-6 md:-top-5 md:left-8 z-10">
                    <span className="bg-amber-400 border-2 border-slate-800 font-black px-5 py-1.5 rounded-full text-slate-800 shadow-md text-sm md:text-base">
                        {currentMission.phase}
                    </span>
                </div>

                {/* รายละเอียดเหตุการณ์ */}
                <div className="w-full text-center px-2">
                    <p className="text-base md:text-xl font-bold text-slate-900 leading-relaxed text-shadow-sm">
                        {currentMission.situation}
                    </p>
                </div>
            </div>

            {/* ช้อยส์ตัวเลือก 3 ปุ่ม */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-5xl mx-auto mt-2">
                {currentMission.options.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleSelectOption(option)}
                        className="h-36 px-4 py-2 bg-white/60 hover:bg-white/80 backdrop-blur-md border-2 border-white/50 hover:border-white rounded-2xl transition-all font-bold text-slate-800 text-center shadow-md hover:shadow-lg active:scale-95 flex flex-col items-center justify-center"
                    >
                        {/* รูปตัวเลือก */}
                        <img
                            src={option.image}
                            alt={`ตัวเลือก ${option.id}`}
                            className="w-28 h-28 object-contain drop-shadow-md"
                        />

                        {/* ชื่อตัวเลือก */}
                        <span className="text-md">
                            {option.text}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
