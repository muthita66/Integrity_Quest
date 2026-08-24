import React from 'react';

export default function ResultHistoryCard({ m, userAns }) {
    return (
        <div className={`p-4 rounded-xl border-2 ${userAns?.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex justify-between items-center mb-1">
                <span className="font-black text-slate-800">{m.phase}</span>
                <span className={`font-bold text-sm px-2 py-0.5 rounded ${userAns?.isCorrect ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'}`}>
                    {userAns ? (userAns.isCorrect ? "ถูกต้อง" : "ยังไม่คุ้มค่า") : "ไม่ได้ตอบ (หมดเวลา)"}
                </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{m.situation}</p>
            <p className="text-sm font-bold text-slate-700">
                เลือก: {userAns ? userAns.text : <span className="text-rose-500 font-black">หมดเวลาตัวเลือกถูกบล็อก</span>}
            </p>
            {userAns && <p className="text-xs italic text-slate-500 mt-1">วิเคราะห์: {userAns.feedback}</p>}
        </div>
    );
}
