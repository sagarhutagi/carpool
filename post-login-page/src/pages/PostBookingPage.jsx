import { useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { io } from 'socket.io-client' // <-- Correct import
const socket = io('http://localhost:5000');

function PostBookingPage() {
  const { driverId } = useParams();
  const location = useLocation();

  const userName = "Aayush";
  
  // Get driver data passed from the previous page (if available)
  const driverData = location.state?.driverData;

  useEffect(() => {
    // Request to backend API to confirm booking (if needed)

    // Connecting to the socket
    socket.emit('joinRoom', {"roomName": driverId, "userName": userName}); // Join room with driver ID

    // Listen for driver messages
    socket.on('driver-message', (message) => {
      console.log('Received driver message:', message);
    });

    // Cleanup function to remove listener when component unmounts
    return () => {
      socket.off('driver-message');
    };
  }, [driverId, userName]);

  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'sans-serif',
      backgroundImage: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Success Icon */}
        <div style={{
          fontSize: '4rem',
          marginBottom: '1rem'
        }}>
          ✅
        </div>

        {/* Main Message */}
        <h1 style={{
          fontSize: '2.5rem',
          marginBottom: '1rem',
          color: '#28a745',
          fontWeight: 'bold'
        }}>
          Booking Confirmed!
        </h1>

        {/* Driver ID Display */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '2px dashed #28a745'
        }}>
          <h3 style={{
            color: '#495057',
            marginBottom: '0.5rem',
            fontSize: '1.2rem'
          }}>
            Driver ID:
          </h3>
          <p style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#28a745',
            fontFamily: 'monospace',
            margin: 0
          }}>
            {driverId || 'N/A'}
          </p>
        </div>

        {/* Additional Driver Info (if available) */}
        {driverData && (
          <div style={{
            backgroundColor: '#e8f5e8',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            <h4 style={{ color: '#235c96ff', marginBottom: '1rem' }}>Driver Details:</h4>
            <p><strong>Name:</strong> {driverData.name || 'N/A'}</p>
            <p><strong>Rating:</strong> {driverData.rating ? `${driverData.rating} ⭐` : 'N/A'}</p>
            <p><strong>Distance:</strong> {driverData.distance || 'N/A'}</p>
            <p><strong>ETA:</strong> {driverData.eta || 'N/A'}</p>
          </div>
        )}

        {/* Success Message */}
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Your ride has been successfully booked! The driver will be notified and will contact you shortly.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            to="/passenger" 
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(0,123,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🔍 Find Another Ride
          </Link>
          
          <Link 
            to="/" 
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(108,117,125,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🏠 Go Home
          </Link>
        </div>

        {/* Contact Info */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: '#856404'
          }}>
            💡 <strong>Tip:</strong> Keep this page open or save the driver ID for reference. 
            You can contact support if needed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PostBookingPage;