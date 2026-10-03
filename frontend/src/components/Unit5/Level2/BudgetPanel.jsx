import { motion } from "framer-motion";
import { MdOutlineAttachMoney } from "react-icons/md";
import { BsCoin } from "react-icons/bs";

export default function BudgetPanel({
  totalBudget,
  remainingBudget,
}) {
  const usedBudget = totalBudget - remainingBudget;
  const percent = (usedBudget / totalBudget) * 100;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="
        w-full
        max-w-[280px]
        bg-[#fff8e7]/95
        border-2
        border-[#e0a33d]
        rounded-[28px]
        shadow-[7px_8px_0_rgba(70,38,15,.2),0_12px_26px_rgba(50,25,8,.2)]
        backdrop-blur-sm
        p-6
        flex
        flex-col
        gap-4
      "
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <MdOutlineAttachMoney
          size={38}
          className="text-yellow-600"
        />

        <div>
          <h2 className="text-2xl font-black text-[#2b1b12]">
            คลังภาษี
          </h2>

          <p className="text-sm text-[#6d5746]">
            งบประมาณของเมือง
          </p>
        </div>
      </div>

      {/* งบคงเหลือ */}
      <div className="bg-white/70 rounded-2xl p-5 border-2 border-[#d8b77c] shadow-inner">
        <div className="text-sm text-gray-600">
          งบประมาณคงเหลือ
        </div>

        <div className="mt-2 flex items-center gap-2">
          <BsCoin
            size={26}
            className="text-yellow-500"
          />

          <span
            className={`
              text-5xl
              font-black
              ${remainingBudget <= 20
                ? "text-red-600"
                : "text-[#3b2418]"
              }
            `}
          >
            {remainingBudget}
          </span>
        </div>
      </div>

      {/* Progress */}

      <div>

        <div className="flex justify-between mb-2 font-bold">

          <span>ใช้งบประมาณ</span>

          <span>{usedBudget} / {totalBudget}</span>

        </div>

        <div className="h-4 rounded-full bg-[#d9c8b4] overflow-hidden">

          <motion.div
            animate={{
              width: `${percent}%`,
            }}
            transition={{
              duration: .3,
            }}
            className="
              h-full
              bg-gradient-to-r
              from-green-500
              via-yellow-400
              to-red-500
            "
          />

        </div>

      </div>

      {/* คำแนะนำ */}

      <div
        className="
          bg-[#fff0a8]
          rounded-2xl
          p-4
          border-2
          border-yellow-300
          shadow-[3px_4px_0_rgba(154,103,25,.16)]
          text-sm
          leading-6
          text-[#5c4327]
        "
      >
        💡 จัดสรรงบประมาณให้สมดุล

        <br />

        หากใช้งบด้านเดียว
        ประชาชนอาจได้รับผลกระทบ
      </div>

      {/* เตือน */}

      {remainingBudget === 0 && (

        <motion.div
          initial={{ scale: .8 }}
          animate={{ scale: 1 }}
          className="
            bg-red-100
            border
            border-red-300
            rounded-xl
            p-3
            text-center
            font-black
            text-red-700
          "
        >
          งบประมาณถูกใช้ครบแล้ว
        </motion.div>

      )}

    </motion.div>
  );
}
