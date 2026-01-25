import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import IndustryPage from "./pages/IndustryPage";
import ChatPage from "./pages/ChatPage";
import AnalyzePage from "./pages/AnalyzePage";
import PredictPage from "./pages/PredictPage";
import ScannerPage from "./pages/ScannerPage";
import SentimentPage from "./pages/SentimentPage";
import ThemesPage from "./pages/ThemesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/industry/:slug" element={<IndustryPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="/themes" element={<ThemesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
