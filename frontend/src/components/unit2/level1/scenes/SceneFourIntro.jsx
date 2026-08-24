import { motion } from "framer-motion";

export default function SceneFour() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                }}
                transition={{
                    type: "spring",
                    stiffness: 180,
                }}
                className="w-72"


            >
            </motion.div>
        </div>
    );
}