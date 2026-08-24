import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Receipt from '../../../../assets/unit3/level1/intro/receipt.png'
import TaxReceipt from '../../../../assets/unit3/level1/intro/tax.png'
import CashReceipt from '../../../../assets/unit3/level1/intro/cash.png'
import BgMission from "../../../../assets/unit3/level1/bgGameLevel1.png";

export default function SceneMission({ onBack }) {
    const navigate = useNavigate();

    const handleStartGame = () => {
        navigate("/unit3/level1/game");
    };

    return (
        <div className="relative mx-auto w-full min-h-screen flex flex-col justify-center">
            {/* Desk background */}
            <div className="fixed inset-0 -z-10 w-full h-full">
                <div className="absolute inset-0" style={{ backgroundImage: `url(${BgMission})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                {/* White Overlay */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            {/* Mission content */}
            <div className="relative z-10 px-5 pt-2 pb-2 md:px-10 h-full flex flex-col justify-center gap-2">
                {/* Mission title */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: -35,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.5,
                    }}
                    className="
                        mx-auto max-w-3xl w-full
                        rounded-[26px]
                        border-4 border-amber-700
                        bg-yellow-100
                        px-4 py-2
                        text-center shadow-2xl
                    "
                >
                    <h2 className="text-2xl font-black text-amber-950 md:text-4xl sarabun-bold">
                        ภารกิจตามหาใบเสร็จ
                    </h2>

                    <p className="mt-1 text-base font-bold text-amber-800 md:text-lg sarabun-bold">
                        ค้นหาเอกสารการเงินให้ครบก่อนหมดเวลา
                    </p>

                    {/* Rules */}
                    <div className="mx-auto mt-2 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3 sarabun-bold">
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.15,
                            }}
                            className="
                            rounded-2xl border-4 border-yellow-300
                            bg-slate-900 p-2 text-center flex flex-col items-center
                            text-white shadow-lg
                        "
                        >

                            <h3 className="text-base font-black text-yellow-300">
                                เวลา
                            </h3>

                            <p className="font-bold">
                                60 วินาที
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.3,
                            }}
                            className="
                            rounded-2xl border-4 border-green-300
                            bg-slate-900 p-2 text-center flex flex-col items-center
                            text-white shadow-lg
                        "
                        >

                            <h3 className="text-base font-black text-green-300">
                                เป้าหมาย
                            </h3>

                            <p className="font-bold">
                                หาเอกสารให้ครบ 8 ชิ้น
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 30,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                delay: 0.45,
                            }}
                            className="
                            rounded-2xl border-4 border-red-300
                            bg-slate-900 p-2 text-center flex flex-col items-center
                            text-white shadow-lg
                        "
                        >

                            <h3 className="text-base font-black text-red-300">
                                ระวัง
                            </h3>

                            <p className="font-bold">
                                กดผิดเกิน 5 ครั้งจะแพ้
                            </p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Target documents */}
                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 0.92,
                    }}
                    animate={{
                        opacity: 1,
                        scale: 1,
                    }}
                    transition={{
                        delay: 0.6,
                    }}
                    className="
                        mx-auto mt-2 max-w-3xl w-full
                        rounded-3xl border-4 border-amber-700
                        bg-amber-50 px-6 pt-4 pb-8
                        text-center shadow-xl
                        sarabun-bold
                    "
                >
                    <h3 className="mb-0 text-xl font-black text-amber-900">
                        เอกสารที่ต้องหา
                    </h3>

                    <div className="rounded-xl border-2 border-amber-200 bg-white p-0 shadow">
                        <div className="flex justify-around items-start">
                            <div className="flex flex-col items-center">
                                <p className="h-12 flex items-center justify-center text-center font-bold text-black">
                                    ใบเสร็จรับเงิน
                                </p>
                                <img src={Receipt} alt="" className="w-26" />
                            </div>

                            <div className="flex flex-col items-center">
                                <p className="h-12 flex items-center justify-center text-center font-bold text-black">
                                    ใบกำกับภาษี
                                </p>
                                <img src={TaxReceipt} alt="" className="w-30" />
                            </div>

                            <div className="flex flex-col items-center">
                                <p className="h-12 flex items-center justify-center text-center font-bold text-black">
                                    ใบสำคัญรับเงิน
                                </p>
                                <img src={CashReceipt} alt="" className="w-34" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.85,
                        duration: 0.45,
                        ease: "easeOut",
                    }}
                    className="mt-8 flex items-center justify-center gap-4 sarabun-bold"
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
                        onClick={handleStartGame}
                        className="button-with-icon-introScenes button-green icon-right"
                    >
                        <span className="text">เริ่มเกม</span>
                        <span className="icon">▶</span>
                    </button>
                </motion.div>
            </div>
        </div>
    );
}