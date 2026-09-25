export default function AuthButton({
    type = "button",
    title,
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
                w-full rounded-lg py-3 text-sm font-semibold text-white
                shadow-sm transition
                focus:outline-none focus-visible:ring-4
                disabled:cursor-not-allowed disabled:opacity-50
                ${className}
            `}
        >
            {title}
        </button>
    );
}