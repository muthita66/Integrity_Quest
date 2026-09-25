import { FaPlay, FaHome } from "react-icons/fa";
import { IoMdSkipForward } from "react-icons/io";
import { TbDeviceGamepadFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";

import "../../../../styles/unit1/Level1/button.css";
import bgGameLevel2 from "../../../../assets/unit3/level2/bgGameLevel2.png";

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
    const getRuleStyle = (ruleId) => {
        switch (ruleId) {
            case 9:
                return "bg-green-50 border-green-200 text-green-700"; // เป้าหมาย
            case 4:
                return "bg-yellow-50 border-yellow-200 text-yellow-700"; // โบนัส
            case 10:
                return "bg-red-50 border-red-200 text-red-700"; // ระวัง
            default:
                return "bg-white/70 border-white/70 text-gray-700";
        }
    };

    const getRuleImageSrc = (imagePath) => {
        if (!imagePath) return null;

        if (/^https?:\/\//i.test(imagePath)) return imagePath;

        const relativePath = imagePath.replace(/^\/?image\//, "");
        const encodedPath = relativePath
            .split("/")
            .map((pathSegment) => encodeURIComponent(pathSegment))
            .join("/");

        return `/image/${encodedPath}`;
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={bgGameLevel2}
                alt="Mission"
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

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
                            {mission?.title || "ภารกิจ : \"เหรัญญิกจำเป็น\""}
                        </h2>
                        <p className="mt-0 text-base md:text-lg text-black sarabun-bold">
                            {mission?.subtitle || "ในฐานะเหรัญญิกจำเป็น คุณต้องบริหารงบค่าย เลือกซื้อสิ่งจำเป็น ใช้เงินอย่างคุ้มค่า และเก็บหลักฐานให้ถูกต้อง"}
                        </p>
                    </div>

                    {/* Description - คำแนะนำ */}
                    <div className="rounded-2xl bg-blue-50 border border-blue-200 px-5 py-4 mb-5 flex items-center gap-4">
                        <TbDeviceGamepadFilled className="text-5xl text-blue-500 shrink-0" />
                        <div>
                            <h4 className="font-bold text-blue-700 text-lg sarabun-bold">{mission?.text ? "คำอธิบาย" : "คำแนะนำ"}</h4>
                            <p className="text-gray-700 text-sm md:text-base sarabun-bold whitespace-pre-line">
                                {mission?.text || "วางแผนก่อนซื้อทุกครั้ง เพราะทุกการใช้เงินส่งผลต่อความสำเร็จของค่ายอาสา"}
                            </p>
                        </div>
                    </div>

                    {/* Rules */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        {rules.map((rule) => {
                            const imageSrc = getRuleImageSrc(rule.image_path);

                            return (
                                <div
                                    key={rule.id}
                                    className={`rounded-2xl border px-4 py-2 text-center ${getRuleStyle(rule.rule_id)}`}>
                                {imageSrc && (
                                    <div className="mb-1 mx-auto flex justify-center">
                                        <img
                                            src={imageSrc}
                                            alt={rule.title || "Rule"}
                                            className="h-16 w-16 object-contain"
                                            onError={() => console.error("Unable to load rule image:", imageSrc)}
                                        />
                                    </div>
                                )}

                                <p className="font-bold text-gray-800 sarabun-bold">
                                    {rule.title || ""}
                                </p>

                                <p className="text-sm text-gray-600 mt-1 sarabun-light">
                                    {rule.description || ""}
                                </p>
                                </div>
                            );
                        })}
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
                                    <FaPlay className="circle-play-button__icon scale-x-[-1]" size={26} />
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
                                    <FaPlay className="circle-play-button__icon" size={26} />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
