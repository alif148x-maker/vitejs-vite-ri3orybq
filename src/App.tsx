import { CartProvider } from "./context/CartContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Promo from "./components/Promo";
import About from "./components/About";
import Plans from "./components/Plans";
import Catalog from "./components/Catalog";
import CustomQuote from "./components/CustomQuote";
import HowToOrder from "./components/HowToOrder";
import Delivery from "./components/Delivery";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import WhatsAppFloat from "./components/WhatsAppFloat";

export default function App() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <About />
        <Plans />
        <HowToOrder />
        <Promo />
        <Catalog />
        <CustomQuote />
        <Delivery />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </CartProvider>
  );
}
