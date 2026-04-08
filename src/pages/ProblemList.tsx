import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Code2,
  ChevronRight,
  Sparkles,
  Target,
  Layers,
} from 'lucide-react';
import {
  problems,
  categories,
  difficulties,
  filterProblems,
  type Category,
  type Difficulty,
} from '../data/problems';
import DifficultyBadge from '../components/DifficultyBadge';
import CategoryIcon from '../components/CategoryIcon';

const stats = [
  {
    label: 'Total Problems',
    value: problems.length,
    icon: Code2,
    color: 'from-blue-600 to-cyan-500',
  },
  {
    label: 'Categories',
    value: new Set(problems.map(p => p.category)).size,
    icon: Layers,
    color: 'from-purple-600 to-pink-500',
  },
  {
    label: 'Community',
    value: '2.4K+',
    icon: Users,
    color: 'from-orange-500 to-amber-500',
  },
  {
    label: 'Acceptance',
    value: `${Math.round(problems.reduce((a, p) => a + p.acceptance, 0) / problems.length)}%`,
    icon: Target,
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function ProblemList() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'All'>('All');

  const filtered = filterProblems(selectedCategory, selectedDifficulty, search);

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-cyan-600/10" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">
                Master Salesforce Apex Development
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
              Apex{' '}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Playground
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Sharpen your Salesforce Apex skills with real-world problems. Practice Triggers,
              Classes, Async Apex, and more in an interactive coding environment.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map(stat => (
              <div
                key={stat.label}
                className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-4 text-center hover:border-gray-700 transition-colors"
              >
                <div
                  className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.color} mb-2`}
                >
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Problems */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Search & Filters */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-4 mb-6 -mt-4 relative z-10">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search problems, tags, or categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as Category | 'All')}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value as Difficulty | 'All')}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 cursor-pointer"
              >
                <option value="All">All Levels</option>
                {difficulties.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing <span className="text-white font-medium">{filtered.length}</span> of{' '}
            {problems.length} problems
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Sorted by difficulty</span>
          </div>
        </div>

        {/* Problem Table */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-800/50 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">#</div>
            <div className="col-span-5">Problem</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2">Acceptance</div>
          </div>

          {/* Problem Rows */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No problems found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filtered.map((problem) => (
              <Link
                key={problem.id}
                to={`/problem/${problem.slug}`}
                className="group block border-b border-gray-800/50 last:border-b-0 hover:bg-gray-800/30 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  {/* Number */}
                  <div className="col-span-2 md:col-span-1">
                    <span className="text-gray-600 font-mono text-sm">{problem.id}</span>
                  </div>

                  {/* Title & Tags */}
                  <div className="col-span-10 md:col-span-5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors text-sm sm:text-base">
                        {problem.title}
                      </h3>
                      <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all hidden sm:block" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {problem.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="hidden md:flex col-span-2 items-center gap-2">
                    <CategoryIcon category={problem.category} size={14} />
                    <span className="text-sm text-gray-400">{problem.category}</span>
                  </div>

                  {/* Difficulty */}
                  <div className="hidden md:block col-span-2">
                    <DifficultyBadge difficulty={problem.difficulty} />
                  </div>

                  {/* Acceptance */}
                  <div className="hidden md:block col-span-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-800 rounded-full h-1.5 max-w-16">
                        <div
                          className={`h-1.5 rounded-full ${
                            problem.acceptance >= 70
                              ? 'bg-emerald-500'
                              : problem.acceptance >= 50
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${problem.acceptance}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-400">{problem.acceptance}%</span>
                    </div>
                  </div>
                </div>

                {/* Mobile extras */}
                <div className="md:hidden px-6 pb-3 flex items-center gap-3">
                  <DifficultyBadge difficulty={problem.difficulty} />
                  <div className="flex items-center gap-1.5">
                    <CategoryIcon category={problem.category} size={12} />
                    <span className="text-xs text-gray-500">{problem.category}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
