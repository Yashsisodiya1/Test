import { Trophy, Medal, TrendingUp, Star, Crown } from 'lucide-react';

const leaderboardData = [
  { rank: 1, name: 'ApexMaster_SF', solved: 15, streak: 42, score: 2850, avatar: 'AM' },
  { rank: 2, name: 'CloudArchitect', solved: 14, streak: 38, score: 2720, avatar: 'CA' },
  { rank: 3, name: 'TriggerNinja', solved: 14, streak: 31, score: 2680, avatar: 'TN' },
  { rank: 4, name: 'BatchProcessor', solved: 13, streak: 27, score: 2540, avatar: 'BP' },
  { rank: 5, name: 'FlowBuilder_Pro', solved: 12, streak: 25, score: 2380, avatar: 'FB' },
  { rank: 6, name: 'SalesforceGuru', solved: 12, streak: 22, score: 2310, avatar: 'SG' },
  { rank: 7, name: 'ApexDev2024', solved: 11, streak: 19, score: 2150, avatar: 'AD' },
  { rank: 8, name: 'QueueableQueen', solved: 10, streak: 16, score: 1980, avatar: 'QQ' },
  { rank: 9, name: 'IntegrationHero', solved: 9, streak: 14, score: 1820, avatar: 'IH' },
  { rank: 10, name: 'TestClassKing', solved: 8, streak: 11, score: 1650, avatar: 'TC' },
];

const rankColors: Record<number, string> = {
  1: 'from-yellow-500 to-amber-500',
  2: 'from-gray-300 to-gray-400',
  3: 'from-orange-600 to-amber-600',
};

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-4">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-yellow-300 font-medium">Community Rankings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Leaderboard</h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            Top Apex developers ranked by problems solved, streaks, and overall score.
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          {[1, 0, 2].map(idx => {
            const user = leaderboardData[idx];
            const isFirst = user.rank === 1;
            return (
              <div
                key={user.rank}
                className={`text-center ${isFirst ? '-mt-4' : 'mt-4'}`}
              >
                <div
                  className={`relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${
                    rankColors[user.rank]
                  } mb-2 ${isFirst ? 'w-20 h-20 ring-4 ring-yellow-500/30' : ''}`}
                >
                  <span className={`font-bold text-white ${isFirst ? 'text-xl' : 'text-lg'}`}>
                    {user.avatar}
                  </span>
                  {isFirst && (
                    <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-400" />
                  )}
                </div>
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{user.score} pts</p>
              </div>
            );
          })}
        </div>

        {/* Full Table */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">Rank</div>
            <div className="col-span-4">Developer</div>
            <div className="col-span-2">Solved</div>
            <div className="col-span-2">Streak</div>
            <div className="col-span-3">Score</div>
          </div>

          {leaderboardData.map(user => (
            <div
              key={user.rank}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors ${
                user.rank <= 3 ? 'bg-gray-800/10' : ''
              }`}
            >
              <div className="col-span-2 sm:col-span-1">
                {user.rank <= 3 ? (
                  <Medal
                    className={`h-5 w-5 ${
                      user.rank === 1
                        ? 'text-yellow-400'
                        : user.rank === 2
                        ? 'text-gray-400'
                        : 'text-orange-500'
                    }`}
                  />
                ) : (
                  <span className="text-gray-500 font-mono text-sm">{user.rank}</span>
                )}
              </div>
              <div className="col-span-6 sm:col-span-4 flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    user.rank <= 3
                      ? `bg-gradient-to-br ${rankColors[user.rank]}`
                      : 'bg-gray-700'
                  }`}
                >
                  {user.avatar}
                </div>
                <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
              <div className="hidden sm:flex col-span-2 items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-sm text-gray-300">{user.solved}</span>
              </div>
              <div className="hidden sm:flex col-span-2 items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-sm text-gray-300">{user.streak} days</span>
              </div>
              <div className="col-span-4 sm:col-span-3">
                <span className="text-sm font-semibold text-white">{user.score.toLocaleString()}</span>
                <span className="text-xs text-gray-500 ml-1">pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
