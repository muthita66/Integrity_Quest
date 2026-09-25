import { FiUser, FiLock } from "react-icons/fi";

import FormInput from "./FormInput";
import AuthButton from "./AuthButton";
import RoleToggle, { getRoleTheme } from "./RoleToggle";

export default function LoginForm({
    loginData,
    handleLoginChange,
    handleLoginSubmit,
    setIsLogin,
    role,
    setRole,
}) {
    const theme = getRoleTheme(role);

    return (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* ROLE */}
            <RoleToggle role={role} setRole={setRole} />

            {/* EMAIL */}
            <FormInput
                icon={FiUser}
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleLoginChange}
                placeholder="Enter your email"
                focusClass={theme.focus}
            />

            {/* PASSWORD */}
            <FormInput
                icon={FiLock}
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleLoginChange}
                placeholder="Enter your password"
                focusClass={theme.focus}
            />

            {/* FORGOT */}
            <button
                type="button"
                className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
            >
                Forgot password?
            </button>

            {/* LOGIN */}
            <AuthButton
                type="submit"
                title="Log In"
                className={theme.button}
            />

            {/* SIGN UP LINK */}
            <p className="text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`font-semibold hover:underline ${theme.link}`}
                >
                    Sign up
                </button>
            </p>
        </form>
    );
}