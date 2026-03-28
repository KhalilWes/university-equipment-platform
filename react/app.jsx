import React from "react";
import StudentCatalog from "./components/StudentCatalog";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
function App() {
  return (
    <div className="App">
      <StudentCatalog />
    </div>
  );
}

export default App;