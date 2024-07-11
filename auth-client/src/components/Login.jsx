import React, { useState, useEffect } from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();

  const token = Cookies.get("access_token");

  useEffect(() => {
    if (token) {
      navigate("/profile");
    }
  }, []);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    // console.log(data);
    setData({ ...data, [e.target.name]: e.target.value });
  };

  // write a function to validate email
  const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    let isValid = re.test(email);
    if (!isValid) {
      alert("Please enter a valid email");
    }
  };

  const handleSubmit = async (e) => {
    //validate if data is not empty and is string
    if (data.email === "" || data.password === "") {
      alert("Please fill in all fields");
      return;
    }

    if (typeof data.email !== "string") {
      alert("Please enter a valid email");
      return;
    }

    e.preventDefault();
    try {
      const response = await axios.post("http://192.168.1.6:8000/login", data, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      // console.log(response.data);
      if (response.status) {
        // alert(response.data.message);
        Cookies.remove("access_token");
        Cookies.set("access_token", response.data.access_token);
        window.location.reload();
        // navigate("/profile");
      }
    } catch (error) {
      console.log(error);
      let message = error.response.data.detail;
      alert(message);
    }
  };

  return (
    <section className="w-full h-dvh flex flex-col justify-center items-center p-6 bg-gray-50">
      <div className="w-full max-w-2xl rounded-lg shadow-2xl shadow-black/10 h-auto border-2 border-gray-200 p-8 bg-white">
        <h1 className="text-3xl font-bold text-gray-600 text-left mb-2">
          Login
        </h1>
        <div className="w-full flex flex-col ">
          <label htmlFor="email" className="mt-3">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border-2 border-gray-300 p-2 rounded-lg my-2"
            onChange={handleChange}
            onBlur={() => validateEmail(data.email)}
          />
          <label htmlFor="password" className="mt-3">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border-2 border-gray-300 p-2 rounded-lg my-2"
            onChange={handleChange}
          />
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-500 text-white font-bold p-2 rounded-lg mt-12 active:scale-[0.98] duration-100"
          >
            Login
          </button>
        </div>
      </div>
    </section>
  );
};

export default Login;
