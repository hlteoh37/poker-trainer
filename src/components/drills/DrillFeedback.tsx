interface DrillFeedbackProps { correct: boolean; explanation: string; onNext: () => void; }

export function DrillFeedback({ correct, explanation, onNext }: DrillFeedbackProps) {
  return (
    <div data-testid="drill-feedback"
      className={`rounded-lg p-4 ${correct ? 'bg-green-900/50 border border-green-600' : 'bg-red-900/50 border border-red-600'}`}>
      <div className="font-bold text-lg mb-2">{correct ? 'Correct!' : 'Incorrect'}</div>
      <p className="text-sm text-gray-300 mb-3">{explanation}</p>
      <button onClick={onNext} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm">Next</button>
    </div>
  );
}
