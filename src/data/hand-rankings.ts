export const HAND_RANKINGS: string[] = [
  'AA', 'KK', 'QQ', 'AKs', 'JJ', 'AQs', 'KQs', 'AJs', 'KJs', 'TT',
  'AKo', 'ATs', 'QJs', 'KTs', 'QTs', 'JTs', '99', 'AQo', 'A9s', 'KQo',
  '88', 'K9s', 'T9s', 'A8s', 'Q9s', 'J9s', 'AJo', 'A5s', '77', 'A7s',
  'KJo', 'A4s', 'A3s', 'A6s', 'QJo', '66', 'K8s', 'T8s', 'A2s', '98s',
  'J8s', 'ATo', 'Q8s', 'K7s', 'KTo', '55', 'JTo', '87s', 'QTo', '44',
  '33', '22', 'K6s', '97s', 'K5s', '76s', 'T7s', 'K4s', 'K3s', 'K2s',
  'Q7s', '86s', '65s', 'J7s', '54s', 'Q6s', '75s', '96s', 'Q5s', '64s',
  'Q4s', 'Q3s', 'T6s', '53s', 'Q2s', 'J6s', 'J5s', 'J4s', 'J3s', 'J2s',
  '85s', '43s', 'T5s', 'T4s', 'T3s', 'T2s', '74s', '95s', '84s', '63s',
  '94s', '93s', '92s', '52s', '42s', '32s', 'A9o', 'K9o', 'Q9o', 'J9o',
  'T9o', '98o', '87o', '76o', '65o', '54o', 'A8o', 'K8o', 'Q8o', 'J8o',
  'T8o', '97o', '86o', '75o', '64o', '53o', '43o', 'A7o', 'K7o', 'Q7o',
  'J7o', 'T7o', '96o', '85o', '74o', '63o', '52o', '42o', '32o', 'A6o',
  'K6o', 'Q6o', 'J6o', 'T6o', '95o', '84o', '73o', '62o', 'A5o', 'K5o',
  'Q5o', 'J5o', 'T5o', '94o', '83o', '72o', 'A4o', 'K4o', 'Q4o', 'J4o',
  'T4o', '93o', '82o', 'A3o', 'K3o', 'Q3o', 'J3o', 'T3o', '92o', 'A2o',
  'K2o', 'Q2o', 'J2o', 'T2o',
];

export function getHandRank(hand: string): number {
  const index = HAND_RANKINGS.indexOf(hand);
  return index === -1 ? HAND_RANKINGS.length : index;
}

export function getHandPercentile(hand: string): number {
  const rank = getHandRank(hand);
  return (rank / HAND_RANKINGS.length) * 100;
}
