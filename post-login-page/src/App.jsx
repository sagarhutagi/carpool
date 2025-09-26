import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PassengerPage from './pages/PassengerPage';
import DriverPage from './pages/DriverPage';
import './App.css';


function App() {
  return (
    <Router>
      <div className="app">
        {/* Navigation Header */}
        <nav style={{
          backgroundColor: '#2563eb',
          padding: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '1.5rem'
            }}>
              🚗 Carpool App
            </h1>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link 
                to="/passenger" 
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                🧑‍💼 Passenger
              </Link>
              <Link 
                to="/driver" 
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
              >
                🚗 Driver
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/passenger" element={<PassengerPage />} />
          <Route path="/driver" element={<DriverPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Simple home page component
function HomePage() {
  return (
    <div style={{
      minHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem',
      backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        maxWidth: '600px'
      }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1rem',
          color: '#333'
        }}>
          🚗 Welcome to Carpool
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          marginBottom: '2rem',
          lineHeight: '1.6'
        }}>
          Connect with drivers and passengers for convenient, eco-friendly rides
        </p>
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
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(37,99,235,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🧑‍💼 I need a ride
          </Link>
          <Link 
            to="/driver" 
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              backgroundColor: '#059669',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 10px 20px rgba(5,150,105,0.3)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🚗 I can drive
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;
