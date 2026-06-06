import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import News from './pages/News';
import Info from './pages/Info';
import Help from './pages/Help';
import Compare from './pages/Compare';
import CarDetail from './pages/CarDetail';
import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main pages share the navbar + global "Ask AI" popup */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/info" element={<Info />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/help" element={<Help />} />
        </Route>
        {/* Detail page keeps its own full-screen two-panel layout */}
        <Route path="/car/:id" element={<CarDetail />} />
      </Routes>
    </Router>
  );
}
