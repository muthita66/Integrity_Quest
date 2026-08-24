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

    popup,
    setPopup,

    loginData,
    registerData,

    faculties,
    filteredMajors,

    handleLoginChange,
    handleRegisterChange,
    handleLoginSubmit,
    handleRegisterSubmit,
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
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url(${bg_login})`,
        }}
      >
        <div className="bg-white/40 backdrop-blur-md border-4 border-white/60 shadow-2xl rounded-[25px] p-8 w-full max-w-4xl">
          <AuthHeader isLogin={isLogin} />

          {isLogin ? (
            <LoginForm
              loginData={loginData}
              handleLoginChange={handleLoginChange}
              handleLoginSubmit={handleLoginSubmit}
              setIsLogin={setIsLogin}
            />
          ) : (
            <RegisterForm
              registerData={registerData}
              faculties={faculties}
              filteredMajors={filteredMajors}
              handleRegisterChange={handleRegisterChange}
              handleRegisterSubmit={handleRegisterSubmit}
              setIsLogin={setIsLogin}
            />
          )}
        </div>
      </div>
    </>
  );
}