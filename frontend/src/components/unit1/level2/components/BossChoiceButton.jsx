export default function BossChoiceButton({
    text,
    value,
    onAnswer,
    onHover,
    disabled = false,
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onMouseEnter={onHover}
            onClick={() => onAnswer(value)}
            className="
                relative
                h-[56px]
                w-[150px]
                overflow-hidden
                rounded-xl
                transition-all
                duration-500
                group
                hover:scale-105
                active:scale-95
                disabled:pointer-events-none
                disabled:opacity-70
            "
        >
            {/* กรอบทอง */}
            <div
                className="
                    absolute
                    inset-0
                    rounded-xl
                    bg-gradient-to-b
                    from-[#FFF7A3]
                    via-[#FFD93D]
                    to-[#FFB300]
                    p-[2px]
                "
            >
                <div
                    className="
                        absolute
                        inset-0
                        rounded-xl
                        bg-[#FFE082]
                        opacity-90
                    "
                />
            </div>

            {/* พื้นหลัง */}
            <div
                className="
                    absolute
                    inset-[2px]
                    rounded-xl
                    bg-[#FFE082]
                "
            />

            {/* ไล่สีชั้นที่หนึ่ง */}
            <div
                className="
                    absolute
                    inset-[2px]
                    rounded-xl
                    bg-gradient-to-b
                    from-[#FFFDE7]
                    via-[#FFE082]
                    to-[#FFC107]
                    opacity-90
                "
            />

            {/* ไล่สีชั้นที่สอง */}
            <div
                className="
                    absolute
                    inset-[2px]
                    rounded-xl
                    bg-gradient-to-b
                    from-[#FFF6C9]
                    via-[#FFDA59]
                    to-[#FFB400]
                    opacity-90
                "
            />

            {/* แสงสีขาว */}
            <div
                className="
                    absolute
                    inset-[2px]
                    rounded-xl
                    bg-gradient-to-br
                    from-white/40
                    via-[#FFF59D]/30
                    to-[#FFD54F]/20
                "
            />

            {/* แสงภายในปุ่ม */}
            <div
                className="
                    absolute
                    inset-[2px]
                    rounded-xl
                    shadow-[inset_0_0_20px_rgba(255,235,59,0.6)]
                "
            />

            {/* แสงวาบเมื่อ hover */}
            <div
                className="
                    absolute
                    -left-20
                    top-0
                    h-full
                    w-10
                    rotate-12
                    bg-white/80
                    blur-md
                    transition-all
                    duration-700
                    group-hover:left-[180px]
                "
            />

            {/* ข้อความ */}
            <div
                className="
                    relative
                    z-10
                    flex
                    h-full
                    items-center
                    justify-center
                "
            >
                <span
                    className="
                        text-lg
                        font-bold
                        tracking-wide
                        text-black
                        drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]
                    "
                >
                    {text}
                </span>
            </div>

            {/* Overlay ตอน hover */}
            <div
                className="
                    absolute
                    inset-[2px]
                    rounded-xl
                    bg-gradient-to-r
                    from-[#FFE082]/10
                    via-[#FFF8CC]/20
                    to-[#FFE082]/10
                    opacity-0
                    transition-opacity
                    duration-300
                    group-hover:opacity-100
                "
            />
        </button>
    );
}