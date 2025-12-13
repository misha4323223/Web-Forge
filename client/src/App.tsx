import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import FoodDelivery from "@/pages/demo/FoodDelivery";
import FitnessStudio from "@/pages/demo/FitnessStudio";
import CosmeticsShop from "@/pages/demo/CosmeticsShop";
import StreetWearShop from "@/pages/demo/StreetWearShop";
import SocksShop from "@/pages/demo/SocksShop";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/demo/food-delivery" component={FoodDelivery} />
      <Route path="/demo/fitness" component={FitnessStudio} />
      <Route path="/demo/cosmetics" component={CosmeticsShop} />
      <Route path="/demo/streetwear" component={StreetWearShop} />
      <Route path="/demo/socks" component={SocksShop} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
