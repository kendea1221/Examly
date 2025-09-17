import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import ExamView from './components/ExamView';
import ResultView from './components/ResultView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Examly - Web Test System</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exam/:teacher/:examId" element={<ExamView />} />
            <Route path="/exam/:teacher/:examId/results" element={<ResultView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;