import { useState } from 'react';

type Page = 'play' | 'drills' | 'stats';

export default function App() {
  const [page, setPage] = useState<Page>('play');

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <main className="flex-1 p-4">
        {page === 'play' && <div>Play Mode</div>}
        {page === 'drills' && <div>Drill Mode</div>}
        {page === 'stats' && <div>Stats</div>}
      </main>
      <nav className="flex justify-around bg-gray-800 p-3 md:hidden">
        <button
          className={`text-sm ${page === 'play' ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => setPage('play')}
        >
          Play
        </button>
        <button
          className={`text-sm ${page === 'drills' ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => setPage('drills')}
        >
          Drills
        </button>
        <button
          className={`text-sm ${page === 'stats' ? 'text-green-400' : 'text-gray-400'}`}
          onClick={() => setPage('stats')}
        >
          Stats
        </button>
      </nav>
    </div>
  );
}
