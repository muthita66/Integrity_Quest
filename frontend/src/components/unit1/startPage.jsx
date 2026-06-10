import React from 'react'
import { useNavigate } from 'react-router-dom'
import bgGameLevel1 from "../../assets/unit1/bgGameLevel1.jpg"

const startPage = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed relative"
            style={{
                backgroundImage: `url(${bgGameLevel1})`,
            }}>

            {/* Main Card */}
            <div className="w-full max-w-2xl bg-slate-50/80 backdrop-blur-sm rounded-[2rem] p-16 border-4 border-slate-800 shadow-2xl relative text-center">
                <h2 className="text-6xl font-black text-slate-900 mb-4 tracking-wider">Level 1</h2>
                <p className="text-3xl font-black text-slate-800 mb-10">"Magic Mirror"</p>
                <button
                    onClick={() => navigate("/unit1/Quizlevel1")}
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-xl"
                >
                    START
                </button>
            </div>
        </div>
    )
}

export default startPage
