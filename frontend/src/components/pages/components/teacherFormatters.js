export const formatDateTime = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "-";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m ? `${m} นาที ${s} วินาที` : `${s} วินาที`;
};