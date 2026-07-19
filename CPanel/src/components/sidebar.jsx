import axios from "../components/axioscreds";
import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const [isDashboardActive, setIsDashboardActive] = useState(true);
  const [isDiagnosisActive, setIsDiagnosisActive] = useState(false);
  const [isBookingActive, setIsBookingActive] = useState(false);
  const [isAssignDate, setIsAssignDate] = useState(false);
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [isEditProfileActive, setIsEditProfileActive] = useState(false);
  const [isStaffListActive, setIsStaffListActive] = useState(false);
  const [isUserListActive, setIsUserListActive] = useState(false);
  const [isLogActive, setIsLogActive] = useState(false);
  const { permission } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();


  const { bookingId } = useParams();
    



  useEffect(() => {
    switch (location.pathname) {
      case "/dashboard":
        setIsDashboardActive(true);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/diagnosis":
        setIsDashboardActive(false);
        setIsDiagnosisActive(true);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/bookinginfo":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(true);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/bookingdetails/":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(true);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/bookinghistory/":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(true);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/bookinghistorydone/":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(true);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/assigndate":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(true);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/register":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(true);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/editprofile":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(true);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/stafflist":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(true);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/editstaff/":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(true);
        setIsUserListActive(false);
        setIsLogActive(false);
        break;
      case "/userlist":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(true);
        setIsLogActive(false);
        break;
      case "/log":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(true);
        break;
      default:
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(true);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        break;
    }
    if (location.pathname === "/editstaff" || location.pathname.startsWith("/editstaff/")) {
      setIsStaffListActive(true);
      setIsBookingActive(false);
    }
  }, [location.pathname]);

  const checkActive = (section) => {
    switch (section) {
      case "dashboard":
        setIsDashboardActive(true);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);

        navigate("/dashboard");
        break;
      case "diagnosis":
        setIsDashboardActive(false);
        setIsDiagnosisActive(true);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);

        navigate("/diagnosis");
        break;
      case "booking":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(true);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);

        navigate("/bookinginfo");
        break;
      case "assigndate":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(true);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);

        navigate("/assigndate");
        break;
      case "register":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(true);
        setIsEditProfileActive(false);

        navigate("/register");
        break;
      case "editprofile":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(true);

        navigate("/editprofile");
      case "stafflist":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(true);

        navigate("/stafflist");
        break;
      case "userlist":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(true);


        navigate("/userlist");
        break;
      case "log":
        setIsDashboardActive(false);
        setIsDiagnosisActive(false);
        setIsBookingActive(false);
        setIsAssignDate(false);
        setIsRegisterActive(false);
        setIsEditProfileActive(false);
        setIsStaffListActive(false);
        setIsUserListActive(false);
        setIsLogActive(true);
  
        navigate("/log");
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex flex-row w-screen">
      <div className="flex relative w-full border bg-[#FFFFFF] justify-center">
        <div className="flex flex-col items-center pt-10 w-full">
          <div
            onClick={() => checkActive("dashboard")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isDashboardActive
                ? "bg-[#003087] text-white"
                : "hover:bg-gray-300"
            }`}
          >
            แผงควบคุม
          </div>
          <div
            onClick={() => checkActive("diagnosis")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isDiagnosisActive
                ? "bg-[#003087] text-white"
                : "hover:bg-gray-300"
            }`}
          >
            ผลการประเมิน
          </div>
          <div
            onClick={() => checkActive("booking")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isBookingActive ? "bg-[#003087] text-white" : "hover:bg-gray-300"
            }`}
          >
            การจอง
          </div>
          <div
            onClick={() => checkActive("assigndate")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isAssignDate ? "bg-[#003087] text-white" : "hover:bg-gray-300"
            }`}
          >
            ลงเวลา
          </div>
          <div
            onClick={() => checkActive("stafflist")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isStaffListActive ? "bg-[#003087] text-white" : "hover:bg-gray-300"
            }`}
          >
            รายชื่อเจ้าหน้าที่
          </div>
          <div
            onClick={() => checkActive("userlist")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isUserListActive ? "bg-[#003087] text-white" : "hover:bg-gray-300"
            }`}
          >
            รายชื่อผู้ใช้
          </div>
          {permission === "administrator" && (
            <>
              <div
                onClick={() => checkActive("register")}
                className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
                  isRegisterActive ? "bg-[#003087] text-white" : "hover:bg-gray-300"
                }`}
              >
                เพิ่มบัญชีเจ้าหน้าที่
              </div>
              <div
                onClick={() => checkActive("log")}
                className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
                  isLogActive ? "bg-[#003087] text-white" : "hover:bg-gray-300"
                }`}
              >
                บันทึกเข้าออกระบบ
              </div>
            </>
          )}
          {/* <div
            onClick={() => checkActive("editprofile")}
            className={`flex items-center justify-center p-5 rounded-md cursor-pointer w-full text-2xl ${
              isEditProfileActive ? "bg-[#003087] text-white" : "hover:bg-gray-300"
            }`}
          >
            แก้ไขบัญชีเจ้าหน้าที่
          </div> */}
        </div>
      </div>
    </div>
  );
}
