import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-bold">Welcome to Carpool 🚗</h1>
      <Link to="/main" className="text-blue-500 mt-4 inline-block">
        Go to Main Page
      </Link>
    </div>
  );
}
