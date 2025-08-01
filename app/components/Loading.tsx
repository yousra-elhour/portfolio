import { motion } from "framer-motion";
import React from "react";

interface LoadingProps {
  loadingPercentage: number;
}

const Loading: React.FC<LoadingProps> = ({ loadingPercentage }) => {
  return (
    <div
      className="w-full h-screen flex justify-center items-center"
      style={{ backgroundColor: "#87CEEB" }}
    >
      <div className="text-white text-4xl flex-col text-center">
        <h1>{`${loadingPercentage.toFixed(2)}%`}</h1>
        <div className="w-64 mt-4">
          <motion.div
            className="h-2 bg-sky-600 rounded-md"
            style={{ width: `${loadingPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Loading;
