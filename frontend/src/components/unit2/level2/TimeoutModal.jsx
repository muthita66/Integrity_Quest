import React from "react";

import bgGame from "../../../assets/bg_game.png";
import bgLevel2 from "../../../assets/unit2/bgLevel2.png";
import failed from "../../../assets/unit2/Level2/Failed.png";
import BackgroundImg from "../../../assets/unit2/Level2/sceneLevel2.png";

export default function TimeoutModal({ resetGame }) {
    return (
        <div
            className="
        fixed
        inset-0
        flex
        items-center
        justify-center
        z-[999]
        bg-cover
        bg-center
        bg-no-repeat
        px-4
        sarabun-bold
    "
            style={{
                backgroundImage: `url(${BackgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >

            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            <div
                className="relative z-10 w-full max-w-3xl min-h-[500px] rounded-[32px] border-[5px] border-[#8B5A2B] bg-[#FFF4D6] shadow-[0_15px_35px_rgba(0,0,0,0.45)] overflow-hidden">
                <div
                    className="absolute inset-3 rounded-[25px] border-[2px] border-[#D8B36A] pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 rounded-b-full bg-[#8B5A2B]" />
                <div className="relative z-10 flex min-h-[500px] flex-col items-center justify-center px-8 py-10 text-center">
                    <img
                        src={failed}
                        alt="หมดเวลา"
                        className="w-52 md:w-64 h-auto mb-2 pointer-events-none select-none drop-shadow-[0_6px_5px_rgba(0,0,0,0.25)]" />
                    <div className="relative mb-3">
                        <h2
                            className="text-4xl md:text-5xl font-black text-[#E84855] drop-shadow-[0_3px_0_#8B2F35]">
                            หมดเวลาแล้ว!
                        </h2>
                        <div
                            className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-32 h-1 rounded-full bg-[#E8A928]" />
                    </div>
                    <div className="mt-4 mb-7 w-full max-w-xl rounded-2xl border-2 border-[#E3C98A] bg-[#FFF9E8] px-6 py-4 shadow-[inset_0_2px_8px_rgba(139,90,43,0.08)]">
                        <p className="text-xl md:text-2xl font-black text-[#8B5A2B] mb-1">คุณเล่นไม่ทันเวลา</p>
                        <p className="text-base md:text-lg font-medium leading-relaxed text-[#5A4633]">
                            ไม่เป็นไรนะ!
                            <br />
                            ลองกลับไปเริ่มใหม่
                            และวางแผนการคำนวณให้เร็วขึ้น
                        </p>
                    </div>

                    <button
                        onClick={resetGame}
                        className="
                    relative
                    min-w-[190px]
                    h-[64px]
                    px-8
                    rounded-[22px]
                    border-[4px]
                    border-[#D99616]
                    bg-gradient-to-b
                    from-[#FFD95A]
                    via-[#FFC928]
                    to-[#F2A900]
                    text-[#5A3B0A]
                    text-xl
                    font-black
                    shadow-[0_6px_0_#B9780C,0_9px_15px_rgba(0,0,0,0.25),inset_0_3px_5px_rgba(255,255,255,0.8)]
                    hover:-translate-y-1
                    hover:brightness-105
                    active:translate-y-1
                    active:shadow-[0_2px_0_#B9780C]
                    transition-all"
                    >
                        TRY AGAIN
                    </button>

                </div>
            </div>
        </div>
    );
}