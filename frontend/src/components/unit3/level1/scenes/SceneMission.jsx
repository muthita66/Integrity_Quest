import { FaPlay, FaHome } from "react-icons/fa";
import { IoMdSkipForward } from "react-icons/io";
import { MdTimer } from "react-icons/md";
import { GiTargetArrows } from "react-icons/gi";
import { ImCross } from "react-icons/im";
import { useNavigate } from "react-router-dom";

import "../../../../styles/unit1/Level1/button.css";
import BgMission from "../../../../assets/unit3/level1/intro/sceneMission.png";
import Receipt from '../../../../assets/unit3/level1/intro/receipt.png'
import TaxReceipt from '../../../../assets/unit3/level1/intro/tax.png'
import CashReceipt from '../../../../assets/unit3/level1/intro/cash.png'

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
    const rules = mission?.sceneMissionRules || []

    const getRuleStyle = (ruleId) => {
        switch (ruleId) {
            case 1:
                return "bg-green-50 border-green-200";
            case 2:
                return "bg-blue-50 border-blue-200";
            case 3:
                return "bg-gray-50 border-gray-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={BgMission}
                alt="Mission"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

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
                    bg-white/55
                    px-8 py-5
                    shadow-2xl
                    backdrop-blur-md
                ">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <h2 className="text-2xl md:text-3xl font-bold text-black sarabun-bold">
                            {mission?.title || "ภารกิจตามหาใบเสร็จ"}
                        </h2>
                        <p className="mt-0 text-base md:text-lg text-black sarabun-bold">
                            {mission?.subtitle || "ค้นหาเอกสารการเงินให้ครบก่อนหมดเวลา"}
                        </p>
                    </div>

                    {/* Description - เอกสารที่ต้องหา */}
                    <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 px-5 py-4 mb-5 shadow-sm text-center">
                        <h3 className="mb-2 text-lg font-black text-black sarabun-bold">
                            เอกสารที่ต้องหา
                        </h3>

                        <div className="grid grid-cols-3 gap-6 items-start sarabun-bold">

                            {/* ใบเสร็จรับเงิน */}
                            <div className="flex flex-col items-center">
                                <p className="h-8 flex items-center justify-center text-center font-bold text-black text-sm">
                                    ใบเสร็จรับเงิน
                                </p>

                                <div className="flex items-center justify-center -mt-1">
                                    <img
                                        src={Receipt}
                                        alt="Receipt"
                                        className="w-28 max-h-44 object-contain"
                                    />
                                </div>
                            </div>

                            {/* ใบกำกับภาษี */}
                            <div className="flex flex-col items-center">
                                <p className="h-8 flex items-center justify-center text-center font-bold text-black text-sm">
                                    ใบกำกับภาษี
                                </p>

                                <div className="flex items-center justify-center -mt-1">
                                    <img
                                        src={TaxReceipt}
                                        alt="Tax Receipt"
                                        className="w-32 max-h-44 object-contain"
                                    />
                                </div>
                            </div>

                            {/* ใบสำคัญรับเงิน */}
                            <div className="flex flex-col items-center">
                                <p className="h-8 flex items-center justify-center text-center font-bold text-black text-sm">
                                    ใบสำคัญรับเงิน
                                </p>

                                <div className="flex items-center justify-center -mt-1">
                                    <img
                                        src={CashReceipt}
                                        alt="Cash Receipt"
                                        className="w-36 max-h-44 object-contain"
                                    />
                                </div>
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