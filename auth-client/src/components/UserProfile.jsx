import React, { useState, useEffect } from "react";

import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const token = Cookies.get("access_token");

  if (!token) {
    navigate("/login", { replace: true });
  }

  const fetchData = async () => {
    try {
      const response = await axios.post(
        "http://192.168.1.6:8000/get-user-from-token",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response);
      if (response.status) {
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, []);

  return (
    <section className="w-full h-dvh flex flex-col justify-center items-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl rounded-lg shadow-2xl shadow-black/10 h-auto border-2 border-gray-200 p-8 bg-white">
        <h1 className="text-3xl font-bold text-gray-600 text-left mb-4">
          User Info
        </h1>

        {data && (
          <div>
            <p className="text-xl font-bold text-gray-600 mb-2">
              ID: {data.id}
            </p>
            <p className="text-xl font-bold text-gray-600 mb-2">
              Name: {data.name}
            </p>
            <p className="text-xl font-bold text-gray-600 mb-2">
              Email: {data.email}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            Cookies.remove("access_token");
            window.location.reload();
          }}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Log Out
        </button>
      </div>
    </section>
  );
};

export default UserProfile;
