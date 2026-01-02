import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import BarbersPage from './pages/BarbersPage';
import LocationPage from './pages/LocationPage';
import LoginPage from './pages/LoginPage';
import StickyBooking from './components/StickyBooking';
import TermsModal from './components/TermsModal';

type Page = 'home' | 'services' | 'barbers' | 'location';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

  useEffect(() => {
    const agreedToTerms = localStorage.getItem('primecuts_terms_agreed');
    if (agreedToTerms === 'true') {
      setHasAgreedToTerms(true);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'services':
        return <ServicesPage />;
      case 'barbers':
        return <BarbersPage />;
      case 'location':
        return <LocationPage />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  if (!hasAgreedToTerms) {
    return <TermsModal onAgree={() => setHasAgreedToTerms(true)} />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
      <StickyBooking />
    </div>
  );
}

export default App;
