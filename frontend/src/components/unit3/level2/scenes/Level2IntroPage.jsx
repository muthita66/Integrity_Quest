import { useState } from "react";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneFour from "./SceneFour";
import SceneMission from "./SceneMission";
import IntroDialog from "./IntroDialog";
import { IoMdSkipForward } from "react-icons/io";



import bgLevel2 from "../../../../assets/unit3/level2/bgLevel2.png"

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
        title: "เงินกิจกรรมของชมรม",
        description: "หลังจากกิจกรรมของชมรมสิ้นสุดลง สมาชิกได้นำเงินค่าสมัครและเงินสนับสนุน มามอบให้เหรัญญิกเป็นผู้ดูแล",
        showBack: false,
    },
    {
        speaker: "ตะวัน (เหรัญญิก)",
        title: "เงินถูกเก็บรวมกัน",
        description: "เหรัญญิกรีบนำเงินกิจกรรมใส่ไว้ในกระเป๋าเดียวกับเงินส่วนตัว ทำให้ไม่สามารถแยกได้ว่าธนบัตรใบใดเป็นเงินของตนเอง และใบใดเป็นเงินของชมรม",
        showBack: true,
    },
    {
        speaker: "ตะวัน (เหรัญญิก)",
        title: "ผลกระทบที่ตามมา",
        description: "เมื่อเงินส่วนตัวและเงินกองกลางถูกเก็บปะปนกัน อาจเกิดการหยิบเงินผิด ใช้เงินผิดวัตถุประสงค์ บันทึกบัญชีคลาดเคลื่อน และทำให้ไม่สามารถตรวจสอบที่มาของเงินได้",
        showBack: true,
    },
    {
        speaker: "ตะวัน (เหรัญญิก)",
        title: "ถึงเวลาช่วยเหรัญญิกแล้ว",
        description: "คุณต้องตรวจสอบเงินแต่ละรายการ แล้วตัดสินใจว่าเป็นเงินส่วนตัวหรือเงินกองกลาง เพื่อไม่ให้เงินของชมรมถูกนำไปใช้ผิดวัตถุประสงค์",
        nextText: "ดูภารกิจ",
        showBack: true,
    },
];

export default function Level2IntroPage() {
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

                    <CurrentScene
                        onNext={handleNext}
                        onBack={handleBack}
                        sceneIndex={currentScene}
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