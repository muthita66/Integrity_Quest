import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { FaCircle } from "react-icons/fa";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { ImCross } from "react-icons/im";
import { TbDeviceGamepadFilled } from "react-icons/tb";

import bgGameLevel2 from "../../../../assets/unit3/level2/bgGameLevel2.png"
import Tawan from "../../../../assets/unit3/level2/intro/tawan.png"

export default function SceneMission({ onBack }) {
    const navigate = useNavigate();

    const handleStartGame = () => {
        navigate("/unit3/level2/game");
    };

    return (
        <div className="relative mx-auto w-full min-h-screen flex flex-col justify-center">
            {/* Background */}
            <div className="fixed inset-0 -z-10 w-full h-full">
                <div className="absolute inset-0" style={{ backgroundImage: `url(${bgLevel2})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
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
                        ภารกิจบัญชีใครบัญชีมัน
                    </h2>

                    <p className="mt-1 text-base font-bold text-black">
                        แยกเงินส่วนตัวออกจากเงินกองกลางให้ถูกต้อง
                    </p>
                </motion.div>

                {/* Rules */}
                {/* Mission Brief */}
                <div
                    className="
                        grid grid-cols-3 gap-5 items-center
                        rounded-2xl
                        border-4 border-yellow-950
                        bg-[#FFFDF0]
                        p-5
                        shadow-inner
                        h-full
                        mt-4 mb-4
                    ">
                    {/* ฝั่งซ้าย */}
                    <div className="col-span-2 space-y-4">
                        {/* วิธีเล่น */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.25 }}
                            className="
                                flex items-center gap-4
                                rounded-xl border-2 border-yellow-300
                                bg-white p-4
                            ">
                            <TbDeviceGamepadFilled className="text-4xl text-yellow-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-yellow-700 text-lg">วิธีเล่น</h4>
                                <p className="text-base">ลากรายการเงินลงในช่อง<b> เงินกองกลาง </b>หรือ<b> เงินส่วนตัว </b>ให้ถูกต้อง</p>
                            </div>
                        </motion.div>

                        {/* ผ่านภารกิจ */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.35 }}
                            className="
                                flex items-center gap-4
                                rounded-xl border-2 border-green-300
                                bg-white p-4
                            ">
                            <IoIosCheckmarkCircle className="text-4xl text-green-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-green-700 text-lg">ผ่านภารกิจ</h4>
                                <p className="text-base">แยกรายการถูกต้อง<b>ทุกรายการ รวมทั้งหมด 12 รายการ</b></p>
                            </div>
                        </motion.div>


                        {/* ระวัง */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.45 }}
                            className="
                                flex items-center gap-4
                                rounded-xl border-2 border-red-300
                                bg-white p-4
                            ">
                            <ImCross className="text-3xl text-red-500 shrink-0" />
                            <div>
                                <h4 className="font-black text-red-700 text-lg">ระวัง</h4>
                                <p className="text-base">ห้ามใช้เงินกองกลางเพื่อ<b> ประโยชน์ส่วนตัว </b></p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ฝั่งขวา ตัวอย่าง */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 }}
                        className="w-full rounded-2xl border-2 border-dashed border-amber-400 bg-white p-2">
                        <h4 className="mb-1 text-center font-black text-lg">ตัวอย่าง</h4>
                        <div className="space-y-3 text-base">
                            <div className="rounded-xl bg-green-50 p-3">
                                <p className="flex items-center gap-2">
                                    <FaCircle className="text-sm text-green-500" />
                                    <span>ค่าอาหารค่ายอาสา</span>
                                </p>
                                <p className="font-base text-green-700">เงินกองกลาง</p>
                            </div>
                            <div className="rounded-xl bg-red-50 p-3">
                                <p className="flex items-center gap-2">
                                    <FaCircle className="text-sm text-red-500" />
                                    <span>ซื้อของให้ตัวเอง</span>
                                </p>
                                <p className="font-base text-red-700">เงินส่วนตัว</p>
                            </div>
                            <div className="rounded-xl bg-yellow-50 p-3">
                                <p className="flex items-center gap-2">
                                    <FaCircle className="text-sm text-yellow-500" />
                                    <span>ซื้อของว่างให้ทีมงานระหว่างจัดกิจกรรม</span>
                                </p>
                                <p className="font-base text-red-700">แล้วแบบนี้ควรใช้เงินของใคร?</p>
                            </div>
                        </div>
                    </motion.div>
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
                    className="mt-1 flex items-center justify-between sarabun-bold"
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