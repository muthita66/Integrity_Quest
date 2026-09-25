import castle from "../../../assets/castle.png";
import { useNavigate } from "react-router-dom";

function UnitNode({ unit, locked = false }) {
    const navigate = useNavigate();

    const handleClick = (event) => {
        // ============================================================
        // ถ้า Unit ถูก Lock → ไม่ให้เข้า
        // ============================================================

        if (locked) {
            event.preventDefault();
            event.stopPropagation();

            alert(
                "🔒 Unit นี้ยังไม่ปลดล็อก\nกรุณาผ่าน Unit ก่อนหน้าก่อน"
            );

            return;
        }

        // ============================================================
        // Unit ถูก Unlock → เข้า Unit ได้
        // ============================================================

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

                // เปลี่ยน Cursor ตามสถานะ
                cursor: locked
                    ? "not-allowed"
                    : "pointer",

                // ถ้า Lock ให้จางลงเล็กน้อย
                opacity: locked ? 0.65 : 1,

                transition: "opacity 0.2s ease",
            }}
        >
            {/* ========================================================
                CSS
            ======================================================== */}

            <style>{`

                .castle-img {
                    width: 110px;
                    height: auto;

                    filter: ${locked
                    ? "grayscale(0.8) drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.25))"
                    : "drop-shadow(0px 10px 15px rgba(0, 0, 0, 0.35))"
                };

                    transition:
                        transform 0.2s
                            cubic-bezier(
                                0.175,
                                0.885,
                                0.32,
                                1.275
                            ),
                        filter 0.2s;
                }

                /* ====================================================
                   Hover เฉพาะ Unit ที่ปลดล็อก
                ==================================================== */

                .unit-node-container:not(.locked):hover
                    .castle-img {
                    transform: scale(1.12);

                    filter:
                        drop-shadow(
                            0px 15px 20px
                            rgba(0, 0, 0, 0.5)
                        )
                        brightness(1.05);
                }

                /* ====================================================
                   Banner
                ==================================================== */

                .game-banner {
                    margin-top: -5px;

                    background: linear-gradient(
                        135deg,
                        #FFE9F7 0%,
                        #FFD5EF 35%,
                        #D8D7FF 70%,
                        #BEE4FF 100%
                    );

                    border: 2px solid #D89BFF;

                    color: #000000;

                    padding: 6px 16px;

                    border-radius: 20px;

                    font-size: 13px;

                    font-weight: 700;

                    white-space: nowrap;

                    box-shadow:
                        0px 6px 12px
                        rgba(0, 0, 0, 0.4);

                    transition: all 0.2s ease;
                }

                /* ====================================================
                   Hover Banner
                ==================================================== */

                .unit-node-container:not(.locked):hover
                    .game-banner {

                    background: linear-gradient(
                        135deg,
                        #FFE9F7 0%,
                        #FFD5EF 35%,
                        #D8D7FF 70%,
                        #BEE4FF 100%
                    );

                    border-color: #ffffff;

                    box-shadow:
                        0px 8px 16px
                        rgba(118, 159, 249, 0.69);
                }

            `}</style>

            {/* ========================================================
                ป้อม
            ======================================================== */}

            <img
                src={castle}
                alt={`Unit ${unit.id}`}
                className="castle-img"
            />

            {/* ========================================================
                ป้ายชื่อ Unit
            ======================================================== */}

            <span className="game-banner">
                Unit {unit.id}: {unit.title}
            </span>

        </div>
    );
}

export default UnitNode;