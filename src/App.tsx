import './App.scss';
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import NoPage from "./pages/NotFound/NotFound";
import { Routes, Route } from "react-router-dom";
import Article from 'components/Article/article';
import TestPage from 'pages/testpage/testPage';

function App()
{
  return (
    <div className="App">
      <header className="App-header">
        <NavBar></NavBar>
      </header>
      <main>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Hispania' element={<TestPage />}></Route>
          <Route path='/Article/:articleId' element={<Article />} />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </main>
      <footer className="App-footer">
        <Footer></Footer>
      </footer>
    </div>
  );
}

export default App;