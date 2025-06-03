import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { ClaimForm } from './pages/ClaimForm'
import { BondConsent } from './pages/BondConsent'
import { BondFlow } from './pages/BondFlow'
import { FAQ } from './pages/FAQ'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/new" element={<ClaimForm />} />
            <Route path="/bond-consent/:claimId" element={<BondConsent />} />
            <Route path="/bond/:claimId" element={<BondFlow />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 