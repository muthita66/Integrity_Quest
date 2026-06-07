import { FaClipboardCheck, FaLock, FaUnlock, FaUnlockAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function PrePost({ completedUnits = 0, totalUnits = 6 }) {
    const navigate = useNavigate();

    const isPostTestUnlocked = completedUnits >= totalUnits;

    return (
        <div className="panel">
            <button
                onClick={() => navigate("/pretest")}
                style={{
                    width: "100%",
                    background: "#e8efd3",
                    border: "2px solid #c6d2a7",
                    borderRadius: "14px",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: "#6b4f3b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    marginBottom: "10px",
                }}
            >
                <FaClipboardCheck />
                Pre-Test
            </button>

            <button
                disabled={!isPostTestUnlocked}
                onClick={() => navigate("/posttest")}
                style={{
                    width: "100%",
                    background: isPostTestUnlocked ? "#e8efd3" : "#e5e5e5",
                    border: `2px solid ${isPostTestUnlocked ? "#c6d2a7" : "#cfcfcf"
                        }`,
                    borderRadius: "14px",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: isPostTestUnlocked ? "#6b4f3b" : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: isPostTestUnlocked ? "pointer" : "not-allowed",
                }}
            >
                {isPostTestUnlocked ? (
                    <>
                        <FaUnlockAlt />
                        Post-Test
                    </>
                ) : (
                    <>
                        <FaLock />
                        Post-Test
                    </>
                )}
            </button>
        </div>
    );
}

export default PrePost;