import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import FinalStoryPage from './pages/FinalStoryPage';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/final-story" element={<FinalStoryPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);