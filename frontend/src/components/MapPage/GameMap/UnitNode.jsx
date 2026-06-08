import castle from "../../../assets/castle.png";
import { useNavigate } from "react-router-dom";

function UnitNode({ unit }) {
    const navigate = useNavigate();

    const handleClick = () => {
        // เมื่อคลิกที่ป้อม ให้เปลี่ยนหน้าไปที่เนื้อหาของ Unit นั้นๆ
        // สมมติว่า URL ของ Unit คือ /unit/unit1, /unit/unit2
        navigate(`/unit/unit${unit.id}`);
    };

    return (
        <div 
            className="unit-node-container" 
            onClick={handleClick}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "relative",
                userSelect: "none",
                cursor: "pointer"
            }}
        >
            {/* ฝัง CSS สำหรับเอฟเฟกต์ป้อมปราการโดยเฉพาะ */}
            <style>{`
                .castle-img {
                    width: 110px;
                    height: auto;
                    /* ใส่เงาให้ปราสาทดูลอยเด่นขึ้นมาจากพื้นหลัง */
                    filter: drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.35));
                    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.2s;
                }
                
                /* เวลาเอาเมาส์ชี้ ปราสาทจะขยายใหญ่ขึ้นและเงาเข้มขึ้นเหมือนเกมจริง */
                .unit-node-container:hover .castle-img {
                    transform: scale(1.12);
                    filter: drop-shadow(0px 15px 20px rgba(0, 0, 0, 0.5)) brightness(1.05);
                }

                .game-banner {
                    margin-top: -5px;
                    /* เปลี่ยนจากป้ายขาวเป็นสี Dark Fantasy ไล่เฉดสี */
                    background: linear-gradient(
                        135deg,
                        #FFE9F7 0%,
                        #FFD5EF 35%,
                        #D8D7FF 70%,
                        #BEE4FF 100%
                    );
                    
                    border: 2px solid #D89BFF;
                    color: #000000ff;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 700;
                    white-space: nowrap;
                    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.4);
                    transition: all 0.2s ease;
                }

                .unit-node-container:hover .game-banner {
                    background: linear-gradient(
                        135deg,
                        #FFE9F7 0%,
                        #FFD5EF 35%,
                        #D8D7FF 70%,
                        #BEE4FF 100%
                    ); /* เปลี่ยนเป็นสีน้ำเงินเรืองแสงเวลาโฮเวอร์ */
                    border-color: #ffffff;
                    box-shadow: 0px 8px 16px rgba(118, 159, 249, 0.69);
                }

            `}</style>

            {/* รูปภาพปราสาท */}
            <img src={castle} alt={`Unit ${unit.id}`} className="castle-img" />

            {/* ป้ายชื่อบทสไตล์การ์ดเกม RPG */}
            <span className="game-banner">
                Unit {unit.id}: {unit.title}
            </span>
        </div>
    );
}

export default UnitNode;