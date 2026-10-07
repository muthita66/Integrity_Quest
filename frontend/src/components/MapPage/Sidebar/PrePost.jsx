import { BASE_URL } from "../../../config";
import { useEffect, useState } from "react";
import { FaLock, FaUnlock, FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || `${BASE_URL}/api`;

function PrePost() {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchStatus = async () => {
            try {
                const token = localStorage.getItem("token");

                const res = await fetch(`${API_BASE}/profile/test-status`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!res.ok) {
                    throw new Error("โหลดสถานะแบบทดสอบไม่สำเร็จ");
                }

                const data = await res.json();

                if (isMounted) {
                    setStatus(data.data);
                }
            } catch (err) {
                console.error("เช็คสถานะ pre/post-test ไม่สำเร็จ:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchStatus();

        return () => {
            isMounted = false;
        };
    }, []);

    const preTestDone = status?.pre_test_done ?? false;
    const postTestDone = status?.post_test_done ?? false;
    const postTestUnlocked = status?.post_test_unlocked ?? false;

    const handlePreTestClick = () => {
        if (loading) return;

        if (preTestDone) {
            alert("คุณทำ Pre-Test ไปแล้ว ไม่สามารถทำซ้ำได้");
            return;
        }

        navigate("/pretest");
    };

    const handlePostTestClick = () => {
        if (loading) return;

        if (postTestDone) {
            alert("คุณทำ Post-Test ไปแล้ว ไม่สามารถทำซ้ำได้");
            return;
        }

        if (!postTestUnlocked) {
            alert(
                !preTestDone
                    ? "กรุณาทำ Pre-Test ก่อน"
                    : "ต้องเล่นผ่านให้ครบทุกบทก่อน ถึงจะทำ Post-Test ได้"
            );
            return;
        }

        navigate("/posttest");
    };

    return (
        <div className="panel">
            {/* Pre-Test */}
            <button
                onClick={handlePreTestClick}
                disabled={loading}
                style={{
                    width: "100%",
                    background: preTestDone ? "#d7ecd9" : "#e8efd3",
                    border: `2px solid ${preTestDone ? "#9fd4a6" : "#c6d2a7"}`,
                    borderRadius: "14px",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: preTestDone ? "#2f7a3d" : "#6b4f3b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    marginBottom: "10px",
                }}
            >
                {preTestDone ? <FaCheckCircle /> : <FaUnlock />}
                {preTestDone ? "Pre-Test " : "Pre-Test"}
            </button>

            {/* Post-Test */}
            <button
                onClick={handlePostTestClick}
                disabled={loading || (!postTestUnlocked && !postTestDone)}
                style={{
                    width: "100%",
                    background: postTestDone
                        ? "#d7ecd9"
                        : postTestUnlocked
                            ? "#e8efd3"
                            : "#e5e5e5",
                    border: `2px solid ${postTestDone
                        ? "#9fd4a6"
                        : postTestUnlocked
                            ? "#c6d2a7"
                            : "#cfcfcf"
                        }`,
                    borderRadius: "14px",
                    padding: "12px",
                    fontWeight: "600",
                    fontSize: "16px",
                    color: postTestDone
                        ? "#2f7a3d"
                        : postTestUnlocked
                            ? "#6b4f3b"
                            : "#888",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor:
                        loading || (!postTestUnlocked && !postTestDone)
                            ? "not-allowed"
                            : "pointer",
                }}
            >
                {postTestDone ? (
                    <>
                        <FaCheckCircle />
                        Post-Test
                    </>
                ) : postTestUnlocked ? (
                    <>
                        <FaUnlock />
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