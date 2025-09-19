import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // <-- needed
import Main from "./components/Main";
import Home from "./components/Home"; // <-- make sure you have a Home.jsx

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
  
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
