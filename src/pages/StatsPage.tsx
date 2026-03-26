import { useStatsStore } from '../stores/stats-store';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { AccuracyChart } from '../components/dashboard/AccuracyChart';
import { WinRateChart } from '../components/dashboard/WinRateChart';
import { WeakSpots } from '../components/dashboard/WeakSpots';

export function StatsPage() {
  const { drillResults, sessions, currentSession, getAccuracy, exportData, importData } = useStatsStore();

  const totalHands = sessions.reduce((sum, s) => sum + s.handsPlayed, 0) + currentSession.handsPlayed;
  const totalBB = sessions.reduce((sum, s) => sum + s.bbWonLost, 0) + currentSession.bbWonLost;

  const accuracies = [
    { label: 'Preflop', value: getAccuracy('preflop') },
    { label: 'Pot Odds', value: getAccuracy('potOdds') },
    { label: 'Equity', value: getAccuracy('equity') },
    { label: 'Postflop', value: getAccuracy('postflop') },
  ];

  const weakSpotData = [
    { drillType: 'preflop', accuracy: getAccuracy('preflop') },
    { drillType: 'potOdds', accuracy: getAccuracy('potOdds') },
    { drillType: 'equity', accuracy: getAccuracy('equity') },
    { drillType: 'postflop', accuracy: getAccuracy('postflop') },
  ];

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'poker-trainer-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => { importData(reader.result as string); };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold">Stats & Progress</h1>
      <StatsOverview handsPlayed={totalHands} bbWonLost={totalBB} overallAccuracy={getAccuracy()} drillsCompleted={drillResults.length} />
      <AccuracyChart accuracies={accuracies} />
      <WinRateChart sessions={sessions} />
      <WeakSpots accuracies={weakSpotData} />
      <div className="flex gap-2">
        <button onClick={handleExport} className="text-xs text-gray-400 hover:text-white underline">Export Data</button>
        <button onClick={handleImport} className="text-xs text-gray-400 hover:text-white underline">Import Data</button>
      </div>
    </div>
  );
}
