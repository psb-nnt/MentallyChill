import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { DataContext } from '../context/DataContext';
import { IoChatboxEllipsesSharp } from 'react-icons/io5';
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank, MdOutlineIndeterminateCheckBox } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/dropdown';
import Sidebar from '../components/sidebar';
import Topbar from '../components/topbar';
import Modal from '../components/rebook';
import ExportButton from '../components/exportbutton';

export default function BookingInfoPage() {
  const navigate = useNavigate();
  const { getAppointments } = useContext(DataContext);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [topicData, setTopicData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const topicList = topicData.map((item) => item.topic);

  const searchInputRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

      const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ];

      options.push(`${thaiMonths[month - 1]} ${year}`);
    }

    return options;
  };

  const monthOptions = getMonthOptions();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsData = await getAppointments();
        setData(appointmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchtopic = async () => {
      try {
        const response = await axios.get(`/appointment/topic`);
        setTopicData(response.data);
      } catch (error) {
        console.error('Error fetching topic data:', error);
      }
    };

    fetchData();
    fetchtopic();
  }, []);

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

  const statusOptions = [
    { label: 'รอการยืนยัน', value: 'pending' },
    { label: 'รอการสรุปผล', value: 'feedback' },
    { label: 'เสร็จสิ้น', value: 'complete' },
    { label: 'ปฏิเสธ', value: 'decline' },
  ];

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm]);

  const handleSelectTopic = (option) => {
    setSelectedTopic(option);
    setCurrentPage(1);
  };

  const handleSelectStatus = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
  };

  const handleSelectMonth = (option) => {
    setSelectedMonth(option);
    setCurrentPage(1);
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedTopic('');
    setSelectedStatus('');
    setSelectedMonth('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <MdOutlineCheckBoxOutlineBlank className="bg-amber-300" />;
      case 'feedback':
        return <IoChatboxEllipsesSharp className="bg-violet-400" />;
      case 'decline':
        return <MdOutlineIndeterminateCheckBox className="bg-red-400" />;
      case 'complete':
        return <MdOutlineCheckBox className="bg-green-400" />;
      default:
        return null;
    }
  };

  const filteredData = data.filter((item) => {
    let monthMatch = true;
    if (selectedMonth) {
      const itemDate = new Date(item.appointment_date);
      const itemYear = itemDate.getFullYear();
      const itemMonth = itemDate.getMonth() + 1;

      const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
      ];

      const [monthName, yearStr] = selectedMonth.split(' ');
      const selectedMonthIndex = thaiMonths.indexOf(monthName) + 1;
      const selectedYear = parseInt(yearStr);

      monthMatch = (itemYear === selectedYear && itemMonth === selectedMonthIndex);
    }

    return (
      (selectedTopic ? item.topic === selectedTopic : true) &&
      (selectedStatus ? item.status === selectedStatus : true) &&
      (searchTerm ? item.user_id.includes(searchTerm.toLowerCase()) : true) &&
      monthMatch
    );
  });

  const exporttocsv = async () => {
    try {
      const response = await axios.get('/export/exportAppointment', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'appointment.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

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

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCurrentUserId(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const Content = () => {
    const gotoDetail = (status, bookingId) => {
      if (status === 'pending') {
        navigate(`/bookingdetails/${bookingId}`);
      } else if (status === 'feedback') {
        navigate(`/bookinghistory/${bookingId}`);
      } else if (status === 'complete') {
        navigate(`/bookinghistorydone/${bookingId}`);
      }
    };

    const handleRebook = (event, userId) => {
      event.stopPropagation();
      setCurrentUserId(userId);
      setIsModalOpen(true);
    };
    const formatTimeWithOffset = (dateString, offsetHours) => {
      const date = new Date(dateString);
      date.setHours(date.getHours() + offsetHours);
      return date.toISOString().substring(11, 16);
    };

    return (
      <div className="flex flex-col flex-1 p-4 md:p-10 relative w-full">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="w-full lg:w-3/5">
              <div className='flex flex-col md:flex-row gap-6 mb-6 items-center'>
                <h1 className="text-3xl md:text-5xl">การจอง</h1>
                <ExportButton onClick={exporttocsv} />
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <h2 className="text-2xl md:text-3xl">Filter:</h2>
                  <div className="flex flex-wrap gap-4">
                    <Dropdown
                      placehold={'หัวข้อ'}
                      options={topicList}
                      onSelect={handleSelectTopic}
                      selected={selectedTopic}
                    />
                    <Dropdown
                      placehold={'สถานะ'}
                      options={statusOptions.map(option => option.label)}
                      onSelect={(option) => handleSelectStatus(statusOptions.find(status => status.label === option).value)}
                      selected={statusOptions.find((opt) => opt.value === selectedStatus)?.label || ''}
                    />
                    <Dropdown
                      placehold={'เดือน'}
                      options={monthOptions}
                      onSelect={handleSelectMonth}
                      selected={selectedMonth}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <input
                    type="search"
                    placeholder="ค้นหาโดยเลขที่ผู้ใช้"
                    onChange={handleSearchTermChange}
                    value={searchTerm}
                    ref={searchInputRef}
                    className="py-2 px-4 rounded border flex-grow"
                  />
                  <button
                    className="py-2 px-4 bg-red-500 rounded text-white"
                    onClick={clearAllFilters}
                  >
                    ล้างการกรอง
                  </button>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-2/5 p-4 bg-gray-100 rounded-lg">
              <h3 className="text-xl mb-3 font-medium">สถานะการจอง</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MdOutlineCheckBoxOutlineBlank className="text-xl md:text-2xl bg-amber-300" />
                  <span>รอการยืนยัน</span>
                </div>
                <div className="flex items-center gap-2">
                  <IoChatboxEllipsesSharp className="text-xl md:text-2xl bg-violet-400" />
                  <span>รอการสรุปผล</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdOutlineCheckBox className="text-xl md:text-2xl bg-green-400" />
                  <span>เสร็จสิ้น</span>
                </div>
                <div className="flex items-center gap-2">
                  <MdOutlineIndeterminateCheckBox className="text-xl md:text-2xl bg-red-400" />
                  <span>ปฏิเสธ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          {filteredData.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="bg-[#003087] text-white">
                  <th className="py-2 px-4 text-lg md:text-2xl text-center rounded-tl-xl">สถานะ</th>
                  <th className="py-2 px-4 text-lg md:text-2xl text-center">วันที่</th>
                  <th className="py-2 px-4 text-lg md:text-2xl text-center">หัวข้อ</th>
                  <th className="py-2 px-4 text-lg md:text-2xl text-center">เวลา</th>
                  <th className="py-2 px-4 text-lg md:text-2xl text-center">เลขที่ผู้ใช้</th>
                  <th className="py-2 px-4 text-lg md:text-2xl text-center">เลขที่การจอง</th>
                  <th className="py-2 px-4 text-lg md:text-2xl text-center rounded-tr-xl">จองอีกครั้ง</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row, index) => (
                  <tr
                    key={index}
                    className={`transition ease-in-out duration-150 border-2 ${
                      index % 2 === 0 ? 'bg-zinc-200' : 'bg-gray-300'
                    } ${
                      row.status === 'decline'
                        ? 'hover:cursor-default'
                        : 'hover:bg-gray-500 hover:text-white hover:cursor-pointer'
                    }`}
                    onClick={() => gotoDetail(row.status, row.booking_id)}
                  >
                    <td className="pl-4 md:pl-24 text-center text-xl md:text-3xl">{getStatusIcon(row.status)}</td>
                    <td className="py-1.5 text-center text-sm md:text-xl">{row.appointment_date.substring(0, 10)}</td>
                    <td className="py-1.5 px-4 text-center text-sm md:text-xl">{row.topic}</td>
                    <td className="py-1.5 px-4 text-center text-sm md:text-xl">{formatTimeWithOffset(row.appointment_date, 7)}</td>
                    <td className="py-1.5 px-4 text-center text-sm md:text-xl">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/diagnosis?user_id=${row.user_id}`);
                        }}
                        className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200 ease-in-out z-100"
                      >
                        {row.user_id}
                      </button>
                    </td>
                    <td className="py-1.5 px-4 text-center text-sm md:text-xl">{row.booking_id}</td>
                    <td className="py-1 px-4 text-center text-xs md:text-md">
                      {row.status === 'complete' && (
                        <button
                          onClick={(event) => handleRebook(event, row.user_id)}
                          className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-200 ease-in-out"
                        >
                          จองอีกครั้ง
                        </button>
                      )}
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
    <div className="grid min-h-screen">
      <Topbar />
      <div className="flex flex-1 h-[897px]">
        <div className={`flex relative w-72`}>
          <Sidebar />
        </div>
        <Content />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={() => {
          setIsModalOpen(false);
          setCurrentPage(1);
        }}
        userId={currentUserId}
        topicData="นัดหมายเพิ่มเติม"
        statusdata="pending"
      />
    </div>
  );
}