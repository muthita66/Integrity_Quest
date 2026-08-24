import { motion } from "framer-motion";
import { Wallet, FileText, Star } from "lucide-react";

export default function BudgetHeader({
    balance,
    receipts,
    score,
}) {

    return (
        <div className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
            mb-2
            h-[90px]
        ">

            <motion.div
                whileHover={{ scale: 1.05 }}
                className="
                    bg-green-100
                    border-4
                    border-black
                    rounded-2xl
                    p-4
                    shadow-lg
                    flex
                    items-center
                    gap-4
                "
            >
                <Wallet size={25} />

                <div>
                    <p className="font-bold">
                        เงินคงเหลือ
                    </p>

                    <p className="text-lg font-black">
                        {balance.toLocaleString()}
                        บาท
                    </p>
                </div>

            </motion.div>


            <motion.div
                whileHover={{ scale: 1.05 }}
                className="
                    bg-blue-100
                    border-4
                    border-black
                    rounded-2xl
                    p-4
                    shadow-lg
                    flex
                    items-center
                    gap-4
                "
            >

                <FileText size={25} />

                <div>
                    <p className="font-bold">
                        ใบเสร็จ
                    </p>

                    <p className="text-lg font-black">
                        {receipts.length}
                        ใบ
                    </p>
                </div>

            </motion.div>


            <motion.div
                whileHover={{ scale: 1.05 }}
                className="
                    bg-yellow-100
                    border-4
                    border-black
                    rounded-2xl
                    p-4
                    shadow-lg
                    flex
                    items-center
                    gap-4
                "
            >

                <Star size={25} />

                <div>
                    <p className="font-bold">
                        คะแนน
                    </p>

                    <p className="text-lg font-black">
                        {score}
                    </p>
                </div>

            </motion.div>


        </div>
    );
}