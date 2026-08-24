import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const INK = "#2B2A24";
const PAPER = "#F4EEDB";
const STAMP_RED = "#A63A2E";
const LINE = "#C9B98C";

export default function BudgetFailModal({
    open,
    gameOverMessage,
    failReasons = [],
    resetGame,
}) {
    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                style={{
                    background:
                        "radial-gradient(circle at 50% 20%, rgba(100,20,10,0.6), rgba(10,5,5,0.92))",
                }}
            >
                <motion.div
                    initial={{ scale: 0.85, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="w-full max-w-md rounded-sm shadow-2xl font-sara"
                    style={{
                        background: PAPER,
                        border: `2px solid ${STAMP_RED}`,
                        boxShadow: `0 0 0 4px ${STAMP_RED}33, 0 25px 60px rgba(0,0,0,0.5)`,
                    }}
                >
                    {/* Perforated top edge */}
                    <div
                        className="h-3 w-full rounded-t-sm"
                        style={{
                            backgroundImage: `radial-gradient(circle, #E7DCB8 3px, transparent 3.5px)`,
                            backgroundSize: "14px 14px",
                            backgroundPosition: "0 -6px",
                            backgroundColor: STAMP_RED,
                        }}
                    />

                    <div className="p-6">
                        {/* Icon + Title */}
                        <div className="flex flex-col items-center text-center mb-5">
                            <motion.div
                                initial={{ rotate: -10, scale: 0.8 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="mb-3 flex h-16 w-16 items-center justify-center rounded-full"
                                style={{
                                    background: "#F7E3DE",
                                    border: `2px solid ${STAMP_RED}`,
                                }}
                            >
                                <AlertTriangle size={32} color={STAMP_RED} />
                            </motion.div>

                            <h2
                                className="text-2xl font-black"
                                style={{ color: STAMP_RED }}
                            >
                                ⛔ ภารกิจล้มเหลว
                            </h2>
                            <p
                                className="mt-1 text-sm font-bold"
                                style={{ color: "#7a3a30" }}
                            >
                                {gameOverMessage}
                            </p>
                        </div>

                        {/* Fail Reasons */}
                        {failReasons.length > 0 && (
                            <div
                                className="rounded-sm p-4 mb-5"
                                style={{
                                    background: "#F7E3DE",
                                    border: `1px solid ${STAMP_RED}`,
                                }}
                            >
                                <p
                                    className="text-sm font-black mb-2"
                                    style={{ color: STAMP_RED }}
                                >
                                    📋 สาเหตุที่งบไม่เพียงพอ
                                </p>
                                <ul className="space-y-1">
                                    {failReasons.map((reason, i) => (
                                        <li
                                            key={i}
                                            className="text-sm font-bold flex items-start gap-2"
                                            style={{ color: INK }}
                                        >
                                            <span style={{ color: STAMP_RED }}>✗</span>
                                            {reason}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tip */}
                        <div
                            className="rounded-sm p-3 mb-5 text-sm font-bold"
                            style={{
                                background: "#FBF6E3",
                                border: `1px solid ${LINE}`,
                                color: INK,
                            }}
                        >
                            💡 <span className="font-black">คำแนะนำ:</span>{" "}
                            ครั้งหน้าควรวางแผนซื้อของจำเป็นในแต่ละหมวดให้ครบก่อน
                            แล้วค่อยพิจารณาของเพิ่มเติม
                        </div>

                        {/* Button */}
                        <button
                            onClick={resetGame}
                            className="w-full rounded-sm py-3 text-lg font-black transition-all active:translate-x-0.5 active:translate-y-0.5"
                            style={{
                                background: STAMP_RED,
                                color: "#fff",
                                border: `2px solid ${INK}`,
                                boxShadow: `4px 4px 0 0 ${INK}`,
                            }}
                        >
                            🔄 เริ่มภารกิจใหม่
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
