import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import scene1 from "../../../assets/unit4/Talk1.png";
import scene2 from "../../../assets/unit4/Talk2.png";
import scene3 from "../../../assets/unit4/Talk3.png";
import scene4 from "../../../assets/unit4/Talk4.png";

export default function Level2Intro() {
    const navigate = useNavigate();

    const [visible, setVisible] = useState(0);
    const [isDimmed, setIsDimmed] = useState(false);
    const [showButton, setShowButton] = useState(false);

    useEffect(() => {
        const timers = [];

        // ค่อยๆ เปิดทีละช่องให้ผู้ใช้ได้อ่านจนจบ
        timers.push(setTimeout(() => setVisible(1), 300));
        timers.push(setTimeout(() => setVisible(2), 1200));
        timers.push(setTimeout(() => setVisible(3), 2100));
        timers.push(setTimeout(() => setVisible(4), 3000));

        return () => timers.forEach(clearTimeout);
    }, []);

    // ฟังก์ชันคลิกหน้าจอหลังจากอ่านจบ
    const handleScreenClick = () => {
        if (visible >= 4 && !isDimmed) {
            setIsDimmed(true); // พื้นหลังมืดลงทันที

            // รอให้จอเริ่มมืด 500ms แล้วปล่อยปุ่มและป้ายสุดเว่อเด้งออกมา
            setTimeout(() => {
                setShowButton(true);
            }, 500);
        }
    };

    const panelStyle = (isVisible) => ({
        width: "100%",
        height: "100%",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.8s ease-in-out",
        overflow: "hidden",
        position: "relative",
    });

    const imageStyle = {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
    };

    return (
        <div
            onClick={handleScreenClick}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "#000000",
                overflow: "hidden",
                zIndex: 1,
                cursor: visible >= 4 && !isDimmed ? "pointer" : "default",
            }}
        >
            {/* ตารางรูปภาพ 4 ช่องเต็มจอ */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gridTemplateRows: "1fr 1fr",
                    gap: "4px",
                    // ดร็อปแสงพื้นหลังลงเหลือ 20% เพื่อให้ปุ่มการพนันสว่างกระแทกตา
                    filter: isDimmed ? "brightness(0.2) blur(6px)" : "brightness(1) blur(0px)",
                    transition: "filter 0.8s ease-in-out",
                }}
            >
                {/* Talk1 (ขยับรูปออกขวา 75%) */}
                <div style={{ ...panelStyle(visible >= 1) }}>
                    <img
                        src={scene1}
                        alt="Scene 1"
                        style={{ ...imageStyle, objectPosition: "75% center" }}
                    />
                </div>

                {/* Talk2 */}
                <div style={{ ...panelStyle(visible >= 2) }}>
                    <img src={scene2} alt="Scene 2" style={imageStyle} />
                </div>

                {/* Talk3 */}
                <div style={{ ...panelStyle(visible >= 3) }}>
                    <img src={scene3} alt="Scene 3" style={imageStyle} />
                </div>

                {/* Talk4 */}
                <div style={{ ...panelStyle(visible >= 4) }}>
                    <img src={scene4} alt="Scene 4" style={imageStyle} />
                </div>
            </div>

            {/* ชุดปุ่มกดชวนเล่นสไตล์คาสิโนเว่อๆ โผล่ตรงกลางจอ */}
            {showButton && (
                <div
                    className="casino-action-wrapper"
                    onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกโดนพื้นหลังซ้ำ
                >
                    {/* 🌟 ป้ายคำชวนเด้งดึ๋งสไตล์เว็บพนันตัวแม่ */}
                    <div className="casino-invite-badge">
                        🔥 เว็บตรง แตกง่าย จ่ายจริง! 🔥
                    </div>

                    {/* 🎰 ปุ่มลองเล่น 3D แสงไฟกะพริบ */}
                    <button
                        className="hyper-casino-btn"
                        onClick={() => navigate("/unit4/level2/game")}
                    >
                        🎰 ลองเล่นเลย! 🎰
                    </button>

                    {/* ป้ายเครดิตฟรีด้านล่างเสริมความสมจริง */}
                    <div className="casino-sub-text">
                        *โบนัสต้อนรับ 100% สมัครวันนี้กดรับสิทธิ์ทันที
                    </div>
                </div>
            )}

            <style>
                {`
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }

                /* ตัวคลุมปุ่มจัดตำแหน่งให้อยู่กลางจอเป๊ะๆ */
                .casino-action-wrapper {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    z-index: 9999;
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }

                /* ป้ายคำชวนด้านบน - เด้งดึ๋ง + นีออนฟลิกเกอร์ */
                .casino-invite-badge {
                    font-size: 28px;
                    font-family: 'Noto Sans Thai', sans-serif;
                    font-weight: 900;
                    color: #00FF66; /* เขียวตองอ่อนนีออนแบบแอปการพนัน */
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: rgba(0, 0, 0, 0.85);
                    padding: 8px 30px;
                    border-radius: 50px;
                    border: 2px solid #FF007A; /* ขอบชมพูฮอตพิงค์ */
                    
                    /* ออร่าแสงไฟนีออนซ้อนกัน 3 ชั้น */
                    text-shadow: 0 0 5px #00FF66, 0 0 15px #00FF66;
                    box-shadow: 0 0 20px rgba(255, 0, 122, 0.6), inset 0 0 10px rgba(0, 255, 102, 0.3);
                    
                    /* ใส่แอนิเมชันเด้งดึ๋ง และ ไฟกะพริบ */
                    animation: casinoBounce 0.6s infinite alternate ease-in-out, neonFlicker 2s infinite alternate;
                }

                /* ปุ่มลองเล่นแบบตู้สล็อตแมชชีนลาสเวกัส */
                .hyper-casino-btn {
                    min-width: 380px;
                    padding: 22px 60px;
                    border-radius: 999px;
                    cursor: pointer;
                    
                    /* ไล่เฉดสีทอง-ส้ม-แดง ให้ดูฉูดฉาดร่ำรวย */
                    background: linear-gradient(180deg, #FFFDE7 0%, #FFEA00 25%, #FF6D00 65%, #E60000 100%);
                    border: 6px solid #FFF;
                    
                    color: #FFFFFF;
                    font-size: 42px;
                    font-family: 'Noto Sans Thai', sans-serif;
                    font-weight: 950;
                    letter-spacing: 1.5px;
                    
                    /* เงาอักษรหนาๆ สามมิติ */
                    text-shadow: 2px 2px 0 #7A0000, -2px -2px 0 #7A0000, 2px -2px 0 #7A0000, -2px 2px 0 #7A0000, 0 6px 10px rgba(0,0,0,0.8);
                    
                    /* เงาปุ่มแบบขอบไฟกะพริบสลับสี (ใช้แอนิเมชันเปลี่ยนสีเงาด้านล่าง) */
                    box-shadow: 
                        inset 0 6px 12px rgba(255, 255, 255, 1), 
                        inset 0 -8px 15px rgba(0, 0, 0, 0.4),
                        0 12px 0 #8B0000, 
                        0 20px 35px rgba(0, 0, 0, 0.8);
                        
                    animation: buttonPulse 1.2s infinite alternate ease-in-out, borderLightRun 1s infinite linear;
                    transition: all 0.1s ease;
                }

                /* ชี้เมาส์แล้วสว่างโร่ขึ้นมาอีก */
                .hyper-casino-btn:hover {
                    filter: brightness(1.2) contrast(1.1);
                    transform: scale(1.02);
                }

                /* กดปุ่มแล้วยุบตัวจริงเสียงจริง */
                .hyper-casino-btn:active {
                    transform: translateY(8px) scale(0.98);
                    box-shadow: 
                        inset 0 4px 8px rgba(255, 255, 255, 0.8), 
                        inset 0 -4px 10px rgba(0, 0, 0, 0.4),
                        0 4px 0 #8B0000, 
                        0 10px 20px rgba(0, 0, 0, 0.6);
                    animation: none;
                }

                .casino-sub-text {
                    font-size: 14px;
                    color: #FFEA00;
                    font-weight: 600;
                    text-shadow: 0 1px 3px rgba(0,0,0,1);
                    letter-spacing: 0.5px;
                    animation: neonFlicker 1s infinite alternate;
                }

                /* แอนิเมชันปุ่มและป้ายเด้งโผล่มาตอนแรก */
                @keyframes popIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                /* แอนิเมชันป้ายคำชวน เด้งขึ้น-ลงอย่างสนุกสนาน */
                @keyframes casinoBounce {
                    from { transform: translateY(5px); }
                    to { transform: translateY(-10px); }
                }

                /* แอนิเมชันปุ่มสล็อตขยายตัววูบวาบ */
                @keyframes buttonPulse {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }

                /* แอนิเมชันสลับสีออร่ารอบปุ่ม (แดง-ทอง-ชมพู) แบบตู้สล็อตคาสิโน */
                @keyframes borderLightRun {
                    0% { box-shadow: inset 0 6px 12px #FFF, inset 0 -8px 15px rgba(0,0,0,0.4), 0 12px 0 #8B0000, 0 20px 35px rgba(255, 0, 0, 0.8), 0 0 30px #FF0000; }
                    50% { box-shadow: inset 0 6px 12px #FFF, inset 0 -8px 15px rgba(0,0,0,0.4), 0 12px 0 #8B0000, 0 20px 35px rgba(255, 234, 0, 0.9), 0 0 45px #FFEA00; }
                    100% { box-shadow: inset 0 6px 12px #FFF, inset 0 -8px 15px rgba(0,0,0,0.4), 0 12px 0 #8B0000, 0 20px 35px rgba(255, 0, 122, 0.8), 0 0 30px #FF007A; }
                }

                /* แอนิเมชันนีออนกะพริบถี่ๆ แสบตา */
                @keyframes neonFlicker {
                    0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; filter: brightness(1); }
                    20%, 24%, 55% { opacity: 0.8; filter: brightness(0.7); }
                }
                `}
            </style>
        </div>
    );
}
