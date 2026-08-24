export default function AuthHeader({ isLogin }) {
    return (
        <>
            {/* TITLE */}
            <h1 className="text-center text-5xl font-extrabold text-yellow-500 drop-shadow-lg">
                WELCOME, HERO!
            </h1>

            {/* SUBTITLE */}
            <p className="text-center text-xl font-bold text-gray-800 mt-1 mb-8">
                {isLogin ? "LOGIN TO YOUR QUEST" : "SIGN UP YOUR QUEST"}
            </p>
        </>
    );
}