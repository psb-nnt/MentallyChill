import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/dashboard";
import DiagnosisPage from "./pages/diagnosis";
import BookingInfoPage from "./pages/bookingInfo";
import BookingDetailsPage from "./pages/bookingDetails";
import BookingHistoryPage from "./pages/bookingHistory";
import BookingHistoryDonePage from "./pages/bookingHistoryDone";
import SignInPage from "./pages/signin";
import AssignDatePage from "./pages/assignDate";
import RegisterPage from "./pages/register";
import StaffListPage from "./pages/stafflist";
import EditStaffPage from "./pages/editstaff";
import UserListPage from "./pages/userlist";
import LogPage from "./pages/log";

import AuthCheck from "./components/authCheck";
import ProtectedRoute from "./components/protectedroute";
import EditProfilePage from "./pages/editprofile";

import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const isAuthed = await AuthCheck();
        setIsLoggedIn(isAuthed);
      } catch (error) {
        console.error('Error checking authentication:', error);
      }
    };

    checkAuthentication();
  }, []);

  return (
    <>
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
        
          <Routes>
            <Route path="/" element={isLoggedIn ? <DashboardPage /> : <SignInPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/dashboard" element={<ProtectedRoute element={DashboardPage} />} />
            <Route path="/diagnosis" element={<ProtectedRoute element={DiagnosisPage} />} />
            <Route path="/bookinginfo" element={<ProtectedRoute element={BookingInfoPage} />} />
            <Route path="/bookingdetails/:bookingId" element={<ProtectedRoute element={BookingDetailsPage} />} />
            <Route path="/bookinghistory/:bookingId" element={<ProtectedRoute element={BookingHistoryPage} />} />
            <Route path="/bookinghistorydone/:bookingId" element={<ProtectedRoute element={BookingHistoryDonePage} />} />
            <Route path="/assigndate" element={<ProtectedRoute element={AssignDatePage} />} />
            <Route path="/register" element={<ProtectedRoute element={RegisterPage} />} />
            <Route path="/editprofile" element={<ProtectedRoute element={EditProfilePage} />} />
            <Route path="/editstaff/:staffId" element={<ProtectedRoute element={EditStaffPage} />} />
            <Route path="/stafflist" element={<ProtectedRoute element={StaffListPage} />} />
            <Route path="/userlist" element={<ProtectedRoute element={UserListPage} />} />
            <Route path="/log" element={<ProtectedRoute element={LogPage} />} />
          </Routes>
          
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
    </>
  );
}

export default App;
