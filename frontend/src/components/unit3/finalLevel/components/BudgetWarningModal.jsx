import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";


export default function BudgetWarningModal({
    open,
    close,
    resetGame
}) {


    if (!open)
        return null;


    return (

        <div
            className="
                fixed
                inset-0
                bg-black/60
                flex
                items-center
                justify-center
                z-50
            "
        >

            <motion.div

                initial={{
                    scale: 0.7,
                    opacity: 0
                }}

                animate={{
                    scale: 1,
                    opacity: 1
                }}

                className="
                    bg-white
                    border-4
                    border-black
                    rounded-2xl
                    p-6
                    max-w-md
                    text-center
                    shadow-2xl
                "

            >

                <AlertTriangle
                    size={60}
                    className="
                        mx-auto
                        text-red-600
                    "
                />


                <h2
                    className="
                        text-2xl
                        font-black
                        mt-3
                    "
                >
                    เงินสำรองไม่เพียงพอ
                </h2>
                <p
                    className="
                        mt-4
                        mb-4
                        font-bold
                        leading-relaxed
                    "
                >
                    เงินคงเหลือจำเป็นต้องมีอย่างน้อย{" "}
                    <span className="text-red-600">
                        1,000 บาท
                    </span>
                    <br />
                    พบว่ามีการซื้อ{" "}
                    <span className="text-orange-600">
                        ของฟุ่มเฟือย
                    </span>
                    {" "}ก่อนหน้า
                    <br />
                    ทำให้งบประมาณไม่เพียงพอ
                    สำหรับการจัดกิจกรรมที่จำเป็น
                </p>
                <button
                    onClick={resetGame}
                    className="result-button result-button-red">
                    <span className="result-button-top">เริ่มภารกิจใหม่</span>
                </button>
            </motion.div>
        </div>
    );
}