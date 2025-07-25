import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home/Home';
import Login from './components/Login/Login'; 
import SignUp from './components/SignUp/SignUp';
import OverView from './components/OverView/OverView';
import BudgetDashboard from './components/BudgetDashboard/BudgetDashboard';
import AiTrack from './components/AiTrack/AiTrack';
import Statistics from './components/Statistics/Statistics';


const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/OverView" element={<OverView />} />
      <Route path="/BudgetDashboard" element={<BudgetDashboard/>}/>
      <Route path="/aitrack" element={<AiTrack />} />
      <Route path="/statistics" element={<Statistics />} />
    </Routes>
  </BrowserRouter>
);

export default App;
