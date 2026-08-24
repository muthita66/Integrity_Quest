export default function MoneyDisplay({ money }) {
    return (
        <div className="flex justify-center mb-6">
            <div className="px-6 py-3 rounded-2xl bg-emerald-100 border-2 border-emerald-500 shadow-md">
                <p className="text-lg font-bold text-emerald-700">
                    เงินคงเหลือ
                </p>

                <p className="text-3xl font-black text-emerald-600">
                    {money} บาท
                </p>
            </div>
        </div>
    );
}