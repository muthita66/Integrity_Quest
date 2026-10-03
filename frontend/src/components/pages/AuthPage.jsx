import bg_login from "../../assets/bg_login.png";

import useAuth from "../hooks/useAuth";

import Popup from "../../components/auth/Popup";
import AuthHeader from "../../components/auth/AuthHeader";
import LoginForm from "../../components/auth/LoginForm";
import RegisterForm from "../../components/auth/RegisterForm";

export default function AuthPage() {
  const {
    isLogin,
    setIsLogin,

    role,
    setRole,

    popup,
    setPopup,

    loginData,
    registerData,

    faculties,
    filteredMajors,
    departments,

    handleLoginChange,
    handleRegisterChange,
    handleLoginSubmit,
    handleRegisterSubmit,
    updateStudentGroups,
  } = useAuth();

  return (
    <>
      <Popup
        popup={popup}
        onClose={() =>
          setPopup({
            show: false,
            type: "",
            message: "",
          })
        }
      />

      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed px-4 py-10"
        style={{
          backgroundImage: `url(${bg_login})`,
        }}
      >
        <div
          className={`w-full rounded-3xl border border-white/50 bg-white/30 p-8 shadow-xl backdrop-blur-md sarabun-regular md:p-10 ${isLogin ? "max-w-2xl" : "max-w-3xl"
            }`}
        >
          <AuthHeader isLogin={isLogin} role={role} />

          {isLogin ? (
            <div className="mx-auto max-w-md">
              <LoginForm
                loginData={loginData}
                handleLoginChange={handleLoginChange}
                handleLoginSubmit={handleLoginSubmit}
                setIsLogin={setIsLogin}
                role={role}
                setRole={setRole}
              />
            </div>
          ) : (
            <RegisterForm
              registerData={registerData}
              faculties={faculties}
              filteredMajors={filteredMajors}
              departments={departments}
              handleRegisterChange={handleRegisterChange}
              handleRegisterSubmit={handleRegisterSubmit}
              updateStudentGroups={updateStudentGroups}
              setIsLogin={setIsLogin}
              role={role}
              setRole={setRole}
            />
          )}
        </div>
      </div>
    </>
  );
}