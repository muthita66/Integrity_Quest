import { Wallet, FileText, Star, ScrollText } from "lucide-react";

const INK = "#2B2A24";
const PAPER_DARK = "#E7DCB8";
const LINE = "#C9B98C";
const CAMP_GREEN = "#2F6B3E";
const BRASS = "#A9822C";

export default function SummaryPanel({ result }) {
    if (!result) return null;

    const rows = [
        {
            icon: Wallet,
            label: "เงินคงเหลือ",
            value: `${result.balance.toLocaleString()} บาท`,
            color: CAMP_GREEN,
        },
        {
            icon: FileText,
            label: "ใบเสร็จ",
            value: `${result.receipts} ใบ`,
            color: INK,
        },
        {
            icon: Star,
            label: "คะแนน",
            value: result.score,
            color: BRASS,
        },
    ];

    return (
        <div
            className="rounded-sm p-5"
            style={{ background: PAPER_DARK, border: `1px solid ${LINE}` }}
        >
            <div
                className="mb-3 flex items-center gap-2 text-sm font-black"
                style={{ color: INK }}
            >
                <ScrollText size={18} />
                <span>สรุปการบริหารงบ</span>
            </div>

            <div className="space-y-1.5 font-mono text-sm">
                {rows.map(({ icon: Icon, label, value, color }, i) => (
                    <div key={i} className="flex items-end gap-2">
                        <span
                            className="flex items-center gap-1.5 whitespace-nowrap font-sans font-bold"
                            style={{ color: INK }}
                        >
                            <Icon size={14} style={{ color }} />
                            {label}
                        </span>
                        <span
                            className="flex-1 border-b border-dotted translate-y-[-3px]"
                            style={{ borderColor: LINE }}
                        />
                        <span className="font-black" style={{ color }}>
                            {value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
