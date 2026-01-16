import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Wizard from './pages/Wizard';
import Proposal from './pages/Proposal';
import Admin from './pages/Admin'; // Added Admin import

const App = () => { // Changed to arrow function
  return (
    <HelmetProvider>
      <Router>
        <div className="flex flex-col min-h-screen"> {/* Added div wrapper */}
          <main className="flex-grow"> {/* Added main wrapper */}
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              {/* Removed Dashboard route */}
              <Route path="/wizard" element={<Wizard />} /> {/* Modified Wizard route */}
              <Route path="/proposal/:id" element={<Proposal />} /> {/* Modified Proposal route with ID */}
              <Route path="/admin" element={<Admin />} /> {/* Added Admin route */}
            </Routes>
          </main>
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;
