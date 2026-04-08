import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BarChart3,
  CheckCircle2,
  Lock,
  Circle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Video,
  FileText,
  Play,
  Lightbulb,
  Flag,
  Award,
} from 'lucide-react';
import { getRoadmapBySlug, type RoadmapNode, type RoadmapSection } from '../data/roadmaps';

const typeIcons: Record<string, React.ElementType> = {
  milestone: Flag,
  topic: BookOpen,
  subtopic: FileText,
  checkpoint: Award,
};

const typeColors: Record<string, string> = {
  milestone: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  topic: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  subtopic: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
  checkpoint: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
};

const statusIcons: Record<string, React.ElementType> = {
  completed: CheckCircle2,
  available: Circle,
  locked: Lock,
};

const statusColors: Record<string, string> = {
  completed: 'text-emerald-400',
  available: 'text-cyan-400',
  locked: 'text-gray-600',
};

const resourceTypeIcons: Record<string, React.ElementType> = {
  doc: FileText,
  video: Video,
  article: BookOpen,
  practice: Play,
};

const sectionColors: Record<string, { bg: string; border: string; text: string; line: string }> = {
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', line: 'bg-emerald-500/30' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', line: 'bg-amber-500/30' },
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', line: 'bg-blue-500/30' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', line: 'bg-purple-500/30' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', line: 'bg-rose-500/30' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', line: 'bg-orange-500/30' },
};

function NodeCard({ node, isLast, sectionColor }: { node: RoadmapNode; isLast: boolean; sectionColor: string }) {
  const [expanded, setExpanded] = useState(false);
  const StatusIcon = statusIcons[node.status];
  const TypeIcon = typeIcons[node.type];
  const colors = sectionColors[sectionColor] || sectionColors.blue;

  return (
    <div className="relative">
      {/* Connector line */}
      {!isLast && (
        <div className={`absolute left-6 top-14 bottom-0 w-0.5 ${colors.line}`} />
      )}

      <div
        className={`relative flex gap-4 cursor-pointer group ${
          node.status === 'locked' ? 'opacity-60' : ''
        }`}
        onClick={() => node.status !== 'locked' && setExpanded(!expanded)}
      >
        {/* Status indicator */}
        <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl border-2 flex items-center justify-center ${
          node.status === 'completed'
            ? 'bg-emerald-500/20 border-emerald-500/50'
            : node.status === 'available'
            ? `${colors.bg} ${colors.border}`
            : 'bg-gray-800/50 border-gray-700'
        }`}>
          <StatusIcon className={`h-5 w-5 ${statusColors[node.status]}`} />
        </div>

        {/* Content */}
        <div className="flex-1 pb-6">
          <div className={`bg-gray-900/80 border rounded-xl p-4 transition-all ${
            node.status === 'locked'
              ? 'border-gray-800'
              : expanded
              ? `border-gray-700 shadow-lg`
              : 'border-gray-800 hover:border-gray-700'
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${typeColors[node.type]}`}>
                    <TypeIcon className="h-3 w-3" />
                    {node.type}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  {node.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {node.description}
                </p>
              </div>
              {node.status !== 'locked' && (
                <div className="flex-shrink-0">
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </div>
              )}
            </div>

            {/* Expanded Content */}
            {expanded && node.status !== 'locked' && (
              <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                {/* Resources */}
                {node.resources.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">Resources</h5>
                    <div className="space-y-1.5">
                      {node.resources.map((res, idx) => {
                        const ResIcon = resourceTypeIcons[res.type] || FileText;
                        return (
                          <a
                            key={idx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-gray-400 hover:text-cyan-400 transition-colors py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ResIcon className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="flex-1">{res.title}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-50" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {node.tips.length > 0 && (
                  <div>
                    <h5 className="text-xs font-semibold text-gray-400 uppercase mb-2">Tips</h5>
                    <div className="space-y-1.5">
                      {node.tips.map((tip, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-400">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ section, isLast }: { section: RoadmapSection; isLast: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const colors = sectionColors[section.color] || sectionColors.blue;

  return (
    <div className="relative">
      {/* Section connector */}
      {!isLast && !collapsed && (
        <div className="absolute left-6 top-full w-0.5 h-8 bg-gray-800" />
      )}

      {/* Section Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className={`w-full flex items-center gap-3 mb-4 px-4 py-3 rounded-xl border ${colors.bg} ${colors.border} hover:brightness-110 transition-all`}
      >
        <div className={`w-2 h-2 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
        <h3 className={`text-sm font-bold ${colors.text} flex-1 text-left`}>
          {section.title}
        </h3>
        <span className="text-xs text-gray-500">{section.nodes.length} topics</span>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {/* Nodes */}
      {!collapsed && (
        <div className="ml-0 mb-8">
          {section.nodes.map((node, idx) => (
            <NodeCard
              key={node.id}
              node={node}
              isLast={idx === section.nodes.length - 1}
              sectionColor={section.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RoadmapDetail() {
  const { slug } = useParams<{ slug: string }>();
  const roadmap = slug ? getRoadmapBySlug(slug) : undefined;

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Roadmap not found</h2>
          <Link to="/roadmaps" className="text-cyan-400 hover:text-cyan-300">
            Back to Roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const totalNodes = roadmap.sections.reduce((acc, s) => acc + s.nodes.length, 0);
  const completedNodes = roadmap.sections.reduce(
    (acc, s) => acc + s.nodes.filter(n => n.status === 'completed').length,
    0
  );
  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/roadmaps"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Roadmaps
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${roadmap.color} shadow-lg mb-4`}>
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">
            {roadmap.title}
          </h1>
          <p className="text-gray-400 max-w-2xl mb-4">
            {roadmap.description}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" />
              <span>{totalNodes} topics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{roadmap.estimatedHours}h estimated</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">{roadmap.level}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">{completedNodes}/{totalNodes} completed ({progress}%)</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${roadmap.color} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Roadmap Tree */}
        <div className="space-y-2">
          {roadmap.sections.map((section, idx) => (
            <SectionBlock
              key={section.id}
              section={section}
              isLast={idx === roadmap.sections.length - 1}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-12 p-4 bg-gray-900/80 border border-gray-800 rounded-xl">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Legend</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Circle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Lock className="h-3.5 w-3.5 text-gray-600" />
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Flag className="h-3.5 w-3.5 text-cyan-400" />
              <span>Milestone</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Checkpoint</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
