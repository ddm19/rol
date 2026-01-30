import "./App.scss";
import NavBar from "./components/NavBar/NavBar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import NoPage from "./pages/NotFound/NotFound";
import { Routes, Route, useLocation, matchPath } from "react-router-dom";
import Article from "components/Article/article";
import ArticleEditor from "pages/ArticleEditor/articleEditor";
import DiceRollerPage from "pages/diceRoller/diceRoller";
import AdvantagesPage from "pages/Advantages/AdvantagesPage";
import CardsPage from "pages/CardsPage/cardsPage";
import ArticleSearch from "pages/ArticleSearch/ArticleSearch";
import UtilitiesPage from "pages/Utilities/UtilitiesPage";
import AuthCallback from "pages/AuthCallBack/authCallBack";
import ProfilePage from "pages/ProfilePage/profilePage";
import DnDPdfInline from "components/dndPdfInline/dndPdfInline";
import PrivateRoute from "components/NavBar/PrivateRoute/privateRoute";
import VillazarcilloPage from "pages/VillazarcilloPage/villazarciloPage";
import PJMaker from "pages/PjMaker/PjMaker";
import AdminPage from "pages/AdminPage/adminPage";
import AdminRoute from "components/NavBar/PrivateRoute/adminRoute";


function App() {
  const notFooterRoutes = ["/sheets/*", "/Villazarcillo/*", "/Villazarcillo"];

  const location = useLocation();

  const hideFooter = notFooterRoutes.some((route) =>
    matchPath(route, location.pathname)
  );

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
          <Route path="Utilities/PJMaker" element={<PJMaker />} />
          <Route path="/Cards" element={<CardsPage />} />
          <Route path="/Utilities" element={<UtilitiesPage />} />
          <Route path="/Campaigns" element={<ArticleSearch category={{ "id": "campaign", "name": "Campaña" }} />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/sheets/:id" element={<DnDPdfInline />} />
          <Route path="*" element={<NoPage />} />

          {/* Rutas Privadas */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          <Route path="/Villazarcillo" element={
            <PrivateRoute>
              <VillazarcilloPage />
            </PrivateRoute>
          } />
        </Routes>
      </main>

      <footer className={`App-footer ${hideFooter ? "App-footer--hidden" : ""}`}>
        <Footer></Footer>
      </footer>
    </div>
  );
}

export default App;
