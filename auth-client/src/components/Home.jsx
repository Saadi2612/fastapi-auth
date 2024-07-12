import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex justify-center items-center w-full h-dvh bg-white">
      <div className="border-2 border-gray-200 p-6 w-full max-w-2xl rounded-lg bg-white shadow-2xl shadow-black/10">
        <h1 className="text-gray-500 text-2xl font-bold text-center">
          FastAPI Auth App
        </h1>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <Link to={"/login"} className="w-full">
            <button className="w-full bg-indigo-500 text-white font-bold py-2 px-4 rounded active:scale-[0.98] duration-100">
              Login
            </button>
          </Link>
          <Link to={"/register"} className="w-full">
            <button className="w-full bg-white text-indigo-500 font-bold py-2 px-4 rounded border border-indigo-500 active:scale-[0.98] duration-100">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
