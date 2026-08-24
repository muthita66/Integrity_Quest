import { motion } from "framer-motion";

export default function SlipCard({ slip, active, disabled, onClick }) {
    return (
        <motion.div
            whileHover={active ? { scale: 1.05, rotate: 0, zIndex: 10 } : {}}
            whileTap={active ? { scale: 0.95 } : {}}
            onClick={onClick}
            style={{
                width: 125,
                cursor: active ? "pointer" : "default",
                opacity: disabled ? 0.4 : 1,
                position: "relative",
                transform: `rotate(${slip.id % 2 === 0 ? 2 : -2}deg)`,
                transition: "all 0.2s ease",
            }}
        >
            <div style={{
                padding: "8px 8px 24px 8px", borderRadius: 6, background: "#FFF",
                boxShadow: active ? "0 8px 20px rgba(0,0,0,0.15), 0 0 0 2px var(--gold-main)" : "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #E2E8F0"
            }}>
                <img src={slip.image} alt="Evidence" style={{ width: "100%", borderRadius: 4, display: "block" }} />
                <span style={{
                    position: "absolute", bottom: 6, left: 0, right: 0, textAlign: "center",
                    fontSize: 10, color: "#64748B", fontWeight: 700, fontFamily: "monospace"
                }}>
                    EXHIBIT #{slip.id}
                </span>
            </div>

            {active && (
                <span style={{
                    position: "absolute", top: -8, right: -8, background: "var(--gold-main)",
                    color: "#FFF", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}>
                    INSPECT
                </span>
            )}
        </motion.div>
    );
}