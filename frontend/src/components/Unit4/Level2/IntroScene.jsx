import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import BookLayout from "../BookLayout";
import sceneOffice from "../../../assets/unit4/story-home.png";
import sceneColleagues from "../../../assets/unit4/story-colleagues.png";
import sceneInvite from "../../../assets/unit4/story-slot-invite.png";
import "../../../styles/theme.css";
import "./level2.css";

const SCENES = [
    { image: sceneOffice },
    { image: sceneColleagues },
    { image: sceneInvite },
];

export default function IntroScene() {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const scene = SCENES[index];
    const last = index === SCENES.length - 1;

    const next = () => {
        if (last) {
            navigate("/unit4/level2/game");
            return;
        }
        setIndex((current) => current + 1);
    };

    return (
        <BookLayout
            title="บทที่ 2 — กับดักพนัน"
            subtitle=""
            rightLabel="เรื่องเล่าจากแฟ้มคดี"
            rightNote=""
            onBack={() => navigate("/unit4/book")}
            leftPage={
                <div className="level2-story-copy">
                    <span className="level2-story-kicker">EPISODE 02</span>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            className="level2-scene-number"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.22 }}
                        >
                            {String(index + 1).padStart(2, "0")}
                        </motion.div>
                    </AnimatePresence>
                    <div className="level2-story-rule" />
                    <span className="level2-story-label">CYBER TRAP</span>

                    <div className="level2-story-dots" aria-label={`ฉากที่ ${index + 1} จาก ${SCENES.length}`}>
                        {SCENES.map((item, sceneIndex) => (
                            <span
                                key={item.image}
                                className={sceneIndex === index ? "is-active" : ""}
                            />
                        ))}
                    </div>

                    {last ? (
                        <div className="level2-bait-wrap">
                            <button type="button" className="level2-bait-btn" onClick={next}>
                                ตรวจสอบข้อเสนอ
                            </button>
                        </div>
                    ) : (
                        <button type="button" className="primary-btn level2-story-next" onClick={next}>
                            อ่านฉากถัดไป <FaChevronRight size={13} />
                        </button>
                    )}
                    <div className="level2-story-progress">ฉากที่ {index + 1} / {SCENES.length}</div>
                </div>
            }
            rightPage={
                <div className="level2-story-panel">
                    <div className="level2-comic-frame">
                        <div className="level2-frame-label">CASE NOTE · 0{index + 1}</div>
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={scene.image}
                                src={scene.image}
                                alt={`ฉากที่ ${index + 1}`}
                                className="level2-story-image"
                                initial={{ opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.28 }}
                            />
                        </AnimatePresence>
                        <div className="level2-frame-caption">ภาพจากแฟ้มคดี Cyber Trap</div>
                    </div>
                </div>
            }
        />
    );
}
