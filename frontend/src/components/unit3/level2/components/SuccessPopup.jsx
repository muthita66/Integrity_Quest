export default function SuccessPopup({
    message,
}) {
    if (!message) {
        return null;
    }

    return (
        <div
            className="
                absolute left-1/2 top-28 z-50
                -translate-x-1/2
                animate-bounce
                rounded-3xl border-4 border-emerald-700
                bg-white px-8 py-4
                text-3xl font-black text-emerald-900
                shadow-2xl
            "
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
}