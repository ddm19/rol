import React from 'react';
import logo from './logo.svg';
import './App.scss';
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import NoPage from "./pages/NotFound/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App()
{
  return (
    <div className="App">
      <header className="App-header">
        <NavBar></NavBar>
      </header>
      <body>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
        <Footer></Footer>
      </body>
    </div>
  );
}

export default App;