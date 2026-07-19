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
  note,
  setNote,
  con,
  setCon,
  feed,
  setFeed,
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
        <div className="text-5xl mb-10">ประวัติการจอง</div>
        <div className="flex flex-row justify-between mb-10 p-3 bg-[#FFF3C7] border border-[#FFF3C7] border-4 rounded-lg">
          <div className="text-4xl font-semibold">เลขที่การจอง : {bookingId}</div>
          <div className="text-4xl font-semibold">เลขที่ผู้ใช้ : {data.user_id}</div>
        </div>
        <div className="flex flex-col flex-1 bg-[#003087] border border-[#003087] border-4 rounded-lg h-full ">
          <div className="p-4 flex flex-col justify-between h-full">
            <div>
              <div className="flex flex-row justify-between text-2xl font-medium mb-4 text-white">
                <div>หัวข้อ : {data.topic}</div>
                <div className="flex flex-row gap-3">
                  <div>{appointmentDate}</div>
                  <div>{appointmentTime}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 text-2xl font-medium mb-4 pt-3 border-t-4 border-[#FFFFFF] text-white">
                <div>โน้ต</div>
                <div>ความคิดเห็นส่วนตัว</div>
              </div>
              <div className="flex flex-row gap-3 mb-4">
                <div className="w-full">
                  <textarea
                    className="flex w-full h-60 bg-gray-100 break-all p-2 mb-2"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <div className="text-2xl font-medium mb-4 text-white">สรุปผล</div>
                  <textarea
                    className="flex w-full h-16 bg-gray-100 break-all p-2"
                    value={con}
                    onChange={(e) => setCon(e.target.value)}
                  />
                </div>
                <div className="flex w-full justify-end">
                  <textarea
                    className="flex w-full h-full bg-gray-100 break-all p-2"
                    value={feed}
                    onChange={(e) => setFeed(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-row justify-end border-t-4 border-[#FFFFFF] pt-3">
              <div className="flex flex-row justify-between gap-4">
                <button
                  className="bg-[#24DB36] rounded-full px-10 py-2"
                  onClick={() => handleClick("pass")}
                >
                  บันทึก
                </button>
                <button
                  className="bg-[#FF0000] rounded-full px-10 py-2"
                  onClick={() => handleClick("not")}
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const { invalidateAppointments } = useContext(DataContext);
  const [note, setNote] = useState("");
  const [con, setCon] = useState("");
  const [feed, setFeed] = useState("");
  const [status, setStatus] = useState("Pending");
  const { bookingId } = useParams();
  const [alldata, setAlldata] = useState([]);
  const [isInitialLoaded, setIsInitialLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/appointment/lookup/${bookingId}`);
        const data = response.data[0];
        console.log(data, "data");
        console.log(data, "uid");
        setAlldata(data);

        // Load draft or pre-populate from details
        const savedDraft = localStorage.getItem(`booking_draft_${bookingId}`);
        if (savedDraft) {
          try {
            const parsed = JSON.parse(savedDraft);
            setNote(parsed.note || "");
            setCon(parsed.con || "");
            setFeed(parsed.feed || "");
          } catch (e) {
            console.error("Error parsing saved draft:", e);
          }
        } else {
          setNote(data.details || "");
          setCon("");
          setFeed("");
        }
        setIsInitialLoaded(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [bookingId]);

  useEffect(() => {
    if (isInitialLoaded) {
      localStorage.setItem(
        `booking_draft_${bookingId}`,
        JSON.stringify({ note, con, feed })
      );
    }
  }, [note, con, feed, bookingId, isInitialLoaded]);

  useEffect(() => {
    if (status !== "Pending") {
      const postData = async () => {
        try {
          const response = await axios.post(`/appointment/post`, {
            booking_id: bookingId,
            status: status,
            post_note: note,
            post_feedback: feed,
            post_conclusion: con,
          });
          console.log("Response:", response.data);
          if (status === "complete") {
            localStorage.removeItem(`booking_draft_${bookingId}`);
          }
          invalidateAppointments();
          navigate("/bookinginfo");
        } catch (error) {
          console.error("Error:", error);
        }
      };

      postData();
    }
  }, [status, bookingId, navigate, note, feed, con]);

  const handleClick = (stat) => {
    switch (stat) {
      case "pass":
        setStatus("complete");
        break;
      case "not":
        setStatus("feedback");
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
            note={note}
            setNote={setNote}
            con={con}
            setCon={setCon}
            feed={feed}
            setFeed={setFeed}
            bookingId={bookingId}
            status={status}
            data={alldata}
          />
        </div>
      </div>
    </>
  );
}
