import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import StrategyDetail from "@/pages/StrategyDetail";
import Compare from "@/pages/Compare";

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen font-body">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/strategy/:id" element={<StrategyDetail />} />
            <Route path="/compare" element={<Compare />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
