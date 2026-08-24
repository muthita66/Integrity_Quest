import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, CheckCircle } from "lucide-react";

export default function CheckoutModal({
    open,
    totalPrice,
    balance,
    onConfirm,
    onClose,
}) {

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="
                    fixed
                    inset-0
                    z-50
                    bg-black/60
                    flex
                    items-center
                    justify-center
                    p-4
                "
            >
                <motion.div
                    initial={{
                        scale: .8
                    }}
                    animate={{
                        scale: 1
                    }}
                    className="
                        bg-white
                        border-4
                        border-black
                        rounded-2xl
                        w-full
                        max-w-md
                        max-h-[85vh]
                        overflow-y-auto
                        shadow-2xl
                    "
                >

                    <div
                        className="
                            bg-green-300
                            border-b-4
                            border-black
                            p-4
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <ShoppingCart size={35} />

                        <h2 className="
                            text-2xl
                            font-black
                        ">
                            ยืนยันการซื้อ
                        </h2>

                    </div>


                    <div className="
                        p-5
                        space-y-3
                    ">

                        <div className="
                            flex
                            justify-between
                            font-bold
                        ">

                            <span>
                                ยอดซื้อ
                            </span>

                            <span>
                                {totalPrice.toLocaleString()}
                                บาท
                            </span>

                        </div>


                        <div className="
                            flex
                            justify-between
                            font-bold
                        ">

                            <span>
                                เงินคงเหลือ
                            </span>

                            <span>
                                {(balance - totalPrice)
                                    .toLocaleString()}
                                บาท
                            </span>

                        </div>


                        {
                            balance - totalPrice < 0 && (

                                <p className="
                                    text-red-600
                                    font-black
                                    text-center
                                ">
                                    ❌ งบประมาณไม่เพียงพอ
                                </p>

                            )
                        }
                    </div>

                    <div className="
                        p-4
                        border-t-4
                        border-black
                        flex
                        gap-3
                    ">

                        <button
                            onClick={onConfirm}
                            disabled={
                                balance - totalPrice < 0
                            }
                            className="
                                flex-1
                                bg-green-500
                                disabled:bg-gray-400
                                text-white
                                border-4
                                border-black
                                rounded-xl
                                py-3
                                font-black
                                flex
                                justify-center
                                gap-2
                            "
                        >
                            <CheckCircle />
                            ยืนยัน
                        </button>
                        <button
                            onClick={onClose}
                            className="
                                flex-1
                                bg-gray-300
                                border-4
                                border-black
                                rounded-xl
                                font-black
                            "
                        >
                            ยกเลิก
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}