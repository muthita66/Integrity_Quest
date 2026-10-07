import { motion } from "framer-motion";

// ขนาดฟองอากาศ: 128px บนจอใหญ่ (เท่าเดิม) และย่อลงตามขนาดจอ
//  - ไม่เกิน 10vw  : ตำแหน่ง x สูงสุด 90% ต้องไม่ล้นขอบขวา
//  - ไม่เกิน 19dvh : ตำแหน่ง y สูงสุด 80% ต้องไม่ล้นขอบล่าง
//  - ไม่ต่ำกว่า 72px เพื่อให้ยังกดได้สะดวก
const BUBBLE_SIZE = "clamp(72px, min(10vw, 19dvh), 128px)";

export default function Bubble({ bubble, onShoot }) {
    return (
        <motion.div
            className="absolute z-10 cursor-pointer"
            style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
            }}
            initial={{
                opacity: 0,
                scale: 0,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                x: [0, bubble.moveX, 0],
                y: [0, bubble.moveY, 0],
            }}
            exit={{
                scale: 1.5,
                opacity: 0,
                filter: "brightness(1.5) blur(5px)",
                transition: {
                    duration: 0.3,
                    ease: "easeOut",
                },
            }}
            transition={{
                x: {
                    duration: bubble.duration * 1.1,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                y: {
                    duration: bubble.duration,
                    repeat: Infinity,
                    ease: "easeInOut",
                },
                default: {
                    duration: 0.3,
                },
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onShoot(bubble)}
        >
            <img
                src={bubble.image}
                alt={bubble.text}
                draggable={false}
                className="
                    select-none
                    rounded-full
                    object-cover
                    shadow-lg
                "
                style={{
                    width: BUBBLE_SIZE,
                    height: BUBBLE_SIZE,
                }}
            />

            {/* ข้อความในฟอง: ขนาดตัวอักษรและระยะขอบย่อตามขนาดฟอง (14px / 16px ที่ 128px) */}
            <div
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    text-center
                    font-bold
                    text-black
                "
                style={{
                    fontSize: `max(12px, calc(${BUBBLE_SIZE} * 0.11))`,
                    padding: `0 calc(${BUBBLE_SIZE} * 0.125)`,
                }}
            >
                {bubble.text}
            </div>
        </motion.div>
    );
}