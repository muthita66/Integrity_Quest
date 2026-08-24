import { Folder, Search } from "lucide-react";

export default function Header({ stage, onSelectCases }) {
    return (
        <div className="flex items-center justify-between mb-6">

            {stage !== "title" && stage !== "end" && (
                <button
                    type="button"
                    onClick={onSelectCases}
                    className="cid-body text-xs px-3 py-1.5 rounded border flex items-center gap-1"
                    style={{
                        borderColor: "#B8A87C",
                        color: "#4A3B22",
                        backgroundColor: "#F3E9D2",
                    }}
                >
                    <Folder size={14} />
                    เลือกคดี
                </button>
            )}
        </div>
    );
}
