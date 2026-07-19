import axios from "./axioscreds";
import { useEffect, useState, useContext } from "react";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";

export default function Topbar() {
  const { clearAllCache } = useContext(DataContext);
  const { user } = useContext(AuthContext);

  const onLogout = () => {
    axios.post("/auth/logout")
      .then(() => {
        clearAllCache();
        window.location.href = "/";
      })
      .catch(error => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <div className="flex justify-between items-center bg-[#003087] border-1 border-[#003087]">
      <div className="logo">
        <img src="../images/logo.png" width={350} height={100} alt="logo" />
      </div>
      <div className="flex flex-row items-center">
        <h1 className="text-2xl font-bold text-[#FFFFFF] pr-5">{user?.staff_id}</h1>
        <button
          className="ml-4 text-lg mr-5 border-4 border-[#FFFFFF] bg-[#FFFFFF] p-1 rounded-xl"
          onClick={onLogout}
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
