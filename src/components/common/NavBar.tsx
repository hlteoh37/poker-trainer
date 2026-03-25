type Page = 'play' | 'drills' | 'stats';

interface NavBarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function NavBar({ currentPage, onNavigate }: NavBarProps) {
  const tabs: { id: Page; label: string }[] = [
    { id: 'play', label: 'Play' },
    { id: 'drills', label: 'Drills' },
    { id: 'stats', label: 'Stats' },
  ];

  return (
    <>
      <nav className="hidden md:flex bg-gray-800 px-6 py-3 gap-6">
        <span className="text-green-400 font-bold text-lg mr-auto">Poker Trainer</span>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onNavigate(tab.id)}
            className={`text-sm font-medium transition-colors ${currentPage === tab.id ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'}`}>
            {tab.label}
          </button>
        ))}
      </nav>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around bg-gray-800 py-3 border-t border-gray-700 z-50">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onNavigate(tab.id)}
            className={`text-sm font-medium transition-colors ${currentPage === tab.id ? 'text-green-400' : 'text-gray-400'}`}>
            {tab.label}
          </button>
        ))}
      </nav>
    </>
  );
}
