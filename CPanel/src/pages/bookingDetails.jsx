import axios from "../components/axioscreds";
import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

const formatTimeWithOffset = (dateString, offsetHours) => {
  const date = new Date(dateString);
  date.setHours(date.getHours() + offsetHours);
  return date.toISOString().substring(11, 16);
};
const Content = ({
  handleClick,
  reasonNote,
  setReasonNote,
  handleSubmit,
  bookingId,
  data,
}) => {
  const appointmentDate = data.appointment_date
    ? data.appointment_date.substring(0, 10)
    : "Not available";

  const appointmentTime = data.appointment_date
    ? formatTimeWithOffset(data.appointment_date, 7)
    : "Not available";

  return (
    <>
      <div className="flex flex-col flex-1 m-10">
        <div className="text-5xl mb-10">รายละเอียดการจอง</div>
        <div className="flex flex-row justify-between mb-10 p-3 bg-[#FFF3C7] border border-[#FFF3C7] border-4 rounded-lg">
          <div className="text-4xl font-semibold">เลขที่การจอง : {bookingId}</div>
          <div className="text-4xl font-semibold">เลขที่ผู้ใช้ : {data.user_id}</div>
        </div>
        <div className="flex flex-col flex-1 bg-[#003087] border border-[#003087] border-4 rounded-lg h-full ">
          <div className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-row justify-between text-2xl font-medium mb-4 text-white">
                <div>ผู้ให้คำปรึกษาที่ต้องการพบ : {data.staff_id} </div>
                <div>{appointmentDate}</div>
              </div>
              <div className="flex flex-row justify-between text-2xl font-medium mb-4 text-white">
                <div>หัวข้อ : {data.topic}</div>
                <div>{appointmentTime}</div>
              </div>
              <div className="flex flex-row gap-3 mb-4">
                <div className="w-full h-full">
                  <div className="text-2xl font-medium mb-4 text-white">
                    เรื่องที่ขอรับการปรึกษา :
                  </div>
                  <div className="flex w-full h-60 bg-stone-300 break-all p-2 overflow-y-auto">
                    {data.details}
                  </div>
                </div>
                <div className="w-full">
                  <div className="text-2xl font-medium mb-4 text-white">
                    ประวัติการปรึกษาแพทย์ :
                  </div>
                  <div className="flex w-full h-60 bg-stone-300 break-all p-2 overflow-y-auto">
                    {data.medical_history}
                  </div>
                </div>
                <div className="w-full">
                  <div className="text-2xl font-medium mb-4 text-white">โน้ต :</div>
                  <form onSubmit={handleSubmit}>
                    <textarea
                      className="flex w-full h-60 bg-gray-100 break-all p-2 overflow-y-auto"
                      value={reasonNote}
                      onChange={(e) => setReasonNote(e.target.value)}
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-between border-t-4 border-[#FFFFFF] pt-3">
              <div className="text-2xl font-medium text-white">
                หมายเลขโทรศัพท์ติดต่อ : {data.contact}
              </div>
              <div className="flex flex-row justify-between gap-4">
                <button
                  className="bg-[#24DB36] rounded-full px-10 py-2"
                  onClick={() => handleClick("Feedback")}
                >
                  ยืนยัน
                </button>
                <button
                  className="bg-stone-500 rounded-full px-10 py-2 text-white"
                  onClick={() => handleClick("Declined")}
                >
                  ปฏิเสธ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function BookingDetailsPage() {
  const navigate = useNavigate();
  const { invalidateAppointments } = useContext(DataContext);
  const [status, setStatus] = useState("Pending");
  const [reasonNote, setReasonNote] = useState("");
  const { bookingId } = useParams();
  const [alldata, setAlldata] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/appointment/lookup/${bookingId}`);
        const data = response.data[0];
        console.log(data, "data");
        console.log(data, "uid");
        setAlldata(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [bookingId]);

  useEffect(() => {
    if (status !== "Pending") {
      const postData = async () => {
        try {
          const response = await axios.post(`/appointment/respond`, {
            booking_id: bookingId,
            status: status,
            pre_note: reasonNote,
          });
          console.log("Response:", response.data);
          invalidateAppointments();
          navigate("/bookinginfo");
        } catch (error) {
          console.error("Error:", error);
        }
      };

      postData();
    }
  }, [status, bookingId, reasonNote, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const noted = {
      reasonNote: reasonNote,
    };

    console.log(noted);
  };

  const handleClick = (stat) => {
    switch (stat) {
      case "Feedback":
        console.log("Feedback");
        setStatus("feedback");
        break;
      case "Declined":
        console.log("Declined");
        setStatus("decline");
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="flex flex-col flex-1 h-dvh">
        <Topbar />
        <div className="flex flex-row flex-1">
          <div className="flex relative w-72">
            <Sidebar />
          </div>
          <Content
            handleClick={handleClick}
            reasonNote={reasonNote}
            setReasonNote={setReasonNote}
            handleSubmit={handleSubmit}
            bookingId={bookingId}
            status={status}
            data={alldata}
          />
        </div>
      </div>
    </>
  );
}
