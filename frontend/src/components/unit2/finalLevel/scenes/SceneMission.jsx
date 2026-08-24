import { motion } from "framer-motion";
import SceneMissionBg from "../../../../assets/unit2/FinalLevel/intro/sceneMission.png";

export default function SceneMission({ onBack, startMission }) {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background */}
            <img
                src={SceneMissionBg}
                alt="Mission"
                className="absolute inset-0 w-full h-full object-cover object-top"
            />

            {/* Mission content */}
            <div className="relative z-10 flex flex-col items-center justify-end h-full px-5 pb-10 md:pb-14 sarabun-bold">

                {/* Mission Card */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto w-full max-w-3xl rounded-[26px] border-4 border-black bg-yellow-50/90 px-8 py-6 text-center shadow-2xl"
                >
                    <motion.p
                        initial={{ opacity: 0, letterSpacing: "0.05em" }}
                        animate={{ opacity: 1, letterSpacing: "0.3em" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-amber-600 font-black text-sm tracking-[0.3em] mb-1"
                    >
                        FINAL LEVEL
                    </motion.p>
                    <h2 className="text-2xl font-black text-black md:text-4xl">
                        วันแห่งการตัดสินใจ
                    </h2>

                    <p className="mt-1 text-base font-bold text-black md:text-lg">
                        ตอบคำถามให้ถูกต้อง และบริหารเงินให้ไม่หมดก่อนจบวัน
                    </p>

                    {/* Rules */}
                    <div className="mx-auto mt-4 grid w-full grid-cols-1 gap-3 md:grid-cols-3">

                        {/* เวลา */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="flex flex-col items-center rounded-2xl border-4 border-yellow-400 bg-yellow-300 p-2 text-center text-black shadow-lg"
                        >
                            <h3 className="text-base font-black text-black">
                                เวลา
                            </h3>
                            <p className="text-sm font-bold">
                                30 วินาที / ข้อ
                            </p>
                        </motion.div>

                        {/* เป้าหมาย */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col items-center rounded-2xl border-4 border-green-500 bg-green-400 p-2 text-center text-black shadow-lg"
                        >
                            <h3 className="text-base font-black text-black">
                                เป้าหมาย
                            </h3>
                            <p className="text-sm font-bold leading-tight">
                                ตอบให้ถูก 8/10 ข้อ และเงินห้ามหมด
                            </p>
                        </motion.div>

                        {/* ข้อควรระวัง */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            className="flex flex-col items-center rounded-2xl border-4 border-red-500 bg-red-400 p-2 text-center text-black shadow-lg"
                        >
                            <h3 className="text-base font-black text-black">
                                ข้อควรระวัง
                            </h3>
                            <p className="text-sm font-bold leading-tight">
                                คิดถึงความจำเป็นและเงินคงเหลือ
                            </p>
                        </motion.div>

                    </div>

                    {/* Buttons - อยู่ในกรอบ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.65,
                            duration: 0.45,
                            ease: "easeOut",
                        }}
                        className="mt-5 flex w-full items-center justify-center gap-4"
                    >
                        <button
                            type="button"
                            onClick={onBack}
                            className="button-with-icon-introScenes button-gray icon-left"
                        >
                            <span className="icon">◀</span>
                            <span className="text">ย้อนกลับ</span>
                        </button>

                        <button
                            type="button"
                            onClick={startMission}
                            className="button-with-icon-introScenes button-green icon-right"
                        >
                            <span className="text">เริ่มเกม</span>
                            <span className="icon">▶</span>
                        </button>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
}
