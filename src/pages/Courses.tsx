import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  BarChart3,
  Star,
  Users,
  ChevronRight,
  Zap,
  Layers,
  Globe,
  Shield,
  Code2,
} from 'lucide-react';
import { courses } from '../data/courses';

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  layers: Layers,
  globe: Globe,
  shield: Shield,
  code: Code2,
};

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function Courses() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <GraduationCap className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Courses</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Salesforce Apex Courses
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Structured, in-depth courses with lessons, exercises, quizzes, and hands-on projects.
            Learn at your own pace and build real skills.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Courses', value: courses.length.toString(), icon: GraduationCap },
            { label: 'Total Lessons', value: courses.reduce((a, c) => a + c.totalLessons, 0).toString(), icon: BarChart3 },
            { label: 'Total Hours', value: courses.reduce((a, c) => a + parseInt(c.duration), 0) + 'h', icon: Clock },
            { label: 'Avg Rating', value: (courses.reduce((a, c) => a + c.rating, 0) / courses.length).toFixed(1), icon: Star },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 text-center">
              <stat.icon className="h-5 w-5 text-cyan-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Course Cards */}
        <div className="space-y-6">
          {courses.map(course => {
            const Icon = iconMap[course.icon] || Code2;
            const completedLessons = course.modules.reduce(
              (acc, m) => acc + m.lessons.filter(l => l.completed).length,
              0
            );
            const progress = course.totalLessons > 0
              ? Math.round((completedLessons / course.totalLessons) * 100)
              : 0;

            return (
              <Link
                key={course.id}
                to={`/course/${course.slug}`}
                className="group block bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all hover:shadow-xl hover:shadow-cyan-500/5"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Left: Color stripe + Icon */}
                  <div className={`md:w-48 flex-shrink-0 bg-gradient-to-br ${course.color} p-6 flex items-center justify-center`}>
                    <Icon className="h-16 w-16 text-white/90" />
                  </div>

                  {/* Right: Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${levelColors[course.level]}`}>
                            {course.level}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-amber-400">
                            <Star className="h-3 w-3 fill-amber-400" />
                            {course.rating}
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                    </div>

                    <p className="text-sm text-gray-400 mb-4 leading-relaxed line-clamp-2">
                      {course.description}
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

                    {/* Progress bar */}
                    {completedLessons > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-400">{completedLessons}/{course.totalLessons} ({progress}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${course.color} rounded-full`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Module preview */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {course.modules.slice(0, 4).map(mod => (
                        <span key={mod.id} className="text-[11px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
                          {mod.title}
                        </span>
                      ))}
                      {course.modules.length > 4 && (
                        <span className="text-[11px] text-gray-600">+{course.modules.length - 4} more</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
