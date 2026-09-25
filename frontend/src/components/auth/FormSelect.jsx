export default function FormSelect({
    name,
    value,
    onChange,
    children,
    className = "",
    focusClass = "focus:border-blue-500 focus:ring-blue-100",
}) {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`
                w-full rounded-lg border border-gray-300 bg-white
                px-3.5 py-3 text-sm
                ${value ? "text-gray-800" : "text-gray-400"}
                transition focus:outline-none focus:ring-4
                ${focusClass}
                ${className}
            `}
        >
            {children}
        </select>
    );
}