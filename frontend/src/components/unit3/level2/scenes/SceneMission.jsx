import { FaPlay, FaHome, FaCircle } from "react-icons/fa";
import { IoMdSkipForward } from "react-icons/io";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { TbDeviceGamepadFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

import "../../../../styles/unit1/Level1/button.css";
import bgGameLevel2 from "../../../../assets/unit3/level2/bgGameLevel2.png"

export default function SceneMission({
    scene,
    onNext,
    onBack,
    handleSkip,
    currentScene,
    totalScenes,
}) {
    const navigate = useNavigate();
    const mission = scene?.sceneMission?.[0];
    const rules = mission?.sceneMissionRules || [];

    // เลือกสีตาม rule_id
    const getRuleStyle = (ruleId) => {
        switch (ruleId) {
            case 9:
                return "bg-yellow-50 border-yellow-200";
            case 11:
                return "bg-green-50 border-green-200";
            case 14:
                return "bg-red-50 border-red-200";
            default:
                return "bg-white/70 border-white/70";
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={bgGameLevel2}
                alt="Mission"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Dark Overlay since bg is too bright */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Skip Button */}
            <button
                type="button"
                onClick={handleSkip}
                className={`
                    absolute top-4 right-20 z-20
                    rounded-full border-2 border-white/80
                    bg-black/40 p-2
                    text-white shadow-lg
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:bg-black/60
                    active:scale-95
                    ${currentScene < totalScenes - 1 ? "" : "invisible"}
                `}
            >
                <IoMdSkipForward className="text-2xl" />
            </button>

            {/* Home Button */}
            <button
                type="button"
                onClick={() => navigate('/map')}
                className={`
                    absolute top-4 right-4 z-20
                    rounded-full border-2 border-white/80
                    bg-black/40 p-2
                    text-white shadow-lg
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:bg-black/60
                    active:scale-95
                `}
            >
                <FaHome className="text-2xl" />
            </button>

            {/* Game Instruction Box */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-4xl">
                <div className="
                    rounded-3xl
                    border border-white/70
                    bg-white/60
                    px-8 py-5
                    shadow-2xl
                    backdrop-blur-md
                ">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h2 className="text-2xl md:text-3xl font-bold text-black sarabun-bold">
                            {mission?.title || "ภารกิจบัญชีใครบัญชีมัน"}
                        </h2>
                        <p className="mt-0 text-base md:text-lg text-black sarabun-bold">
                            {mission?.subtitle || "แยกเงินส่วนตัวออกจากเงินกองกลางให้ถูกต้อง"}
                        </p>
                    </div>

                    {/* Description - ตัวอย่าง */}
                    <div className="rounded-2xl bg-white/80 border-2 border-dashed border-amber-400 px-5 py-4 mb-5 shadow-sm text-center">
                        <h4 className="mb-2 text-center font-black text-lg sarabun-bold">ตัวอย่าง</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm sarabun-bold">
                            <div className="rounded-xl bg-green-50 p-2 flex flex-col justify-center items-center">
                                <p className="flex items-center gap-2 mb-1">
                                    <FaCircle className="text-xs text-green-500" />
                                    <span>ค่าอาหารค่ายอาสา</span>
                                </p>
                                <p className="font-bold text-green-700">เงินกองกลาง</p>
                            </div>
                            <div className="rounded-xl bg-red-50 p-2 flex flex-col justify-center items-center">
                                <p className="flex items-center gap-2 mb-1">
                                    <FaCircle className="text-xs text-red-500" />
                                    <span>ซื้อของให้ตัวเอง</span>
                                </p>
                                <p className="font-bold text-red-700">เงินส่วนตัว</p>
                            </div>
                            <div className="rounded-xl bg-yellow-50 p-2 flex flex-col justify-center items-center">
                                <p className="flex items-center gap-2 mb-1">
                                    <FaCircle className="text-xs text-yellow-500" />
                                    <span>ซื้อของว่างให้ทีมงาน</span>
                                </p>
                                <p className="font-bold text-yellow-700">แล้วแบบนี้ควรใช้เงินของใคร?</p>
                            </div>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className={`rounded-2xl border px-4 py-2 text-center ${getRuleStyle(rule.rule_id)}`}>
                                {rule.image_path && (
                                    <div className="mb-1 mx-auto flex justify-center">
                                        <img
                                            src={`/image/${rule.image_path}`}
                                            alt={rule.title || "Rule"}
                                            className="w-12 h-12 object-contain" />
                                    </div>
                                )}

                                <p className="font-bold text-gray-800 sarabun-bold">
                                    {rule.title || ""}
                                </p>

                                <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                    {rule.description || ""}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Start Button & Back */}
                    <div className="flex w-full justify-center gap-6 items-center">
                        <button
                            type="button"
                            onClick={onBack}
                            className="circle-play-button yellow"
                        >
                            <div className="circle-play-button__outer">
                                <div className="circle-play-button__shadow"></div>
                                <div className="circle-play-button__main">
                                    <FaPlay
                                        className="circle-play-button__icon scale-x-[-1]"
                                        size={26}
                                    />
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            className="circle-play-button green"
                            onClick={onNext}
                            aria-label="เริ่มภารกิจ"
                        >
                            <div className="circle-play-button__outer">
                                <div className="circle-play-button__shadow"></div>
                                <div className="circle-play-button__main">
                                    <FaPlay
                                        className="circle-play-button__icon"
                                        size={26}
                                    />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}