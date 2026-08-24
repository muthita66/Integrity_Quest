import { IoIosCheckmarkCircle } from "react-icons/io";

export default function DocumentCard({ doc, isFound, handleClickDoc }) {
    return (
        <button
            onClick={() => handleClickDoc(doc)}
            disabled={isFound}
            className={`
                absolute z-20 w-56 h-64
                transition-all duration-300
                hover:scale-110 hover:z-40
                ${isFound ? "opacity-30 scale-75 rotate-0" : ""}
            `}
            style={{
                left: doc.x,
                top: doc.y,
                transform: `rotate(${doc.id.length % 2 === 0 ? "8deg" : "-10deg"})`,
            }}
        >
            <img
                src={doc.image}
                alt={doc.label}
                className="w-full h-full object-contain drop-shadow-xl"
                draggable={false}
            />

            {isFound && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl text-green-500 drop-shadow-lg">
                        <IoIosCheckmarkCircle />
                    </span>
                </div>
            )}
        </button>
    );
}
