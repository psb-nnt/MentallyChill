import axios from "../components/axioscreds";
import { useEffect, useState, useRef } from "react";
import Dropdown from "../components/dropdown";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";
import ExportButton from "../components/exportbutton";
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;
import { useLocation } from "react-router-dom";


export default function DiagnosisPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFormType, setSelectedFormType] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [data, setData] = useState([]);
  const [formTypeData, setFormTypeData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userIdFromQuery = queryParams.get("user_id");

  const searchInputRef = useRef(null);

  const formtypeList = formTypeData.map((item) => item.forms_type);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/forms/all`);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchform = async () => {
      try {
        const response = await axios.get(`/forms/type`);
        setFormTypeData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchform();
    fetchData();
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (userIdFromQuery) {
      setSearchTerm(userIdFromQuery);
    }
  }, [userIdFromQuery]);

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

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const exporttocsv = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedFormType) params.append("forms_type", selectedFormType);
      if (searchTerm) params.append("user_id", searchTerm);
      if (dateRange && dateRange[0]) {
        params.append("startDate", dateRange[0].toISOString());
      }
      if (dateRange && dateRange[1]) {
        params.append("endDate", dateRange[1].toISOString());
      }

      const response = await axios.get(`/export/exportformResult?${params.toString()}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "result.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const getResultCategory = (d, a, s) => {
    const dCategory = d <= 6 ? "ปกติ" : d <= 13 ? "ปานกลาง" : "ร้ายแรง";
    const aCategory = a <= 5 ? "ปกติ" : a <= 9 ? "ปานกลาง" : "ร้ายแรง";
    const sCategory = s <= 9 ? "ปกติ" : s <= 16 ? "ปานกลาง" : "ร้ายแรง";

    const categories = [dCategory, aCategory, sCategory];
    if (categories.includes("ร้ายแรง")) return "ร้ายแรง";
    if (categories.includes("ปานกลาง")) return "ปานกลาง";
    return "ปกติ";
  };

  const getMonthOptions = () => {
    const options = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    for (let i = 0; i < 12; i++) {
      let month = currentMonth - i;
      let year = currentYear;

      if (month <= 0) {
        month += 12;
        year -= 1;
      }

      const monthStr = month.toString().padStart(2, "0");
      const monthValue = `${year}-${monthStr}`;

      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];

      options.push(`${thaiMonths[month - 1]} ${year}`);
    }

    return options;
  };

  const monthOptions = getMonthOptions();

  const sortedData = data.sort((a, b) => {
    const dateA = new Date(a.created);
    const dateB = new Date(b.created);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const filteredData = sortedData.filter((item) => {
    const resultCategory = item.result
      ? getResultCategory(item.result.d, item.result.a, item.result.s)
      : "";

    let monthMatch = true;
    if (selectedMonth) {
      const itemDate = new Date(item.created);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;

      const thaiMonths = [
        "มกราคม",
        "กุมภาพันธ์",
        "มีนาคม",
        "เมษายน",
        "พฤษภาคม",
        "มิถุนายน",
        "กรกฎาคม",
        "สิงหาคม",
        "กันยายน",
        "ตุลาคม",
        "พฤศจิกายน",
        "ธันวาคม",
      ];

      const [monthName, yearStr] = selectedMonth.split(" ");
      const selectedMonthIndex = thaiMonths.indexOf(monthName) + 1;
      const selectedYear = parseInt(yearStr);

      monthMatch =
        itemYear === selectedYear && itemMonth === selectedMonthIndex;
    }

    let dateMatch = true;
    if (dateRange && dateRange[0]) {
      const itemDate = new Date(item.created);
      const startDate = dateRange[0].startOf('day').toDate();
      if (dateRange[1]) {
        const endDate = dateRange[1].endOf('day').toDate();
        dateMatch = itemDate >= startDate && itemDate <= endDate;
      } else {
        // No end date means "Till Now" (everything from startDate onwards)
        dateMatch = itemDate >= startDate;
      }
    }

    return (
      (selectedFormType ? item.forms_type === selectedFormType : true) &&
      (searchTerm ? item.user_id.toLowerCase() === searchTerm.trim().toLowerCase() : true) &&
      monthMatch &&
      dateMatch
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

  const handleSelectLocation = (option) => {
    setSelectedFormType(option);
    setCurrentPage(1);
  };

  const handleSelectMonth = (option) => {
    setSelectedMonth(option);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedFormType("");
    setSelectedMonth("");
    setDateRange(null);
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
    setCurrentPage(1);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Content = () => {
    return (
      <div className="flex flex-col flex-1 p-4 md:p-10 relative">
        <div className="flex flex-col md:flex-row gap-6 mb-6 text-center items-center">
          <h1 className="text-3xl md:text-5xl">ผลการประเมิน</h1>
          <ExportButton onClick={exporttocsv} />
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-10 items-start md:items-center">
          <h2 className="text-2xl md:text-4xl mb-2 md:mb-0">ตัวกรอง : </h2>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <Dropdown
              placehold={"ประเภทแบบฟอร์ม"}
              options={formtypeList}
              onSelect={handleSelectLocation}
              selected={selectedFormType}
            />

            {/* <Dropdown
              placehold={"เดือน"}
              options={monthOptions}
              onSelect={handleSelectMonth}
              selected={selectedMonth}
            />*/}
            <RangePicker
              placeholder={['วันที่เริ่ม', 'จนถึงวันนี้']}
              allowEmpty={[false, true]}
              value={dateRange}
              size={"large"}
              onChange={(dates) => {
                setDateRange(dates);
                setCurrentPage(1);
              }}
            />
            <button
              className="py-2 px-4 bg-red-500 text-white rounded w-full md:w-auto"
              onClick={clearAllFilters}
            >
              ล้างการกรอง
            </button>
          </div>
          <input
            type="search"
            placeholder="ค้นหาโดยเลขที่ผู้ใช้"
            onChange={handleSearchTermChange}
            value={searchTerm}
            ref={searchInputRef}
            className="py-2 px-4 rounded border w-full md:w-auto md:ml-auto"
          />
        </div>
        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[#003087] text-white">
                  <th className="py-2 px-4 text-lg md:text-3xl text-center rounded-tl-xl">
                    วันที่
                    <button
                      onClick={toggleSortOrder}
                      className="ml-2 py-1 px-2 bg-gray-300 text-black rounded text-sm md:text-2xl"
                    >
                      {sortOrder === "asc" ? "▲" : "▼"}
                    </button>
                  </th>
                  <th className="py-2 px-4 text-lg md:text-3xl text-center">
                    ประเภทแบบฟอร์ม
                  </th>
                  <th className="py-2 px-4 text-lg md:text-3xl text-center">
                    ผลการประเมิน
                  </th>
                  <th className="py-2 px-4 text-lg md:text-3xl text-center rounded-tr-xl">
                    เลขที่ผู้ใช้
                  </th>
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
                      {row.created.substr(0, 10)}
                    </td>
                    <td className="py-2 px-4 text-center text-sm md:text-xl">
                      {row.forms_type}
                    </td>
                    <td className="py-2 px-4 text-center text-sm md:text-xl">
                      {row.forms_type === "dass21" ? (
                        row.result
                          ? `${getResultCategory(row.result.d, row.result.a, row.result.s)} (D: ${row.result.d} A: ${row.result.a} S: ${row.result.s})`
                          : "null"
                      ) : row.forms_type === "burnout" ? (
                        row.result && row.result.scores
                          ? `ความอ่อนล้าทางอารมณ์ : ${row.result.scores.emotionalScore}, การลดความเป็นบุคคล : ${row.result.scores.depersonalizationScore}, ความสำเร็จส่วนบุคคล : ${row.result.scores.personalAchievementScore}`
                          : "null"
                      ) : row.forms_type === "2q" ? (
                        row.result
                          ? `เศร้า/หดหู่/ท้อแท้ ในช่วง 2 สัปดาห์: ${row.result.q1 ? "ใช่" : "ไม่ใช่"} | เบื่อ/ไม่เพลิดเพลิน ในช่วง 2 สัปดาห์: ${row.result.q2 ? "ใช่" : "ไม่ใช่"}`
                          : "null"
                      ) : row.forms_type === "rq" ? (
                        row.result
                          ? `ความอดทนทางอารมณ์: ${row.result.emotionalEndurance}, กำลังใจ: ${row.result.encouragement}, การจัดการปัญหา: ${row.result.problemManagement}`
                          : "null"
                      ) : (
                        row.result ? row.result.scores : "null"
                      )}
                    </td>
                    <td className="py-2 px-4 text-center text-sm md:text-xl">
                      {row.user_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mt-6 text-center">
              <div className="py-10 px-4 bg-gray-100 rounded-md border border-gray-300">
                <p className="text-2xl text-gray-600">ไม่พบข้อมูล</p>
              </div>
            </div>
          )}
        </div>
        {filteredData.length > 0 && (
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
        )}
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
