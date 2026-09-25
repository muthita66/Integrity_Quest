import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ResultModal({ score, happiness, budgets, onNext }) {
  // Simple overlay modal with animation
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-[600px] max-w-full rounded-2xl bg-[#1e1e2f] border-4 border-amber-700 shadow-[0_0_40px_rgba(0,0,0,0.6)] p-8 text-center"
        >
          <h2 className="text-3xl font-bold text-amber-300 mb-4">ผลสรุป</h2>
          <div className="grid grid-cols-2 gap-4 text-left text-white mb-6">
            <div className="font-medium">คะแนนรวม:</div>
            <div>{score}</div>
            <div className="font-medium">ความสุข:</div>
            <div>{happiness}%</div>
            <div className="font-medium">งบคงเหลือ:</div>
            <div>{Object.entries(budgets).map(([k, v]) => `${k}: ${v}`).join(", ")}</div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(251,191,36,.8)" }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 text-2xl font-black text-[#2b1b12] border-4 border-yellow-200 shadow-2xl"
          >
            ดำเนินการต่อ
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
