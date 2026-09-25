import { motion } from "framer-motion";

const rotations = [0.5, -1, 1, -0.5, 1, -1];

export default function ClueCard({ word, completed }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      // ปรับขนาดเป็น w-[210px] h-[155px] เท่ากับการ์ดคำตอบเพื่อให้สมดุลและห่างกันกำลังดี
      className={`
                relative w-full max-w-[225px] h-[150px] p-4 shadow-[3px_5px_10px_rgba(0,0,0,0.4)] transition-all duration-300 rounded-sm flex items-center justify-center
                ${completed ? "bg-[#ebdcc9] border-l-8 border-l-[#8b5a2b] border-y border-r border-[#cfbfa8]" : "bg-[#f9f3eb] border-l-8 border-l-[#543525] border-y border-r border-[#e3d7c5]"}
            `}
      style={{
        rotate: `${rotations[word.id - 1]}deg`,
        backgroundImage: "repeating-linear-gradient(to bottom, transparent 0px, transparent 21px, rgba(139,90,43,0.03) 22px)",
      }}
    >
      {/* เทปแปะหัวกระดาษ */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-white/60 border border-white/40 backdrop-blur-[1px] transform rotate-[-0.5deg] shadow-sm" />

      {/* ข้อความคำใบ้: ปรับสีตัวหนังสือให้ดำน้ำตาลเข้ม font-black คมชัด ไม่อ่อนเบลอ */}
      <div className="text-center w-full px-1">
        <p className={`text-[15px] leading-snug font-black ${completed ? 'text-[#543525] opacity-40 line-through' : 'text-[#1a0c02]'}`}>
          {word.clue}
        </p>
      </div>
    </motion.div>
  );
}
