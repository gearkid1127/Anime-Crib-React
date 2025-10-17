import { Routes, Route } from "react-router-dom";
import Browse from "./Pages/Browse.jsx";
import Nav from "./Components/Nav.jsx";
import Home from "./Pages/Home.jsx";
import AnimeDetails from "./Pages/AnimeDetails.jsx";
import ScrollToTop from "./Components/ScrollToTop.jsx";
import Footer from "./Components/Footer.jsx";
import ContactModal from "./Components/ContactModal.jsx";
import Categories from "./Pages/Categories.jsx";


export default function App() {
  return (
    <>
      <Nav />
      <ScrollToTop />
      <ContactModal />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/anime/:id" element={<AnimeDetails />} />
      </Routes>
      <Footer />
    </>
  );
}
