import { useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import axios from "../components/axioscreds";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";

export default function SignInPage() {
  const { update } = useContext(AuthContext);
  const { clearAllCache } = useContext(DataContext);

  useEffect(() => {
    document.body.style.backgroundColor = "white";
    // Cleanup to reset the background color when component unmounts
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.target);
    axios
      .post("/login", {
        staff_id: data.get("username"),
        password: data.get("password"),
      })
      .then((response) => {
        console.log("Login successful");
        clearAllCache();
        update(response.data.permission);
        navigate("/dashboard");
      })
      .catch(() => {
        window.alert(
          "บัญชีผู้ใช้หรือรหัสผ่านของท่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง"
        );
      });
    event.target.reset();
  };

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 pb-40 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md lg:max-w-lg xl:max-w-xl">
          <img
            className="mx-auto h-40 w-auto lg:h-56"
            src="./images/CRAlogo.png"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            ลงชื่อเข้าสู่ระบบ
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md lg:max-w-lg xl:max-w-xl">
          <form className="space-y-6" onSubmit={handleSubmit} method="POST">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                บัญขีผู้ใช้
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  รหัสผ่าน
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="mt-12 flex w-full justify-center rounded-md bg-[#003087] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#0049CC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
