import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import SceneOne from "./SceneOne";
import SceneTwo from "./SceneTwo";
import SceneThree from "./SceneThree";
import SceneMission from "./SceneMission";
import IntroDialog from "./IntroDialog";
import { IoMdSkipForward } from "react-icons/io";

import bgLevel2 from "../../../../assets/unit3/level2/bgLevel2.png";

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
        description:
            "แต่ตอนนี้เรายังต้องจัดซื้ออุปกรณ์และเตรียมงบประมาณให้เรียบร้อย ถ้าบริหารเงินผิดพลาด งานค่ายอาจมีปัญหาได้",
        showBack: false,
    },
    {
        speaker: "ประธานชมรม",
        title: "แย่แล้ว...",
        description:
            'เหรัญญิกของชมรมติดธุระกะทันหัน ไม่สามารถมาดูแลงบประมาณได้ ทุกคนเลยลงความเห็นว่า... "ให้เธอช่วยรับหน้าที่แทน"',
        showBack: true,
    },
    {
        speaker: "ประธานชมรม",
        title: "นี่คือเงินงบประมาณสำหรับค่าย",
        description:
            "รวมทั้งหมด 10,000 บาท ใช้เงินให้คุ้มค่า ซื้อเฉพาะของที่จำเป็น และอย่าลืมตรวจสอบใบเสร็จทุกครั้ง ทุกการตัดสินใจของเธอมีผลต่อความสำเร็จของค่ายครั้งนี้",
        nextText: "ดูภารกิจ",
        showBack: true,
    },
];

export default function FinalLevelIntroPage() {
    const [currentScene, setCurrentScene] = useState(0);
    const [fetchedSceneData, setFetchedSceneData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchScenes = async () => {
            try {
                const response = await fetch(
                    "http://localhost:5000/api/introDialog/level/10"
                );

                if (!response.ok) {
                    throw new Error("Unable to fetch Unit 3 final level intro scenes");
                }

                setFetchedSceneData(await response.json());
            } catch (error) {
                console.error("Error fetching Unit 3 final level scenes:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScenes();
    }, []);

    const CurrentScene = scenes[currentScene];
    const activeSceneData = fetchedSceneData.length > 0 ? fetchedSceneData : sceneData;

    const navigate = useNavigate();

    const handleNext = () => {
        if (currentScene < scenes.length - 1) {
            setCurrentScene((previous) => previous + 1);
        } else {
            navigate("/unit3/final");
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

            {/* Skip Button */}
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

                    {!loading && (
                        <CurrentScene
                            scene={activeSceneData[currentScene]}
                            onNext={handleNext}
                            onBack={handleBack}
                            handleSkip={handleSkip}
                            currentScene={currentScene}
                            totalScenes={scenes.length}
                        />
                    )}

                </div>
            </section>

            {/* Dialog positioned relative to main */}
            {currentScene < 3 && !loading && (
                <div className="absolute bottom-10 left-0 z-30 w-full">
                    <IntroDialog
                        speaker={activeSceneData[currentScene]?.introDialog?.[0]?.speaker || sceneData[currentScene]?.speaker}
                        title={activeSceneData[currentScene]?.introDialog?.[0]?.title || sceneData[currentScene]?.title}
                        text={activeSceneData[currentScene]?.introDialog?.[0]?.text || sceneData[currentScene]?.description}
                        onNext={handleNext}
                        onBack={handleBack}
                        showBack={currentScene > 0}
                        nextText={
                            sceneData[currentScene].nextText || "ต่อไป"
                        }
                        currentScene={currentScene}
                        totalScenes={3}
                    />
                </div>
            )}
        </main>
    );
}
