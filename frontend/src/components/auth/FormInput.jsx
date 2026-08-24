export default function FormInput({
    icon: Icon,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    noIcon = false,
    bg = "yellow",
}) {
    const bgClass =
        bg === "white"
            ? "bg-white border border-gray-300"
            : "bg-yellow-50 border-2 border-orange-300";

    return (
        <div className="relative">
            {!noIcon && Icon && (
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 text-lg" />
            )}

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`
          w-full
          ${bgClass}
          rounded-xl
          py-3
          ${!noIcon && Icon ? "pl-12" : "px-4"}
          pr-4
          font-semibold
          focus:outline-none
          focus:ring-2
          focus:ring-blue-400
          transition
        `}
            />
        </div>
    );
}