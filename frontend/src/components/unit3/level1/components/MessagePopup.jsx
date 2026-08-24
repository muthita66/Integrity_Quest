export default function MessagePopup({ message }) {
    if (!message) return null;

    return (
        <div className="absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white px-10 py-5 rounded-3xl shadow-2xl border-4 border-amber-700 text-3xl font-black text-amber-900 animate-bounce font-sara">
            {message}
        </div>
    );
}
