import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import HomePage from './pages/HomePage'
import OnboardingPage from './pages/OnboardingPage'
import StrategyPage from './pages/StrategyPage'
import GenerationPage from './pages/GenerationPage'
import ReviewPage from './pages/ReviewPage'
import GradingPage from './pages/GradingPage'
import ComparisonPage from './pages/ComparisonPage'
import BossReviewPage from './pages/BossReviewPage'
import ExportPage from './pages/ExportPage'

export default function App() {
  return (
    <Routes>
      {/* Boss review is standalone — no app shell */}
      <Route path="/review/:shareToken" element={<BossReviewPage />} />

      {/* All other routes use the app shell */}
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/onboard" element={<OnboardingPage />} />
        <Route path="/strategy" element={<StrategyPage />} />
        <Route path="/generate" element={<GenerationPage />} />
        <Route path="/review-logos" element={<ReviewPage />} />
        <Route path="/grading" element={<GradingPage />} />
        <Route path="/compare" element={<ComparisonPage />} />
        <Route path="/share" element={<ExportPage />} />
        <Route path="/export" element={<ExportPage />} />
      </Route>
    </Routes>
  )
}
