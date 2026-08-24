import { useState } from "react";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneMission from "./SceneMission";
import IntroDialog from "./IntroDialog";
import { IoMdSkipForward } from "react-icons/io";

import bgLevel2 from "../../../../assets/unit3/level2/bgLevel2.png"

const scenes = [
    SceneOne,
    SceneTwo,
    SceneThree,
    SceneMission,
];

const sceneData = [
    {
        speaker: "ประธานชมรม",
        title: "พรุ่งนี้ชมรมของเราจะออกค่ายอาสาแล้ว!",
        description: "แต่ตอนนี้เรายังต้องจัดซื้ออุปกรณ์และเตรียมงบประมาณให้เรียบร้อย ถ้าบริหารเงินผิดพลาด งานค่ายอาจมีปัญหาได้",
        showBack: false,
    },
    {
        speaker: "ประธานชมรม",
        title: "แย่แล้ว...",
        description: "เหรัญญิกของชมรมติดธุระกะทันหัน ไม่สามารถมาดูแลงบประมาณได้ ทุกคนเลยลงความเห็นว่า... \"ให้เธอช่วยรับหน้าที่แทน\"",
        showBack: true,
    },
    {
        speaker: "ประธานชมรม",
        title: "นี่คือเงินงบประมาณสำหรับค่าย",
        description: "รวมทั้งหมด 10,000 บาท ใช้เงินให้คุ้มค่า ซื้อเฉพาะของที่จำเป็น และอย่าลืมตรวจสอบใบเสร็จทุกครั้ง ทุกการตัดสินใจของเธอมีผลต่อความสำเร็จของค่ายครั้งนี้",
        nextText: "ดูภารกิจ",
        showBack: true,
    },
];

export default function FinalLevelIntroPage() {
    const [currentScene, setCurrentScene] = useState(0);

    const CurrentScene = scenes[currentScene];

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene((previous) => previous + 1);
        }
    };

    const handleBack = () => {
        if (currentScene > 0) {
            setCurrentScene((previous) => previous - 1);
        }
    };

    const handleSkip = () => {
        setCurrentScene(scenes.length - 1);
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-black font-sara">

            <div className="relative z-10 flex h-full flex-col">
                {/* Header */}
                <header className="relative z-30 px-5 pt-5 pb-0 md:px-10 font-sara mt-6">
                    <div className="flex w-[1024px] mx-auto items-center justify-between border-4 border-black bg-yellow-100 px-5 py-3 shadow-xl">

                        {/* ซ้าย */}
                        <div className="flex items-center gap-4">
                            <p className="text-2xl font-black text-amber-700 md:text-lg whitespace-nowrap sarabun-extrabold">
                                Unit 3 : The Club Budget <span className="text-lg font-black text-amber-950">เหรัญญิกจำเป็น</span>
                            </p>
                        </div>

                        {currentScene < scenes.length - 1 && (
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="
                                    rounded-full border-2 border-white/80
                                    bg-black/40 px-2 py-2
                                    font-bold text-white shadow-lg
                                    backdrop-blur-sm
                                    transition-all duration-300
                                    hover:scale-105 hover:bg-black/60
                                    active:scale-95
                                "
                            >
                                <IoMdSkipForward />
                            </button>
                        )}
                    </div>
                </header>

                {/* Scene content */}
                <section className="relative flex min-h-0 flex-1 justify-center">
                    <div className="w-[1024px] flex flex-col">
                        <CurrentScene
                            onNext={handleNext}
                            onBack={handleBack}
                            sceneIndex={currentScene}
                            totalScenes={scenes.length}
                        />

                        {currentScene < 3 && (
                            <div className="relative z-10 font-sara mt-0">
                                <IntroDialog
                                    speaker={sceneData[currentScene].speaker}
                                    title={sceneData[currentScene].title}
                                    description={sceneData[currentScene].description}
                                    onNext={handleNext}
                                    onBack={handleBack}
                                    showBack={sceneData[currentScene].showBack}
                                    nextText={sceneData[currentScene].nextText || "ต่อไป"}
                                    currentScene={currentScene}
                                    totalScenes={3}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}
