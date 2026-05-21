import { useState, useEffect } from "react";
import axios from "axios";

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
      {popup.show && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center">
            <h2
              className={`text-2xl font-bold mb-3 ${
                popup.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {popup.type === "success" ? "สำเร็จ" : "ผิดพลาด"}
            </h2>

            <p className="text-gray-700 mb-5">{popup.message}</p>
            <button
              onClick={() =>
                setPopup({
                  ...popup,
                  show: false,
                })
              }
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8">
          {/* Header */}
          <h1 className="text-3xl font-bold text-center text-indigo-600 mb-6">
            {isLogin ? "Login" : "Register"}
          </h1>

          {/* Form */}
          <form
            onSubmit={isLogin ? handleLoginSubmit : handleRegisterSubmit}
            className="space-y-4"
          >
            {isLogin ? (
              <>
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="example@email.com"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    placeholder="********"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>

                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition">
                  Login
                </button>
              </>
            ) : (
              <>
                {/* Username */}
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  placeholder="username"
                  className="w-full border rounded-lg px-4 py-2"
                />

                {/* First Name */}
                <input
                  type="text"
                  name="firstName"
                  value={registerData.firstName}
                  onChange={handleRegisterChange}
                  placeholder="ชื่อ"
                  className="w-full border rounded-lg px-4 py-2"
                />

                {/* Last Name */}
                <input
                  type="text"
                  name="lastName"
                  value={registerData.lastName}
                  onChange={handleRegisterChange}
                  placeholder="นามสกุล"
                  className="w-full border rounded-lg px-4 py-2"
                />

                {/* Email */}
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder="Email"
                  className="w-full border rounded-lg px-4 py-2"
                />

                {/* Password */}
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Password"
                  className="w-full border rounded-lg px-4 py-2"
                />

                {/* Gender */}
                <select
                  name="gender"
                  value={registerData.gender}
                  onChange={handleRegisterChange}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">เลือกเพศ</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>

                {/* Age */}
                <input
                  type="number"
                  name="age"
                  value={registerData.age}
                  onChange={handleRegisterChange}
                  placeholder="อายุ"
                  className="w-full border rounded-lg px-4 py-2"
                />

                {/* Faculty */}
                <select
                  type="text"
                  name="faculty"
                  value={registerData.faculty}
                  onChange={handleRegisterChange}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">เลือกคณะ</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.faculty_id} value={faculty.faculty_id}>
                      {faculty.faculty_name}
                    </option>
                  ))}
                </select>

                {/* Major */}
                <select
                  name="major"
                  value={registerData.major}
                  onChange={handleRegisterChange}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">เลือกสาขา</option>

                  {filteredMajors.map((major) => (
                    <option key={major.major_id} value={major.major_name}>
                      {major.major_name}
                    </option>
                  ))}
                </select>

                {/* Year */}
                <select
                  name="year"
                  value={registerData.year}
                  onChange={handleRegisterChange}
                  className="w-full border rounded-lg px-4 py-2"
                >
                  <option value="">เลือกชั้นปี</option>
                  <option value="1">ปี 1</option>
                  <option value="2">ปี 2</option>
                  <option value="3">ปี 3</option>
                  <option value="4">ปี 4</option>
                  <option value="5">ปี 5</option>
                  <option value="6">ปี 6</option>
                </select>

                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                  Register
                </button>
              </>
            )}
          </form>

          {/* Toggle */}
          <p className="text-center text-sm mt-6">
            {isLogin ? "ยังไม่มีบัญชี?" : "มีบัญชีอยู่แล้ว?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-semibold hover:underline"
            >
              {isLogin ? "สมัครสมาชิก" : "เข้าสู่ระบบ"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
