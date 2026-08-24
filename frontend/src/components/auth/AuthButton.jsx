export default function AuthButton({
    type = "button",
    icon: Icon,
    title,
    subtitle,
    className = "",
    onClick,
    disabled = false,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
        rounded-2xl
        py-4
        px-6
        font-extrabold
        text-xl
        shadow-lg
        transition-all
        duration-200
        hover:scale-[1.02]
        active:scale-[0.98]
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
        >
            <div className="flex items-center justify-center gap-3">
                {Icon && <Icon className="text-2xl" />}

                <div className="text-center">
                    <div>{title}</div>

                    {subtitle && (
                        <div className="text-xs font-medium tracking-wide">
                            {subtitle}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}