import chestImg from "../../../assets/chest.png";

function Chest({ left, top }) {
    return (
        <div
            className="chest-node-container"
            style={{
                position: "absolute",
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

            `}</style>

            {/* รูปกล่องสมบัติแบบนิ่งๆ ไม่มีเอฟเฟกต์ลอย */}
            <img src={chestImg} alt="Final Treasure Chest" className="chest-asset" />
        </div>
    );
}

export default Chest;