import chestImg from "../../../assets/chest.png";

function Chest({ left, top, onClick, ready, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={ready ? 'รับรางวัลเกียรติบัตร' : 'ตรวจสอบรางวัลเกียรติบัตร'}
            className={`chest-node-container${ready ? ' reward-ready' : ''}`}
            style={{
                position: "absolute",
                background: "none",
                border: 0,
                padding: 0,
                font: "inherit",
                left: left,
                top: top,
                transform: "translate(-50%, -50%)",
                zIndex: 15,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
        >
            <style>{`
                .chest-asset {
                    /* ปรับขนาดให้พอดีและสมดุลกับตัวปราสาทของด่าน */
                    width: 130px; 
                    height: auto;
                    /* วางนิ่งๆ ไม่ลอยขึ้นลง แต่ใส่เงาให้ดูมีน้ำหนักตั้งอยู่บนพื้น */
                    filter: drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.4));
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s;
                }

                /* เวลาเอาเมาส์ชี้ ค่อยขยายใหญ่ขึ้นนิดหน่อยให้รู้ว่ากดได้ */
                .chest-node-container:hover .chest-asset {
                    transform: scale(1.15);
                    filter: drop-shadow(0px 12px 20px rgba(251, 191, 36, 0.6)) brightness(1.1);
                }

                .reward-ready::before { content: ''; position: absolute; width: 160px; height: 140px; top: -8px; border-radius: 50%; background: radial-gradient(ellipse, #fff3a9aa, #ffd54c44 45%, transparent 72%); animation: chest-glow 2s ease-in-out infinite; pointer-events: none; }
                .reward-ready .chest-asset { position: relative; filter: drop-shadow(0 0 14px #ffe27e) drop-shadow(0 8px 10px #0005); }
                .chest-sparkle { position: absolute; color: #fff8c9; text-shadow: 0 0 8px #ffce42, 0 0 16px #fff; font-size: 25px; pointer-events: none; animation: chest-twinkle 1.8s ease-in-out infinite; }
                .chest-sparkle:nth-of-type(1) { left: -8px; top: 12px; }
                .chest-sparkle:nth-of-type(2) { right: -8px; top: 38px; animation-delay: .6s; }
                .chest-sparkle:nth-of-type(3) { left: 60px; top: -14px; animation-delay: 1.2s; font-size: 18px; }
                .chest-reward-label { position: absolute; bottom: calc(100% + 12px); width: max-content; max-width: 220px; padding: 7px 14px; border: 2px solid #e9b74d; border-radius: 16px; background: #fff9e8; color: #8b5517; font-size: 14px; font-weight: 700; line-height: 1.4; box-shadow: 0 3px 10px #74460a30; }
                .chest-reward-label::before { content: ''; position: absolute; bottom: -7px; left: calc(50% - 5px); width: 10px; height: 10px; background: #fff9e8; border-right: 2px solid #e9b74d; border-bottom: 2px solid #e9b74d; transform: rotate(45deg); }
                @keyframes chest-glow { 0%,100% { opacity: .65; transform: scale(.9); } 50% { opacity: 1; transform: scale(1.1); } }
                @keyframes chest-twinkle { 0%,100% { opacity: .15; transform: scale(.5) rotate(-15deg); } 50% { opacity: 1; transform: scale(1.15) rotate(15deg); } }
                @media (prefers-reduced-motion: reduce) { .reward-ready::before, .chest-sparkle { animation: none; } }
            `}</style>

            {/* รูปกล่องสมบัติแบบนิ่งๆ ไม่มีเอฟเฟกต์ลอย */}
            <img src={chestImg} alt="Final Treasure Chest" className="chest-asset" />
            {ready && <>
                <span className="chest-sparkle" aria-hidden="true">✦</span>
                <span className="chest-sparkle" aria-hidden="true">✦</span>
                <span className="chest-sparkle" aria-hidden="true">✧</span>
                <span className="chest-reward-label">รับรางวัลคนเก่งได้เลย ✨</span>
            </>}
        </button>
    );
}

export default Chest;
