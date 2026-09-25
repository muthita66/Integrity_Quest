export default function FormInput({
    icon: Icon,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    noIcon = false,
    focusClass = "focus:border-blue-500 focus:ring-blue-100",
}) {
    const showIcon = !noIcon && Icon;

    return (
        <div className="relative">
            {showIcon && (
                <Icon className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            )}

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                aria-label={placeholder}
                className={`
                    w-full rounded-lg border border-gray-300 bg-white
                    py-3 ${showIcon ? "pl-10" : "pl-3.5"} pr-3.5
                    text-sm text-gray-800 placeholder:text-gray-400
                    transition focus:outline-none focus:ring-4
                    ${focusClass}
                `}
            />
        </div>
    );
}