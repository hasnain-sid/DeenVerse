import React, { useState } from "react";
import {
  FaHome,
  FaUser,
  FaCog,
  FaBell,
  FaEnvelope,
  FaChartBar,
} from "react-icons/fa";

const IconGrid = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Main Icon */}
      <button
        onClick={handleToggle}
        className="bg-gray-300 p-4 rounded-full shadow-lg focus:outline-none hover:bg-gray-400 transition"
      >
        <FaHome className="text-2xl text-gray-700" />
      </button>

      {/* Icon Grid (shown on click) */}
      {isOpen && (
        <div className="absolute top-16 bg-white shadow-lg rounded-lg p-4 grid grid-cols-3 gap-6 w-40 mt-2 border border-gray-200">
          <button className="flex justify-center items-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <FaUser className="text-xl text-gray-600" />
          </button>
          <button className="flex justify-center items-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <FaCog className="text-xl text-gray-600" />
          </button>
          <button className="flex justify-center items-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <FaBell className="text-xl text-gray-600" />
          </button>
          <button className="flex justify-center items-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <FaEnvelope className="text-xl text-gray-600" />
          </button>
          <button className="flex justify-center items-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
            <FaChartBar className="text-xl text-gray-600" />
          </button>
          {/* Add more icons as needed */}
        </div>
      )}
    </div>
  );
};

export default IconGrid;
