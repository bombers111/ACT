import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import ExpertSurvey from './pages/ExpertSurvey.jsx'
import SurveyComplete from './pages/SurveyComplete.jsx'
import { LangProvider } from './contexts/LangContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/ACT/survey/complete" element={<SurveyComplete />} />
        <Route path="/ACT/survey" element={<ExpertSurvey />} />
        <Route path="*" element={
          <LangProvider>
            <App />
          </LangProvider>
        } />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
