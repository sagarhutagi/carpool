import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

function PostAvailablePage() {
    const { driverId } = useParams();
    const location = useLocation();

    // Get driver data passed from the previous page (if available)
    const driverData = location.state?.driverData;

    // State for Found Users text box
    const [foundUsersText, setFoundUsersText] = useState('');

    useEffect(() => {
        let socket;
        let periodicMessageInterval;

        const connect = async () => {
            try {
                // Use data passed from DriverPage or URL params
                const lat = driverData?.location?.split(',')[0]?.trim() || '0';
                const lng = driverData?.location?.split(',')[1]?.trim() || '0';
                const dlat = driverData?.destinationLat || '0';
                const dlng = driverData?.destinationLng || '0';
                const tocollege = driverData?.tocollege || 'true';

                const url = `http://localhost:3000/driver/available?tocollege=${tocollege}&lat=${lat}&lng=${lng}&dlat=${dlat}&dlng=${dlng}`;

                const data = await (await fetch(url)).json();
                console.log('Driver available response:', data);

                // Initialize socket connection
                socket = io('http://localhost:5000');

                socket.on('connect', () => {
                    console.log('Socket connected:', socket.id);
                    
                    // Join the driver's room
                    socket.emit('joinRoom', { "roomName": driverId });
                    console.log(`Driver ${driverId} joined room`);

                    // Set up periodic messaging every 3 seconds
                    periodicMessageInterval = setInterval(() => {
                        const message = {
                            type: 'driver_status',
                            driverId: driverId,
                            location: driverData?.location || 'Unknown',
                            destination: driverData?.destination || 'Unknown',
                            timestamp: new Date().toISOString(),
                            status: 'available',
                            roomName: driverId
                        };
                        
                        socket.emit('driver_message', message);
                        console.log('Periodic message sent:', message);
                        
                        // Update the Found Users text box with the message
                        // setFoundUsersText(prev => 
                        //     prev + `[${new Date().toLocaleTimeString()}] Status update sent: Driver ${driverId} is available\n`
                        // );
                    }, 3000);
                });

                // Listen for messages from passengers or other events
                socket.on('passenger_message', (data) => {
                    console.log('Received passenger message:', data);
                    setFoundUsersText(prev => 
                        prev + `[${new Date().toLocaleTimeString()}] Passenger message: ${JSON.stringify(data)}\n`
                    );
                });

                // Test listener for communication
                socket.on('test_communication', (data) => {
                    console.log('Test communication received:', data);
                    setFoundUsersText(prev => 
                        prev + `[${new Date().toLocaleTimeString()}] Test: ${JSON.stringify(data)}\n`
                    );
                });

            } catch (error) {
                console.error('Error going online:', error);
            }
        };

        // Only make API call if we have driver data
        if (driverId && driverData) {
            connect();
        }

        // Cleanup function
        return () => {
            if (periodicMessageInterval) {
                clearInterval(periodicMessageInterval);
            }
            if (socket) {
                socket.emit('driver_offline', driverId);
                socket.disconnect();
            }
        };
    }, [driverId, driverData]);



    return (
        <div style={{
            minHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: 'sans-serif',
            backgroundImage: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)'
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
                    🚗
                </div>

                {/* Main Message */}
                <h1 style={{
                    fontSize: '2.5rem',
                    marginBottom: '1rem',
                    color: '#007bff',
                    fontWeight: 'bold'
                }}>
                    You're Now Online!
                </h1>

                {/* Driver ID Display */}
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    marginBottom: '2rem',
                    border: '2px dashed #007bff'
                }}>
                    <h3 style={{
                        color: '#495057',
                        marginBottom: '0.5rem',
                        fontSize: '1.2rem'
                    }}>
                        Your Driver ID:
                    </h3>
                    <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: '#007bff',
                        fontFamily: 'monospace',
                        margin: 0
                    }}>
                        {driverId || 'N/A'}
                    </p>
                </div>

                {/* Additional Driver Info (if available) */}
                {driverData && (
                    <div style={{
                        backgroundColor: '#e7f3ff',
                        padding: '1.5rem',
                        borderRadius: '10px',
                        marginBottom: '2rem',
                        textAlign: 'left',
                        color: '#495057'
                    }}>
                        <h4 style={{ color: '#495057', marginBottom: '1rem' }}>Your Location & Destination:</h4>
                        <p><strong>Current Location:</strong> {driverData.location || 'Getting location...'}</p>
                        <p><strong>Destination:</strong> {driverData.destination || 'Not set'}</p>
                        <p><strong>Going to College:</strong> {driverData.tocollege ? 'Yes ✅' : 'No ❌'}</p>
                        <p><strong>Room ID:</strong> {driverData.roomId || 'N/A'}</p>
                    </div>
                )}


                {/* Status Message */}
                <div style={{
                    backgroundColor: '#d4edda',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    marginBottom: '2rem',
                    border: '1px solid #c3e6cb'
                }}>
                    <h4 style={{
                        color: '#155724',
                        marginBottom: '0.5rem',
                        fontSize: '1.2rem'
                    }}>
                        🟢 Status: Available for Rides
                    </h4>
                    <p style={{
                        color: '#155724',
                        margin: 0,
                        fontSize: '1rem'
                    }}>
                        Passengers can now see and book rides with you!
                    </p>
                </div>

                {/* Information Message */}
                <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>
                    You're now accepting ride requests. Passengers looking for rides to your destination can find and book you.
                </p>

                {/* Found Users Section */}
                <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    marginBottom: '2rem',
                    textAlign: 'left'
                }}>
                    <h3 style={{
                        color: '#495057',
                        marginBottom: '1rem',
                        fontSize: '1.3rem',
                        textAlign: 'center'
                    }}>
                        Found Users:
                    </h3>
                    <textarea
                        value={foundUsersText}
                        placeholder="Users looking for rides will appear here..."
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            padding: '1rem',
                            fontSize: '1rem',
                            border: '2px solid #e1e5e9',
                            borderRadius: '8px',
                            outline: 'none',
                            resize: 'vertical',
                            fontFamily: 'sans-serif',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#e1e5e9'}
                    />
                </div>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <Link
                        to="/driver"
                        style={{
                            display: 'inline-block',
                            padding: '1rem 2rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '10px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 10px 20px rgba(220,53,69,0.3)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        📱 Go to Dashboard
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

                {/* Tips Section */}
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
                        💡 <strong>Tips:</strong> Keep your phone nearby to receive booking notifications.
                        You can update your availability anytime from the dashboard.
                    </p>
                </div>

                {/* Real-time Status */}
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#28a745'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#28a745',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}></div>
                    <span>Live & Receiving Requests</span>
                </div>

                <style>
                    {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}
                </style>
            </div>
        </div>
    );
}

export default PostAvailablePage;