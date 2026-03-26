import { useState } from 'react';
import { NavBar } from './components/common/NavBar';
import { Layout } from './components/common/Layout';
import { PlayPage } from './pages/PlayPage';
import { DrillsPage } from './pages/DrillsPage';
import { StatsPage } from './pages/StatsPage';

type Page = 'play' | 'drills' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('play');
  const [showSupport, setShowSupport] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar currentPage={page} onNavigate={setPage} />
      <Layout>
        {page === 'play' && <PlayPage />}
        {page === 'drills' && <DrillsPage />}
        {page === 'stats' && <StatsPage />}
      </Layout>
      {showSupport && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
          <p className="flex-1 text-xs text-gray-400 text-center">
            Enjoying this free poker coach?{' '}
            <a href="https://buymeacoffee.com/gl89tu25lp" target="_blank" rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition-colors">
              Buy Agent Profiterole a coffee
            </a>
          </p>
          <button onClick={() => setShowSupport(false)}
            className="text-gray-500 hover:text-gray-300 text-sm px-1">
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
