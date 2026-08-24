import { motion, AnimatePresence } from "framer-motion";
import { FileText, Check, X } from "lucide-react";

export default function ReceiptModal({
    receipt,
    saveReceipt,
    discardReceipt,
}) {

    if (!receipt) return null;

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
                        max-w-lg
                        max-h-[85vh]
                        overflow-y-auto
                        shadow-2xl
                    "
                >

                    <div
                        className="
                            bg-yellow-300
                            border-b-4
                            border-black
                            p-4
                            flex
                            gap-3
                            items-center
                        "
                    >

                        <FileText size={35} />

                        <div>

                            <h2 className="
                                text-2xl
                                font-black
                            ">
                                ใบเสร็จรับเงิน
                            </h2>

                            <p className="font-bold">
                                กรุณาเก็บเป็นหลักฐาน
                            </p>

                        </div>

                    </div>


                    <div className="p-5">

                        <div className="
                            flex
                            justify-between
                            mb-3
                        ">

                            <span>
                                เลขที่
                            </span>

                            <span className="font-bold">
                                {receipt.number}
                            </span>

                        </div>


                        <div className="
                            flex
                            justify-between
                            mb-4
                        ">

                            <span>
                                วันที่
                            </span>

                            <span>
                                {receipt.date}
                            </span>

                        </div>


                        <div className="
                            border-t-2
                            border-dashed
                            pt-3
                            space-y-2
                        ">

                            {
                                receipt.items.map(item => (

                                    <div
                                        key={item.id}
                                        className="
                                        flex
                                        justify-between
                                    "
                                    >

                                        <span>
                                            {item.name}
                                        </span>

                                        <span>
                                            {item.price.toLocaleString()}
                                            บาท
                                        </span>

                                    </div>

                                ))
                            }

                        </div>


                        <div className="
                            border-t-4
                            border-black
                            mt-4
                            pt-3
                            flex
                            justify-between
                            font-black
                            text-xl
                        ">

                            <span>
                                รวม
                            </span>

                            <span>
                                {receipt.total.toLocaleString()}
                                บาท
                            </span>

                        </div>


                    </div>


                    <div className="
                        p-4
                        border-t-4
                        border-black
                        flex
                        gap-3
                    ">


                        <button

                            onClick={saveReceipt}

                            className="
                                flex-1
                                bg-green-500
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

                            <Check />

                            เก็บใบเสร็จ

                        </button>


                        <button

                            onClick={discardReceipt}

                            className="
                                flex-1
                                bg-red-500
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

                            <X />

                            ทิ้ง

                        </button>


                    </div>


                </motion.div>


            </motion.div>


        </AnimatePresence>

    );
}