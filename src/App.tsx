import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Wizard from './pages/Wizard';
import Proposal from './pages/Proposal';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/w/:id" element={<Wizard />} />
        <Route path="/proposal/:id" element={<Proposal />} />
      </Routes>
    </Router>
  );
}

export default App;
