import React from 'react';
import { FaLightbulb } from "react-icons/fa";
import { LuAlarmClock } from "react-icons/lu";
import { IoIosStar } from "react-icons/io";
import { MdTask } from "react-icons/md";
import bgGame from "../../../assets/bg_game.png";
import bgMission from "../../../assets/unit2/bgLevel2.png"

export default function StartPage({ setIsStarted }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
            style={{
                backgroundImage: `url(${bgGame})`,
            }}>

            <div className="relative w-full max-w-4xl flex items-center justify-center">
                {/* รูปกรอบ — ไม่ยืด เพราะใช้ img จริง */}
                <img
                    src={bgMission}
                    alt="frame"
                    className="w-full h-auto pointer-events-none select-none"
                />

                {/* เนื้อหาด้านในกรอบ */}
                <div className="absolute inset-0 flex flex-col items-center justify-center px-12 pb-8 pt-12">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 md:mb-6 tracking-wider text-center">Level 2: Calculation Puzzle</h2>
                    <p className="font-black text-slate-800 flex items-center justify-center gap-2 text-xl md:text-2xl mb-1 md:mb-2">
                        <FaLightbulb className='text-amber-500 text-xl md:text-2xl' /> กติกา
                    </p>
                    <div className='text-base md:text-lg grid grid-cols-[2.25rem_1fr] items-center gap-y-3 md:gap-y-4'>
                        <MdTask className='text-slate-500 text-2xl md:text-3xl' />
                        <span>คำถามทั้งหมด <span className="font-black text-slate-900 text-lg md:text-xl">5 ข้อ</span></span>

                        <IoIosStar className='text-yellow-500 text-2xl md:text-3xl' />
                        <span>ตอบถูกรับข้อละ <span className="font-black text-emerald-600 text-lg md:text-xl">+ 5 HP</span> (ถ้าตอบผิดจะได้ 0 HP ในข้อนั้น)</span>

                        <LuAlarmClock className='text-slate-600 text-2xl md:text-3xl' />
                        <span>จับเวลาข้อละ <span className="font-black text-rose-500 text-lg md:text-xl">20 วินาที</span> เท่านั้น!</span>
                    </div>
                    <p className="text-sm md:text-base text-rose-400 font-semibold text-center pt-2 md:pt-3 mt-1 md:mt-2 border-t border-amber-200">
                        หากหมดเวลาก่อนตอบ จะต้องเริ่มต้นใหม่หมดตั้งแต่ข้อแรก ตั้งสติให้ดีๆ
                    </p>

                    <div className="mt-10 md:mt-10">
                        <button
                            onClick={() => setIsStarted(true)}
                            className="button-with-icon"
                        >
                            START!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
