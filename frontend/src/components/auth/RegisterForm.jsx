import { FaEnvelope, FaKey, FaUserAstronaut, FaKhanda } from "react-icons/fa";

import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import AuthButton from "./AuthButton";

export default function RegisterForm({
    registerData,
    faculties,
    filteredMajors,
    handleRegisterChange,
    handleRegisterSubmit,
    setIsLogin,
}) {
    return (
        <form onSubmit={handleRegisterSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
                {/* LEFT */}
                <div className="space-y-4">
                    <FormInput
                        icon={FaUserAstronaut}
                        name="username"
                        value={registerData.username}
                        onChange={handleRegisterChange}
                        placeholder="USERNAME"
                    />

                    <FormInput
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        placeholder="ชื่อ"
                    />

                    <FormInput
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        placeholder="นามสกุล"
                    />

                    <FormInput
                        icon={FaEnvelope}
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="EMAIL"
                    />

                    <FormInput
                        icon={FaKey}
                        type="password"
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="PASSWORD"
                    />
                </div>

                {/* RIGHT */}
                <div className="bg-yellow-50 border-2 border-orange-300 rounded-2xl p-5 shadow-md space-y-4">
                    {/* Gender */}
                    <FormSelect
                        name="gender"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                    >
                        <option value="">GENDER</option>
                        <option value="male">ชาย</option>
                        <option value="female">หญิง</option>
                        <option value="other">อื่น ๆ</option>
                    </FormSelect>

                    {/* Age */}
                    <FormInput
                        type="number"
                        name="age"
                        value={registerData.age}
                        onChange={handleRegisterChange}
                        placeholder="AGE"
                        noIcon
                        bg="white"
                    />

                    {/* Faculty */}
                    <FormSelect
                        name="faculty"
                        value={registerData.faculty}
                        onChange={handleRegisterChange}
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
                    </FormSelect>

                    {/* Year */}
                    <FormSelect
                        name="year"
                        value={registerData.year}
                        onChange={handleRegisterChange}
                    >
                        <option value="">YEAR</option>
                        <option value="1">ปี 1</option>
                        <option value="2">ปี 2</option>
                        <option value="3">ปี 3</option>
                        <option value="4">ปี 4</option>
                    </FormSelect>

                    {/* Major */}
                    <FormSelect
                        name="major"
                        value={registerData.major}
                        onChange={handleRegisterChange}
                    >
                        <option value="">MAJOR</option>

                        {filteredMajors.map((major) => (
                            <option
                                key={major.major_id}
                                value={major.major_id}
                            >
                                {major.major_name}
                            </option>
                        ))}
                    </FormSelect>
                </div>
            </div>

            {/* SIGN UP */}
            <AuthButton
                type="submit"
                icon={FaKhanda}
                title="SIGN UP"
                subtitle="START ADVENTURE!"
                className="w-full mt-8 bg-gradient-to-b from-blue-400 to-blue-600 text-white"
            />

            {/* BACK */}
            <div className="flex justify-center mt-5">
                <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="bg-gradient-to-b from-yellow-300 to-orange-400 px-6 py-3 rounded-xl font-bold shadow hover:scale-105 transition"
                >
                    กลับไปหน้า LOGIN
                </button>
            </div>
        </form>
    );
}