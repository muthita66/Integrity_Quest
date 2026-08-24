import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LevelTransition({
    nextPath = "/unit1/level2/intro",
}) {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate(nextPath);
        }, 1800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-black overflow-hidden">

            {/* แสงจากด้านล่าง */}
            <motion.div
                initial={{
                    opacity: 0,
                    scaleY: 0,
                }}
                animate={{
                    opacity: 1,
                    scaleY: 1,
                }}
                transition={{
                    duration: 1,
                    ease: "easeOut",
                }}
                className="
                    absolute
                    bottom-0
                    left-1/2
                    -translate-x-1/2
                    w-[200px]
                    h-full
                    origin-bottom
                    bg-gradient-to-t
                    from-yellow-300
                    via-yellow-100
                    to-transparent
                    blur-3xl
                "
            />

            {/* วงแสง */}
            <motion.div
                initial={{
                    scale: 0,
                    opacity: 0,
                }}
                animate={{
                    scale: 8,
                    opacity: 1,
                }}
                transition={{
                    duration: 1.4,
                    ease: "easeOut",
                }}
                className="
                    absolute
                    left-1/2
                    bottom-20
                    -translate-x-1/2
                    w-32
                    h-32
                    rounded-full
                    bg-yellow-200
                    blur-xl
                "
            />

            {/* Flash ขาวก่อนเปลี่ยนฉาก */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{
                    opacity: [0, 0, 1],
                }}
                transition={{
                    duration: 1.8,
                }}
                className="absolute inset-0 bg-white"
            />
        </div>
    );
}