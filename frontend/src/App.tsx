import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import GettingStarted from './pages/GettingStarted'
import About from './pages/About'
import Contact from './pages/Contact'
import CostRecovery from './pages/CostRecovery'
import ProjectIntake from './pages/ProjectIntake'
import Training from './pages/Training'

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
          <Route path="/project-intake" element={<ProjectIntake />} />
          <Route path="/training" element={<Training />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
