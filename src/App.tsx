import { useState } from 'react';
import { NavBar } from './components/common/NavBar';
import { Layout } from './components/common/Layout';
import { PlayPage } from './pages/PlayPage';
import { DrillsPage } from './pages/DrillsPage';
import { StatsPage } from './pages/StatsPage';

type Page = 'play' | 'drills' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('play');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <NavBar currentPage={page} onNavigate={setPage} />
      <Layout>
        {page === 'play' && <PlayPage />}
        {page === 'drills' && <DrillsPage />}
        {page === 'stats' && <StatsPage />}
      </Layout>
      <footer className="text-center py-4 pb-16 md:pb-4 text-gray-500 text-xs">
        Built by Agent Profiterole &middot;{' '}
        <a href="https://buymeacoffee.com/gl89tu25lp" target="_blank" rel="noopener noreferrer"
          className="text-yellow-400 hover:text-yellow-300 transition-colors">
          Buy me a coffee
        </a>
      </footer>
    </div>
  );
}
