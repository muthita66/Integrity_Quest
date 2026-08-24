import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { IoIosCheckmarkCircle } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { TbDeviceGamepadFilled } from "react-icons/tb";
import { MdTimer } from "react-icons/md";

import bgGameLevel2 from "../../../../assets/unit3/level2/bgGameLevel2.png"

export default function SceneMission({ onBack }) {
    const navigate = useNavigate();

    const handleStartGame = () => {
        navigate("/unit3/final");
    };

    return (
        <div className="relative mx-auto w-full min-h-screen flex flex-col justify-center">
            {/* Background */}
            <div className="fixed inset-0 -z-10 w-full h-full">
                <div className="absolute inset-0" style={{ backgroundImage: `url(${bgGameLevel2})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 px-8 pt-3 pb-8 md:px-14 h-full flex flex-col justify-center gap-6">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: -35 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl w-full rounded-[28px] border-4 border-yellow-950 bg-yellow-100 px-8 py-4 mt-1 text-center shadow-2xl"
                >
                    <h2 className="text-xl font-black text-black md:text-3xl">
                        ภารกิจ : "เหรัญญิกจำเป็น"
                    </h2>

                    <p className="mt-1 text-base font-bold text-black">
                        "ในฐานะเหรัญญิกจำเป็น คุณต้องบริหารงบค่ายอาสา <br />เลือกซื้อสิ่งจำเป็น ใช้เงินอย่างคุ้มค่า และเก็บหลักฐานให้ถูกต้อง"
                    </p>
                </motion.div>

                {/* Rules */}
                {/* Mission Brief */}
                <div
                    className="
                        grid grid-cols-1 md:grid-cols-2 gap-5 items-start
                        rounded-2xl
                        border-4 border-yellow-950
                        bg-[#FFFDF0]
                        p-5
                        shadow-inner
                        mt-4 mb-4
                    ">
                    {/* ฝั่งซ้าย */}
                    <div className="space-y-4">
                        {/* เป้าหมาย */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="
                                flex items-start gap-4
                                rounded-xl border-2 border-green-300
                                bg-white p-4
                            ">
                            <IoIosCheckmarkCircle className="text-4xl text-green-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-green-700 text-lg">เป้าหมาย</h4>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>ซื้อของจำเป็นให้ครบ</li>
                                    <li>ใช้งบประมาณไม่เกิน 10,000 บาท</li>
                                    <li>เหลือเงินสำรองอย่างน้อย 1,000 บาท</li>
                                    <li>ตรวจสอบและเก็บใบเสร็จให้ครบ</li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* โบนัส */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="
                                flex items-start gap-4
                                rounded-xl border-2 border-yellow-400
                                bg-white p-4
                            ">
                            <MdTimer className="text-4xl text-yellow-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-yellow-700 text-lg">โบนัส</h4>
                                <p className="text-sm">ทำภารกิจให้เสร็จภายใน 1 นาที 50 วินาที เพื่อรับโบนัสพิเศษ</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ฝั่งขวา */}
                    <div className="space-y-4">
                        {/* ระวัง */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                            className="
                                flex items-start gap-4
                                rounded-xl border-2 border-red-300
                                bg-white p-4
                            ">
                            <ImCross className="text-3xl text-red-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-red-700 text-lg">ระวัง</h4>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li>ซื้อของฟุ่มเฟือยมากเกินไป</li>
                                    <li>ใช้งบเกินในแต่ละหมวด</li>
                                    <li>เงินสำรองต่ำกว่า 1,000 บาท</li>
                                    <li>ใบเสร็จผิดปกติหรือไม่ครบ</li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* คำแนะนำ */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.55 }}
                            className="
                                flex items-start gap-4
                                rounded-xl border-2 border-blue-300
                                bg-white p-4
                            ">
                            <TbDeviceGamepadFilled className="text-4xl text-blue-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-blue-700 text-lg">คำแนะนำ</h4>
                                <p className="text-sm">วางแผนก่อนซื้อทุกครั้ง เพราะทุกการใช้เงินส่งผลต่อความสำเร็จของค่ายอาสา</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

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
                    className="mt-1 flex items-center justify-between sarabun-bold shrink-0"
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
            </div >
        </div >
    );
}