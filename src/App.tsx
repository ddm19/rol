import React from 'react';
import logo from './logo.svg';
import './App.scss';
import NavBar from "./components/NavBar";
import Home from "./pages/Home/Home";
import Blogs from "./pages/NotFound/NotFound";
import Contact from "./pages/NotFound/NotFound";
import NoPage from "./pages/NotFound/NotFound";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App()
{
  return (
    <div className="App">
      <header className="App-header">
        <script src="https://kit.fontawesome.com/07937a987b.js" crossOrigin="anonymous"></script>
        <NavBar></NavBar>
      </header>
      <body>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </body>
    </div>
  );
}

export default App;