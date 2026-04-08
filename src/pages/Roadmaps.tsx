import { Link } from 'react-router-dom';
import { Map, Clock, BarChart3, ChevronRight, Code2, GraduationCap, Globe } from 'lucide-react';
import { roadmaps } from '../data/roadmaps';

const iconMap: Record<string, React.ElementType> = {
  code: Code2,
  graduation: GraduationCap,
  globe: Globe,
};

export default function Roadmaps() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 mb-4">
            <Map className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">Learning Roadmaps</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Salesforce Developer Roadmaps
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Interactive step-by-step guides to become a proficient Salesforce developer.
            Follow the path, track your progress, and master each skill.
          </p>
        </div>

        {/* Roadmap Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roadmaps.map(roadmap => {
            const Icon = iconMap[roadmap.icon] || Code2;
            return (
              <Link
                key={roadmap.id}
                to={`/roadmap/${roadmap.slug}`}
                className="group bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all hover:shadow-xl hover:shadow-cyan-500/5"
              >
                {/* Gradient Banner */}
                <div className={`h-2 bg-gradient-to-r ${roadmap.color}`} />

                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${roadmap.color} shadow-lg flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {roadmap.title}
                      </h3>
                      <span className="text-xs text-gray-500">{roadmap.level}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-5 leading-relaxed line-clamp-3">
                    {roadmap.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <BarChart3 className="h-3.5 w-3.5" />
                      <span>{roadmap.totalNodes} topics</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{roadmap.estimatedHours}h estimated</span>
                    </div>
                  </div>

                  {/* Section Preview */}
                  <div className="space-y-1.5 mb-5">
                    {roadmap.sections.slice(0, 4).map((section, idx) => (
                      <div key={section.id} className="flex items-center gap-2 text-xs text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full bg-${section.color}-500`} />
                        <span className="text-gray-400">{section.title}</span>
                        <span className="text-gray-600 ml-auto">{section.nodes.length} items</span>
                        {idx === 0 && (
                          <span className="text-emerald-400 text-[10px] font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded">START</span>
                        )}
                      </div>
                    ))}
                    {roadmap.sections.length > 4 && (
                      <div className="text-xs text-gray-600 pl-4">
                        +{roadmap.sections.length - 4} more sections
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div className="flex -space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
                          <span className="text-[8px] text-gray-400">{String.fromCharCode(65 + i)}</span>
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center">
                        <span className="text-[8px] text-gray-500">+</span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      Explore
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How Roadmaps Work</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Choose Your Path',
                description: 'Pick a roadmap that matches your current skill level and career goals.',
                color: 'cyan',
              },
              {
                step: '2',
                title: 'Follow the Nodes',
                description: 'Each node is a skill to learn. Follow the path from top to bottom, completing each section.',
                color: 'blue',
              },
              {
                step: '3',
                title: 'Track Progress',
                description: 'Mark topics as complete as you learn them. Checkpoints test your knowledge with hands-on exercises.',
                color: 'purple',
              },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center mx-auto mb-4`}>
                  <span className={`text-lg font-bold text-${item.color}-400`}>{item.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
