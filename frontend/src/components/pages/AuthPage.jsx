import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUser,
  FaKey,
  FaScroll,
  FaHatWizard,
  FaShieldAlt,
  FaUserAstronaut,
  FaEnvelope,
  FaKhanda,
  FaArrowLeft,
} from "react-icons/fa";
import bgLogin from "../../assets/bg_login.png";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const [faculties, setFaculties] = useState([]);
  const [filteredMajors, setFilteredMajors] = useState([]);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/master/faculties");
      setFaculties(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  //Login from state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  //Register
  const [registerData, setRegisterData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    gender: "",
    age: "",
    faculty: "",
    major: "",
    year: "",
  });

  // 1. Handle login input : เมื่อผู้ใช้พิมพ์ในช่อง login ทุกครั้ง function นี้จะถูกเรียกใช้งาน
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  // 2. Handle register input
  // 2. Handle register input
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...registerData,
      [name]: value,
    };

    setRegisterData(updatedData);

    // ถ้าเลือก faculty ให้เปลี่ยนรายการ major
    if (name === "faculty") {
      const selectedFaculty = faculties.find(
        (f) => f.faculty_id === Number(value),
      );

      setFilteredMajors(selectedFaculty?.majors || []);

      // reset major ทุกครั้งที่เปลี่ยนคณะ
      setRegisterData({
        ...updatedData,
        major: "",
      });
    }
  };

  // 3. Submit login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        loginData,
      );

      console.log(res.data);

      // เก็บ token
      localStorage.setItem("token", res.data.token);

      setPopup({
        show: true,
        type: "success",
        message: "เข้าสู่ระบบสำเร็จ!",
      });
    } catch (error) {
      console.log(error);

      setPopup({
        show: true,
        type: "error",
        message: "เข้าสู่ระบบไม่สำเร็จ!",
      });
    }
  };

  // 4. Submit Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    console.log("ส่งข้อมูลนี้:", registerData);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        registerData,
      );

      setPopup({
        show: true,
        type: "success",
        message: "ลงทะเบียนสำเร็จ!",
      });

      setTimeout(() => {
        setPopup({
          show: false,
          type: "",
          message: "",
        });
        setIsLogin(true);
      }, 2000);
    } catch (error) {
      console.log("ERROR:", error.response?.data);
      setPopup({
        show: true,
        type: "error",
        message: "ลงทะเบียนไม่สำเร็จ",
      });
    }
  };

  return (
    <>
      {/* POPUP */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl w-80 text-center">
            <h2
              className={`text-3xl font-bold mb-3 ${popup.type === "success" ? "text-green-600" : "text-red-600"
                }`}
            >
              {popup.type === "success" ? "🎉 สำเร็จ!" : "❌ ผิดพลาด"}
            </h2>

            <p className="mb-5 text-gray-700">{popup.message}</p>

            <button
              onClick={() =>
                setPopup({
                  ...popup,
                  show: false,
                })
              }
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* BACKGROUND */}
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url(${bgLogin})`,
        }}
      >
        {/* BOX */}
        <div className="bg-white/40 backdrop-blur-md border-4 border-white/60 shadow-2xl rounded-[25px] p-8 w-full max-w-4xl">
          {/* TITLE */}
          <h1 className="text-center text-5xl font-extrabold text-yellow-500 drop-shadow-lg">
            WELCOME, HERO!
          </h1>

          <p className="text-center text-xl font-bold text-gray-800 mt-1 mb-8">
            {isLogin ? "LOGIN TO YOUR QUEST" : "SIGN UP YOUR QUEST"}
          </p>

          {/* FORM */}
          <form onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}>
            {/* LOGIN */}
            {isLogin ? (
              <div className="max-w-md mx-auto space-y-5">
                {/* EMAIL */}
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />

                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="EMAIL / รหัส"
                    className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 pl-12 pr-4 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* PASSWORD */}
                <div className="relative">
                  <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />

                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="PASSWORD / รหัสผ่าน"
                    className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 pl-12 pr-4 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                {/* LOGIN BUTTON */}
                <button className="w-full bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-2xl py-4 font-extrabold text-xl shadow-lg active:translate-y-1">
                  <div className="flex items-center justify-center gap-3">
                    <FaShieldAlt />
                    <div>
                      LOG IN
                      <div className="text-xs font-medium">
                        START ADVENTURE!
                      </div>
                    </div>
                  </div>
                </button>

                {/* BOTTOM BUTTONS */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="bg-gradient-to-b from-yellow-300 to-orange-400 text-gray-800 rounded-xl h-12 font-bold shadow"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaScroll />
                      SIGN UP
                    </div>
                  </button>

                  <button
                    type="button"
                    className="bg-gradient-to-b from-purple-400 to-purple-600 text-white rounded-xl h-12 font-bold shadow"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <FaHatWizard />
                      FORGOT?
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* REGISTER GRID */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* LEFT */}
                  <div className="space-y-4">
                    <div className="relative">
                      <FaUserAstronaut className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        name="username"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        placeholder="USERNAME"
                        className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 pl-12"
                      />
                    </div>

                    <input
                      name="firstName"
                      value={registerData.firstName}
                      onChange={handleRegisterChange}
                      placeholder="ชื่อ"
                      className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 px-4"
                    />

                    <input
                      name="lastName"
                      value={registerData.lastName}
                      onChange={handleRegisterChange}
                      placeholder="นามสกุล"
                      className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 px-4"
                    />

                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="EMAIL"
                        className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 pl-12"
                      />
                    </div>

                    <div className="relative">
                      <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" />
                      <input
                        type="password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="PASSWORD"
                        className="w-full bg-yellow-50 border-2 border-orange-300 rounded-xl py-3 pl-12"
                      />
                    </div>
                  </div>

                  {/* RIGHT SCROLL */}
                  <div className="bg-yellow-50 border-2 border-orange-300 rounded-2xl p-5 shadow-md space-y-4">
                    <select
                      name="gender"
                      value={registerData.gender}
                      onChange={handleRegisterChange}
                      className="w-full bg-white rounded-xl px-4 py-3 border"
                    >
                      <option value="">GENDER</option>
                      <option value="male">ชาย</option>
                      <option value="female">หญิง</option>
                      <option value="other">อื่นๆ</option>
                    </select>

                    <input
                      type="number"
                      name="age"
                      value={registerData.age}
                      onChange={handleRegisterChange}
                      placeholder="AGE"
                      className="w-full bg-white rounded-xl px-4 py-3 border"
                    />

                    <select
                      name="faculty"
                      value={registerData.faculty}
                      onChange={handleRegisterChange}
                      className="w-full bg-white rounded-xl px-4 py-3 border"
                    >
                      <option value="">FACULTY</option>

                      {faculties.map((faculty) => (
                        <option
                          key={faculty.faculty_id}
                          value={faculty.faculty_id}
                        >
                          {faculty.faculty_name}
                        </option>
                      ))}
                    </select>

                    <select
                      name="year"
                      value={registerData.year}
                      onChange={handleRegisterChange}
                      className="w-full bg-white rounded-xl px-4 py-3 border"
                    >
                      <option value="">YEAR</option>
                      <option value="1">ปี 1</option>
                      <option value="2">ปี 2</option>
                      <option value="3">ปี 3</option>
                      <option value="4">ปี 4</option>
                    </select>

                    <select
                      name="major"
                      value={registerData.major}
                      onChange={handleRegisterChange}
                      className="w-full bg-white rounded-xl px-4 py-3 border"
                    >
                      <option value="">MAJOR</option>

                      {filteredMajors.map((major) => (
                        <option key={major.major_id} value={major.major_id}>
                          {major.major_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SIGNUP BUTTON */}
                <button className="w-full mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-2xl py-4 font-extrabold text-xl shadow-lg">
                  <div className="flex items-center justify-center gap-3">
                    <FaKhanda />
                    <div>
                      SIGN UP
                      <div className="text-xs">START ADVENTURE!</div>
                    </div>
                  </div>
                </button>

                {/* BACK */}
                <div className="flex justify-center mt-5">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="bg-gradient-to-b from-yellow-300 to-orange-400 px-6 py-3 rounded-xl font-bold shadow"
                  >
                    <div className="flex items-center gap-2">
                      กลับไปหน้า LOGIN
                    </div>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
