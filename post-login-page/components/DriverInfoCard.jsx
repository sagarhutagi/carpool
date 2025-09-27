import React from "react";
import { useNavigate } from "react-router-dom";
import "./DriverInfoCard.css"; // we'll create this for styling

function DriverInfoCard({ name, rating, distance, eta, driverId }) {
  const navigate = useNavigate();

  const handleBook = () => {
    // Navigate to post-booking page with driver ID and pass driver data
    navigate(`/booking-confirmed/${driverId}`, {
      state: {
        driverData: {
          id: driverId,
          name: name,
          rating: rating,
          distance: distance,
          eta: eta
        }
      }
    });
  }

  return (
    <div className="driver-card">
      {/* Avatar */}
      <div className="driver-avatar">
        {name.charAt(0)}
      </div>

      {/* Driver Info */}
      <div className="driver-info">
        <div className="driver-header">
          <h2 className="driver-name">{name}</h2>
          <span className="driver-rating">⭐ {rating}</span>
        </div>

        <div className="driver-meta">
          <span>Distance: {distance} km</span>
          <span>ETA: {eta} min</span>
        </div>
      </div>

      {/* Book Button */}
      <button className="driver-book-btn" onClick={handleBook}>Book</button>
    </div>
  );
}

export default DriverInfoCard;
