import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Wizard from './pages/Wizard';
import Proposal from './pages/Proposal';
import GeminiChat from './components/GeminiChat';
import Admin from './pages/Admin'; // Added Admin import

const App = () => { // Changed to arrow function
  return (
    <Router>
      <div className="flex flex-col min-h-screen"> {/* Added div wrapper */}
        <main className="flex-grow"> {/* Added main wrapper */}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            {/* Removed Dashboard route */}
            <Route path="/wizard" element={<Wizard />} /> {/* Modified Wizard route */}
            <Route path="/proposal" element={<Proposal />} /> {/* Modified Proposal route */}
            <Route path="/admin" element={<Admin />} /> {/* Added Admin route */}
          </Routes>
        </main>
        <GeminiChat />
      </div>
    </Router>
  );
};

export default App;
