import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import bgScene1 from "../../../../assets/unit3/level1/intro/bgScene1.png"

import { IoMdSkipForward } from "react-icons/io";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneFour from "./SceneFour";
import SceneMission from "./SceneMission";
import IntroDialog from "./IntroDialog";

export default function Level1IntroPage() {
    const [currentScene, setCurrentScene] = useState(0);
    const [direction, setDirection] = useState(1);

    const scenes = [
        SceneOne,
        SceneTwo,
        SceneThree,
        SceneFour,
        SceneMission,
    ];

    const sceneData = [
        {
            speaker: "ตะวัน (เหรัญญิก)",
            title: "ห้องชมรมหลังเลิกเรียน",
            text: "ใกล้ถึงเวลาส่งรายงานงบประมาณประจำเดือนแล้ว แต่โต๊ะทำงานของฉันกลับเต็มไปด้วยเอกสารที่กระจัดกระจาย",
            showBack: false,
        },
        {
            speaker: "ตะวัน (เหรัญญิก)",
            title: "เกิดเรื่องแล้ว!",
            text: "แย่แล้ว! ใบเสร็จและเอกสารการเงินบางส่วนหายไป ถ้าหาไม่ครบ เราจะตรวจสอบรายจ่ายของชมรมไม่ได้",
            showBack: true,
        },
        {
            speaker: "ตะวัน (เหรัญญิก)",
            title: "เอกสารการเงินมีความสำคัญ",
            text: "หากไม่มีใบเสร็จหรือหลักฐานประกอบ รายงานงบประมาณอาจไม่ถูกต้อง และไม่สามารถตรวจสอบที่มาของรายจ่ายได้",
            showBack: true,
        },
        {
            speaker: "ตะวัน (เหรัญญิก)",
            title: "ช่วยค้นหาเอกสารให้ครบ",
            text: "ช่วยฉันค้นหาเฉพาะเอกสารการเงินจริง ได้แก่ ใบเสร็จรับเงิน ใบกำกับภาษี และใบสำคัญรับเงิน อย่าหยิบเอกสารที่ไม่เกี่ยวข้องมาปะปนนะ",
            showBack: true,
        }
    ];

    const CurrentSceneComponent = scenes[currentScene];

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setDirection(1);
            setCurrentScene((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentScene > 0) {
            setDirection(-1);
            setCurrentScene((prev) => prev - 1);
        }
    };

    const handleSkip = () => {
        setDirection(1);
        setCurrentScene(scenes.length - 1);
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-black font-sara">

            <button
                type="button"
                onClick={handleSkip}
                className={`
                    absolute top-4 right-4 z-50
                    rounded-full border-2 border-white/80
                    bg-black/40 p-2
                    text-white shadow-lg
                    backdrop-blur-sm
                    transition-all duration-300
                    hover:scale-105 hover:bg-black/60
                    active:scale-95
                    ${currentScene < scenes.length - 1 ? "" : "invisible"}
                `}
            >
                <IoMdSkipForward className="text-2xl" />
            </button>

            {/* Scene */}
            <section className="relative z-20 flex items-start justify-center">

                <div className="w-full">

                    <CurrentSceneComponent
                        onNext={handleNext}
                        onBack={handleBack}
                        currentScene={currentScene}
                        totalScenes={scenes.length}
                    />

                    {currentScene < 4 && (
                        <div className="relative z-10 mt-100">
                            <IntroDialog
                                speaker={sceneData[currentScene].speaker}
                                title={sceneData[currentScene].title}
                                text={sceneData[currentScene].text}
                                onNext={handleNext}
                                onBack={handleBack}
                                showBack={sceneData[currentScene].showBack}
                                nextText={sceneData[currentScene].nextText || "ต่อไป"}
                                currentScene={currentScene}
                                totalScenes={4}
                            />
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}