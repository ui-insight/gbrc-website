import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import GettingStarted from './pages/GettingStarted'
import About from './pages/About'
import Contact from './pages/Contact'
import CostRecovery from './pages/CostRecovery'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/getting-started" element={<GettingStarted />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cost-recovery" element={<CostRecovery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
