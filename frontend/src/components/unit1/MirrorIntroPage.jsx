import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bgGameLevel1 from "../../assets/unit1/bgGameLevel1.jpg";
import textSound from "../../assets/sounds/textSound.mp3";
import magicButton from "../../assets/sounds/magicButton.mp3";

export default function MirrorIntroPage() {
    const navigate = useNavigate();
    const [hasStarted, setHasStarted] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);
    const [showButton, setShowButton] = useState(false);

    const textAudioRef = useRef(new Audio(textSound));
    const magicAudioRef = useRef(new Audio(magicButton));

    const handleInitialClick = () => {
        if (!hasStarted) {
            // ปลดล็อก Audio ในมือถือ (iOS Safari) และเบราว์เซอร์
            textAudioRef.current.play().then(() => {
                textAudioRef.current.pause();
                textAudioRef.current.currentTime = 0;
            }).catch(() => {});

            magicAudioRef.current.play().then(() => {
                magicAudioRef.current.pause();
                magicAudioRef.current.currentTime = 0;
            }).catch(() => {});

            setHasStarted(true);
        }
    };

    useEffect(() => {
        if (!hasStarted) return;

        const playTextSound = () => {
            if (textAudioRef.current) {
                textAudioRef.current.currentTime = 0;
                textAudioRef.current.play().catch(err => {
                    console.warn("Autoplay blocked:", err);
                });
            }
        };

        const playMagicSound = () => {
            if (magicAudioRef.current) {
                magicAudioRef.current.currentTime = 0;
                magicAudioRef.current.play().catch(err => {
                    console.warn("Autoplay blocked:", err);
                });
            }
        };

        const timers = [
            setTimeout(() => {
                setVisibleLines(1);
                playTextSound();
            }, 1000),
            setTimeout(() => {
                setVisibleLines(2);
                playTextSound();
            }, 4000),
            setTimeout(() => {
                setVisibleLines(3);
                playTextSound();
            }, 7000),
            setTimeout(() => setVisibleLines(4), 10000),
            setTimeout(() => {
                setShowButton(true);
                playMagicSound(); // เสียงตอนปุ่มแสดงขึ้นมา
            }, 11000),
        ];

        return () => timers.forEach(clearTimeout);
    }, [hasStarted]);

    const handleStartClick = () => {
        // เล่นเสียงตอนกดปุ่ม START
        if (magicAudioRef.current) {
            magicAudioRef.current.currentTime = 0;
            magicAudioRef.current.play().catch(() => {});
        }
        setTimeout(() => {
            navigate("/unit1/Quizlevel1");
        }, 300);
    };

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-end px-6 pb-20 relative"
            style={{
                backgroundImage: `url(${bgGameLevel1})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                cursor: hasStarted ? "default" : "pointer"
            }}
            onClick={!hasStarted ? handleInitialClick : undefined}
        >
            {!hasStarted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10 backdrop-blur-sm">
                    <p className="text-white text-2xl font-bold animate-pulse tracking-wider">
                        คลิกหน้าจอเพื่อเริ่มต้น...
                    </p>
                </div>
            )}

            <div className="max-w-3xl text-center h-24 flex items-center justify-center relative z-20">
                {visibleLines === 1 && (
                    <p className="text-3xl text-yellow-300 animate-fadeIn">
                        ยินดีต้อนรับ ผู้ถูกเลือก...
                    </p>
                )}

                {visibleLines === 2 && (
                    <p className="text-2xl text-white animate-fadeIn">
                        กระจกแห่งความซื่อสัตย์จะสะท้อนตัวตนที่แท้จริงของเจ้า
                    </p>
                )}

                {visibleLines === 3 && (
                    <p className="text-2xl text-white animate-fadeIn">
                        ทุกการตัดสินใจจะส่งผลต่อแสงสว่างในจิตใจ
                    </p>
                )}

                {showButton && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleStartClick();
                        }}
                        className="start-btn bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-xl animate-fadeIn"
                    >
                        START
                    </button>
                )}
            </div>
        </div>
    );
}