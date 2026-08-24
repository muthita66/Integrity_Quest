export default function FormSelect({
    name,
    value,
    onChange,
    children,
    className = "",
}) {
    return (
        <select
            name={name}
            value={value}
            onChange={onChange}
            className={`
        w-full
        bg-white
        rounded-xl
        px-4
        py-3
        border
        border-gray-300
        font-semibold
        focus:outline-none
        focus:ring-2
        focus:ring-blue-400
        transition
        ${className}
      `}
        >
            {children}
        </select>
    );
}