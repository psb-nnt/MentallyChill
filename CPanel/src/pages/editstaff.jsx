import axios from "../components/axioscreds";
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

export default function EditStaffPage() {
  const { staffId } = useParams();
  const { invalidateStaffList } = useContext(DataContext);
  const [staffData, setStaffData] = useState({
    staff_id: staffId,
    name: "",
    surname: "",
    nickname: "",
    password: "",
    image: "",
    permission: ""
  });

  const [imageURL, setImageURL] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageFile, setImageFile] = useState(null)

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get(`/staff/lookup/${staffId}`);
        setStaffData((prevData) => ({
          ...prevData,
          ...response.data,
          staff_id: staffId, // Ensure staff_id is set
        }));
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };
    

    fetchStaffData();
  }, [staffId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStaffData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const imageURL = URL.createObjectURL(file);
      setImageURL(imageURL);
      setErrorMessage("");
    } else {
      setErrorMessage("โปรดเลือกไฟล์ที่ถูกต้อง");
    }
  };

  const handleChangePassword = async () => {
    if (!staffData.password) return;
  
    try {
      const response = await axios.post('/auth/changepassword', {
        staff_id: staffData.staff_id,
        password: staffData.password,
      });
      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error changing password:', error.response?.data || error.message);
      alert('Failed to change password. Check the console for details.');
    }
  };

  const handleSave = async () => {
    try {
        await handleChangePassword();

        const formData = new FormData();
        formData.append('staff_id', staffData.staff_id);
        formData.append('name', staffData.name);
        formData.append('surname', staffData.surname);
        formData.append('nickname', staffData.nickname);
        formData.append('description', staffData.description);
        formData.append('permission', staffData.permission);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const response = await axios.put(`/staff/update`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        invalidateStaffList();
        alert("Staff data updated successfully!");
        navigate('/stafflist');
    } catch (error) {
        console.error("Error updating staff data:", error.response?.data || error.message);
        alert("Failed to update staff data. Check the console for details.");
    }
};


  const handleCancel = () => {
    navigate('/stafflist');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <div className="flex flex-1 flex-row">
        <div className="flex relative w-72">
          <Sidebar />
        </div>
        <div className="w-full overflow-x-hidden">
          <div className="p-4 md:p-10">
            <h1 className="text-3xl mb-6">แก้ไขข้อมูลพนักงาน</h1>
            <p className="text-3xl mb-6">เลขที่เจ้าหน้าที่: {staffId}</p>
            <div className="mb-4">
              <label
                htmlFor="image"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                รูปภาพเจ้าหน้าที่
              </label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
              />
              {errorMessage && <p className="text-red-500">{errorMessage}</p>}
              {imageURL && (
                <div className="mt-4">
                  <img
                    src={imageURL}
                    alt="Preview"
                    className="h-40 w-40 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">ชื่อ</label>
              <input
                type="text"
                name="name"
                value={staffData.name}
                onChange={handleInputChange}
                className="py-2 px-4 rounded border w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">นามสกุล</label>
              <input
                type="text"
                name="surname"
                value={staffData.surname}
                onChange={handleInputChange}
                className="py-2 px-4 rounded border w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">ชื่อเล่น</label>
              <input
                type="text"
                name="nickname"
                value={staffData.nickname}
                onChange={handleInputChange}
                className="py-2 px-4 rounded border w-full"
              />
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">ตำแหน่ง</label>
              <select
                  name="permission"
                  value={staffData.permission}
                  onChange={handleInputChange}
                  className="py-2 px-4 rounded border w-full"
              >
                <option value="administrator">ผู้ดูแลระบบ</option>
                <option value="staff">เจ้าหน้าที่</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-lg mb-2">รหัสผ่านใหม่</label>
              <input
                type="password"
                name="password"
                value={staffData.password}
                onChange={handleInputChange}
                className="py-2 px-4 rounded border w-full"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="py-2 px-4 bg-blue-500 text-white rounded"
              >
                บันทึก
              </button>
              <button
                onClick={handleCancel}
                className="py-2 px-4 bg-gray-500 text-white rounded"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

