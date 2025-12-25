import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieConsent } from "@/components/CookieConsent";
import { ChatWidget } from "@/components/ChatWidget";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Order from "@/pages/Order";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFail from "@/pages/PaymentFail";
import PayRemaining from "@/pages/PayRemaining";
import Privacy from "@/pages/Privacy";
import Offer from "@/pages/Offer";
import Admin from "@/pages/Admin";
import FoodDelivery from "@/pages/demo/FoodDelivery";
import FitnessStudio from "@/pages/demo/FitnessStudio";
import CosmeticsShop from "@/pages/demo/CosmeticsShop";
import StreetWearShop from "@/pages/demo/StreetWearShop";
import SocksShop from "@/pages/demo/SocksShop";
import TravelAgency from "@/pages/demo/TravelAgency";
import BarberShop from "@/pages/demo/BarberShop";
import DentalClinic from "@/pages/demo/DentalClinic";
import ApartmentRenovation from "@/pages/demo/ApartmentRenovation";
import Photographer from "@/pages/demo/Photographer";
import AutoService from "@/pages/demo/AutoService";
import RealEstateAgency from "@/pages/demo/RealEstateAgency";
import BeautySalon from "@/pages/demo/BeautySalon";
import OnlineAcademy from "@/pages/demo/OnlineAcademy";
import TelegramApp from "@/pages/TelegramApp";

const isTelegramMiniApp = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('tg') === '1' || (window as any).Telegram?.WebApp?.initData;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/order" component={Order} />
      <Route path="/payment-success" component={PaymentSuccess} />
      <Route path="/payment-fail" component={PaymentFail} />
      <Route path="/pay-remaining" component={PayRemaining} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/offer" component={Offer} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/invoices" component={Admin} />
      <Route path="/demo/food-delivery" component={FoodDelivery} />
      <Route path="/demo/fitness" component={FitnessStudio} />
      <Route path="/demo/cosmetics" component={CosmeticsShop} />
      <Route path="/demo/streetwear" component={StreetWearShop} />
      <Route path="/demo/socks" component={SocksShop} />
      <Route path="/demo/travel" component={TravelAgency} />
      <Route path="/demo/barber" component={BarberShop} />
      <Route path="/demo/dental" component={DentalClinic} />
      <Route path="/demo/renovation" component={ApartmentRenovation} />
      <Route path="/demo/photographer" component={Photographer} />
      <Route path="/demo/auto-service" component={AutoService} />
      <Route path="/demo/real-estate" component={RealEstateAgency} />
      <Route path="/demo/beauty-salon" component={BeautySalon} />
      <Route path="/demo/online-academy" component={OnlineAcademy} />
      <Route path="/tg-app" component={TelegramApp} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  if (isTelegramMiniApp()) {
    return <TelegramApp />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieConsent />
        <ChatWidget />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
