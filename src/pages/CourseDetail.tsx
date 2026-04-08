import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  BarChart3,
  Star,
  Users,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Video,
  FileText,
  Play,
  Award,
  Target,
  GraduationCap,
  Zap,
  Layers,
  Globe,
  Shield,
  Code2,
} from 'lucide-react';
import { getCourseBySlug, type Module, type Lesson } from '../data/courses';

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  layers: Layers,
  globe: Globe,
  shield: Shield,
  code: Code2,
};

const lessonTypeIcons: Record<string, React.ElementType> = {
  video: Video,
  reading: BookOpen,
  exercise: Play,
  quiz: Target,
  project: Award,
};

const lessonTypeLabels: Record<string, string> = {
  video: 'Video',
  reading: 'Reading',
  exercise: 'Exercise',
  quiz: 'Quiz',
  project: 'Project',
};

const lessonTypeColors: Record<string, string> = {
  video: 'text-purple-400 bg-purple-500/10',
  reading: 'text-blue-400 bg-blue-500/10',
  exercise: 'text-emerald-400 bg-emerald-500/10',
  quiz: 'text-amber-400 bg-amber-500/10',
  project: 'text-rose-400 bg-rose-500/10',
};

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

function LessonView({ lesson, isActive, onSelect }: { lesson: Lesson; isActive: boolean; onSelect: () => void }) {
  const TypeIcon = lessonTypeIcons[lesson.type] || FileText;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
        isActive
          ? 'bg-cyan-500/10 border border-cyan-500/30'
          : 'hover:bg-gray-800/50 border border-transparent'
      }`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${lessonTypeColors[lesson.type]}`}>
        {lesson.completed ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        ) : (
          <TypeIcon className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-medium truncate ${isActive ? 'text-cyan-400' : 'text-gray-300'}`}>
          {lesson.title}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-gray-500 uppercase font-medium">{lessonTypeLabels[lesson.type]}</span>
          <span className="text-[10px] text-gray-600">{lesson.duration}</span>
        </div>
      </div>
      {isActive && (
        <ChevronRight className="h-4 w-4 text-cyan-400 flex-shrink-0" />
      )}
    </button>
  );
}

function ModuleAccordion({
  module,
  moduleIndex,
  activeLesson,
  onLessonSelect,
}: {
  module: Module;
  moduleIndex: number;
  activeLesson: string | null;
  onLessonSelect: (lessonId: string) => void;
}) {
  const [expanded, setExpanded] = useState(moduleIndex === 0);
  const completedCount = module.lessons.filter(l => l.completed).length;

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900/80 hover:bg-gray-800/50 transition-colors text-left"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-400">{moduleIndex + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{module.title}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-gray-500">{module.lessons.length} lessons</span>
            {completedCount > 0 && (
              <span className="text-[10px] text-emerald-400">{completedCount}/{module.lessons.length} done</span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {expanded && (
        <div className="p-2 space-y-0.5 bg-gray-950/50">
          {module.lessons.map(lesson => (
            <LessonView
              key={lesson.id}
              lesson={lesson}
              isActive={activeLesson === lesson.id}
              onSelect={() => onLessonSelect(lesson.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const course = slug ? getCourseBySlug(slug) : undefined;
  const [activeLesson, setActiveLesson] = useState<string | null>(null);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Course not found</h2>
          <Link to="/courses" className="text-cyan-400 hover:text-cyan-300">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const Icon = iconMap[course.icon] || Code2;
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter(l => l.completed).length,
    0
  );
  const progress = course.totalLessons > 0
    ? Math.round((completedLessons / course.totalLessons) * 100)
    : 0;

  // Find the active lesson content
  let activeLessonData: Lesson | null = null;
  if (activeLesson) {
    for (const mod of course.modules) {
      const found = mod.lessons.find(l => l.id === activeLesson);
      if (found) {
        activeLessonData = found;
        break;
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/courses"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Courses
        </Link>

        {/* Course Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className={`flex-shrink-0 w-full md:w-40 h-32 md:h-40 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center`}>
            <Icon className="h-16 w-16 text-white/90" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${levelColors[course.level]}`}>
                {course.level}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Star className="h-3 w-3 fill-amber-400" />
                {course.rating}
              </div>
              <span className="text-xs text-gray-500">by {course.author}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              {course.title}
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              {course.longDescription}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3.5 w-3.5" />
                {course.totalLessons} lessons
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {course.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {course.enrolled.toLocaleString()} enrolled
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {course.modules.length} modules
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-400">Your Progress</span>
                <span className="text-gray-400">{completedLessons}/{course.totalLessons} ({progress}%)</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${course.color} rounded-full transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar: Modules & Lessons */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
            {course.modules.map((mod, idx) => (
              <ModuleAccordion
                key={mod.id}
                module={mod}
                moduleIndex={idx}
                activeLesson={activeLesson}
                onLessonSelect={setActiveLesson}
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeLessonData ? (
              <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6 lg:p-8">
                {/* Lesson Header */}
                <div className="flex items-center gap-2 mb-4">
                  {(() => {
                    const LIcon = lessonTypeIcons[activeLessonData.type] || FileText;
                    return (
                      <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${lessonTypeColors[activeLessonData.type]}`}>
                        <LIcon className="h-3.5 w-3.5" />
                        {lessonTypeLabels[activeLessonData.type]}
                      </div>
                    );
                  })()}
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {activeLessonData.duration}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  {activeLessonData.title}
                </h2>
                <p className="text-sm text-gray-400 mb-6">
                  {activeLessonData.description}
                </p>

                {/* Lesson Content (Markdown-like rendering) */}
                <div className="prose prose-invert prose-sm max-w-none">
                  {activeLessonData.content.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>;
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-xl font-bold text-white mt-6 mb-3">{line.slice(3)}</h2>;
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-lg font-semibold text-white mt-4 mb-2">{line.slice(4)}</h3>;
                    }
                    if (line.startsWith('```')) {
                      return null; // Code blocks handled separately below
                    }
                    if (line.startsWith('| ')) {
                      return (
                        <div key={idx} className="text-xs font-mono text-gray-300 bg-gray-800/50 px-3 py-1 border-b border-gray-700">
                          {line}
                        </div>
                      );
                    }
                    if (line.startsWith('- ')) {
                      return (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-300 ml-2 my-1">
                          <Circle className="h-1.5 w-1.5 mt-2 text-gray-500 flex-shrink-0" />
                          <span>{line.slice(2)}</span>
                        </div>
                      );
                    }
                    if (line.trim() === '') {
                      return <div key={idx} className="h-2" />;
                    }
                    return <p key={idx} className="text-sm text-gray-300 leading-relaxed my-1">{line}</p>;
                  })}

                  {/* Render code blocks */}
                  {activeLessonData.content.split('```').map((block, idx) => {
                    if (idx % 2 === 1) {
                      const lines = block.split('\n');
                      const lang = lines[0]?.trim() || '';
                      const code = lines.slice(1).join('\n');
                      return (
                        <div key={`code-${idx}`} className="my-4 rounded-lg overflow-hidden border border-gray-700">
                          {lang && (
                            <div className="bg-gray-800 px-3 py-1.5 text-[10px] font-mono text-gray-400 uppercase border-b border-gray-700">
                              {lang}
                            </div>
                          )}
                          <pre className="bg-gray-900 p-4 overflow-x-auto">
                            <code className="text-xs font-mono text-gray-300 leading-relaxed">
                              {code}
                            </code>
                          </pre>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ) : (
              /* Course Info (no lesson selected) */
              <div className="space-y-6">
                {/* What You'll Learn */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-cyan-400" />
                    What You'll Learn
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {course.outcomes.map((outcome, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-300">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prerequisites */}
                {course.prerequisites.length > 0 && (
                  <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-amber-400" />
                      Prerequisites
                    </h3>
                    <div className="space-y-2">
                      {course.prerequisites.map((prereq, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Circle className="h-1.5 w-1.5 text-gray-500 flex-shrink-0 mt-2" />
                          <span className="text-sm text-gray-400">{prereq}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Course Content Overview */}
                <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-400" />
                    Course Content
                  </h3>
                  <div className="text-sm text-gray-400 mb-4">
                    {course.modules.length} modules &middot; {course.totalLessons} lessons &middot; {course.duration} total
                  </div>
                  <div className="space-y-2">
                    {course.modules.map((mod, idx) => (
                      <div key={mod.id} className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                        <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-300 truncate">{mod.title}</h4>
                          <span className="text-xs text-gray-500">{mod.lessons.length} lessons</span>
                        </div>
                        <div className="flex gap-1">
                          {mod.lessons.map(l => {
                            const LIcon = lessonTypeIcons[l.type] || FileText;
                            return (
                              <div key={l.id} className={`w-5 h-5 rounded flex items-center justify-center ${lessonTypeColors[l.type]}`} title={`${lessonTypeLabels[l.type]}: ${l.title}`}>
                                <LIcon className="h-3 w-3" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Start CTA */}
                <div className="text-center py-6">
                  <button
                    onClick={() => {
                      const firstLesson = course.modules[0]?.lessons[0];
                      if (firstLesson) setActiveLesson(firstLesson.id);
                    }}
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r ${course.color} text-white font-semibold text-sm hover:shadow-lg transition-all`}
                  >
                    <Play className="h-5 w-5" />
                    Start Learning
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
