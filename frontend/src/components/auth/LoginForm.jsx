import {
    FaUser,
    FaKey,
    FaShieldAlt,
    FaHatWizard,
    FaScroll,
} from "react-icons/fa";

import FormInput from "./FormInput";
import AuthButton from "./AuthButton";

export default function LoginForm({
    loginData,
    handleLoginChange,
    handleLoginSubmit,
    setIsLogin,
}) {
    return (
        <form
            onSubmit={handleLoginSubmit}
            className="max-w-md mx-auto space-y-5"
        >
            {/* EMAIL */}
            <FormInput
                icon={FaUser}
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="EMAIL / รหัส"
            />

            {/* PASSWORD */}
            <FormInput
                icon={FaKey}
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="PASSWORD / รหัสผ่าน"
            />

            {/* LOGIN */}
            <AuthButton
                type="submit"
                icon={FaShieldAlt}
                title="LOG IN"
                subtitle="START ADVENTURE!"
                className="w-full bg-gradient-to-b from-blue-400 to-blue-600 text-white"
            />

            {/* Bottom Buttons */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="bg-gradient-to-b from-yellow-300 to-orange-400 text-gray-800 rounded-xl h-12 font-bold shadow hover:scale-105 transition"
                >
                    <div className="flex items-center justify-center gap-2">
                        <FaScroll />
                        SIGN UP
                    </div>
                </button>

                <button
                    type="button"
                    className="bg-gradient-to-b from-purple-400 to-purple-600 text-white rounded-xl h-12 font-bold shadow hover:scale-105 transition"
                >
                    <div className="flex items-center justify-center gap-2">
                        <FaHatWizard />
                        FORGOT?
                    </div>
                </button>
            </div>
        </form>
    );
}