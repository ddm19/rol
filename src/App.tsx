import "./App.scss";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import NoPage from "./pages/NotFound/NotFound";
import { Routes, Route } from "react-router-dom";
import Article from "components/Article/article";
import ArticleEditor from "pages/ArticleEditor/articleEditor";
import DiceRollerPage from "pages/diceRoller/diceRoller";
import AdvantagesPage from "pages/Advantages/AdvantagesPage";
import CardsPage from "pages/CardsPage/cardsPage";
import ArticleSearch from "pages/ArticleSearch/ArticleSearch";
import UtilitiesPage from "pages/Utilities/UtilitiesPage";
import AuthCallback from "pages/AuthCallBack/authCallBack";
import ProfilePage from "pages/ProfilePage/profilePage";
import SheetEditor from "pages/sheetEditor/sheetEditor";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <NavBar></NavBar>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Hispania" element={<ArticleSearch />} />
          <Route path="/Hispania/Creatures" element={<ArticleSearch category={{ "id": "Criatura1757350726991", "name": "Criatura" }} />} />
          <Route path="/Hispania/Places" element={<ArticleSearch category={{ "id": "Lugar1757351194344", "name": "Lugar" }} />} />
          <Route path="/Hispania/Objects" element={<ArticleSearch category={{ "id": "Objeto Mágico1755530300443", "name": "Objeto Mágico" }} />} />
          <Route
            path="/Utilities/DiceRoller"
            element={<DiceRollerPage />}
          ></Route>
          <Route path="/Article/:articleId" element={<Article />} />
          <Route path="/Article" element={<ArticleEditor />} />
          <Route path="/Utilities/Advantages" element={<AdvantagesPage />} />
          <Route path="/Cards" element={<CardsPage />} />
          <Route path="/Utilities" element={<UtilitiesPage />} />
          <Route path="/Campaigns" element={<ArticleSearch category={{ "id": "campaign", "name": "Campaña" }} />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sheets/:id" element={<SheetEditor />} />

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
