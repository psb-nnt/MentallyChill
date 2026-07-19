import axios from "../components/axioscreds";
import { useEffect, useState, useRef, useContext } from "react";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { DataContext } from "../context/DataContext";

export default function StaffListPage() {
  const { getStaffList } = useContext(DataContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const staffIdFromQuery = queryParams.get('staff_id');
  const navigate = useNavigate();

  const [permission, setPermission] = useState('');

  const searchInputRef = useRef(null);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const staffData = await getStaffList();
        setData(staffData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchPermission = async () => {
      try {
        const response = await axios.get(`/auth/permission`);
        setPermission(response.data.permission);
        console.log(response.data.permission);
      }
       catch (error) {
        console.error("Error fetching permission:", error);
      }
    };

    fetchData();
    fetchPermission();
 }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (staffIdFromQuery) {
      setSearchTerm(staffIdFromQuery);
    }
  }, [staffIdFromQuery]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setRowsPerPage(5);
      } else if (window.innerWidth < 1024) {
        setRowsPerPage(8);
      } else {
        setRowsPerPage(10);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredData = data.filter((item) => {
    return (
      (searchTerm ? item.staff_id.includes(searchTerm.toLowerCase()) : true)
    );
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleEditClick = (staffId) => {
    navigate(`/editstaff/${staffId}`);
  };

  const Content = () => {
    return (
      <div className="flex flex-col flex-1 p-4 md:p-10 relative">
        <div className="flex flex-col md:flex-row gap-6 mb-6 text-center items-center">
          <h1 className="text-3xl md:text-5xl">รายชื่อเจ้าหน้าที่</h1>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-10 items-start md:items-center">
          <h2 className="text-2xl md:text-4xl mb-2 md:mb-0">ตัวกรอง : </h2>
          <input
            type="search"
            placeholder="ค้นหาโดยเลขที่ผู้ใช้"
            onChange={handleSearchTermChange}
            value={searchTerm}
            ref={searchInputRef}
            className="py-2 px-4 rounded border w-full md:w-auto"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#003087] text-white">
                <th className="py-2 px-4 text-lg md:text-3xl text-center rounded-tl-xl">
                  เลขที่เจ้าหน้าที่
                  {/* <button
                    onClick={toggleSortOrder}
                    className="ml-2 py-1 px-2 bg-gray-300 text-black rounded text-sm md:text-2xl"
                  >
                    {sortOrder === "asc" ? "▲" : "▼"}
                  </button> */}
                </th>
                <th className="py-2 px-4 text-lg md:text-3xl text-center">ชื่อเจ้าหน้าที่</th>
                <th className="py-2 px-4 text-lg md:text-3xl text-center">ชื่อเล่น</th>
                <th className={`py-2 px-4 text-lg md:text-3xl text-center ${permission !== "administrator" ? "rounded-tr-xl" : ""}`}>
                  ตำแหน่ง
                </th>
                {permission === "administrator" && (
                  <th className="py-2 px-4 text-lg md:text-3xl text-center rounded-tr-xl">
                    แก้ไข
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={`transition ease-in-out duration-150 border-2 ${
                    index % 2 === 0 ? "bg-zinc-200" : "bg-gray-300"
                  }`}
                >
                  <td className="py-2 px-4 text-center text-sm md:text-xl">
                    {row.staff_id.substr(0, 10)}
                  </td>
                  <td className="py-2 px-4 text-center text-sm md:text-xl">
                    {row.name} {row.surname}
                  </td>
                  <td className="py-2 px-4 text-center text-sm md:text-xl">
                    {row.nickname}
                  </td>
                  <td className="py-2 px-4 text-center text-sm md:text-xl">
                    {row.permission}
                  </td>
                  {permission === "administrator" && (
                    <td className="py-2 px-4 text-center text-sm md:text-xl">
                      <button
                        onClick={() => handleEditClick(row.staff_id)}
                        className="py-1 px-3 bg-blue-500 text-white rounded"
                      >
                        แก้ไข
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-center w-full">
          <button
            className="py-2 px-4 mx-2 bg-[#003087] text-white rounded"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            ก่อนหน้า
          </button>
          <span className="py-2 px-4 mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            className="py-2 px-4 mx-2 bg-[#003087] text-white rounded"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            ถัดไป
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid">
      <Topbar />
      <div className="flex flex-1 h-[897px]">
        <div className={`flex relative w-72`}>
          <Sidebar />
        </div>
        <Content />
      </div>
    </div>
  );
}
