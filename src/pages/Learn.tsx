import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, Clock, BarChart3, Zap, Code2, Layers, Globe, Map, GraduationCap, ChevronRight } from 'lucide-react';

interface Track {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  lessons: number;
  duration: string;
  level: string;
  topics: string[];
}

const tracks: Track[] = [
  {
    title: 'Apex Triggers Mastery',
    description:
      'Learn to write efficient, bulkified triggers that follow Salesforce best practices. From basic before/after triggers to complex trigger frameworks.',
    icon: Zap,
    color: 'from-yellow-500 to-amber-500',
    lessons: 12,
    duration: '4 hours',
    level: 'Beginner → Intermediate',
    topics: [
      'Trigger Context Variables',
      'Before vs After Triggers',
      'Bulkification Patterns',
      'Recursion Prevention',
      'Trigger Handler Framework',
      'Order of Execution',
    ],
  },
  {
    title: 'Apex Classes & OOP',
    description:
      'Master object-oriented programming in Apex. Build reusable services, implement design patterns, and write clean, maintainable code.',
    icon: Code2,
    color: 'from-blue-500 to-cyan-500',
    lessons: 15,
    duration: '6 hours',
    level: 'Intermediate',
    topics: [
      'Classes & Interfaces',
      'Inheritance & Polymorphism',
      'Service Layer Pattern',
      'Selector Pattern',
      'Domain Layer Pattern',
      'Exception Handling',
    ],
  },
  {
    title: 'Async Apex Deep Dive',
    description:
      'Understand when and how to use each async mechanism. From future methods to Batch Apex, Queueable, and Scheduled Apex.',
    icon: Layers,
    color: 'from-purple-500 to-pink-500',
    lessons: 10,
    duration: '5 hours',
    level: 'Intermediate → Advanced',
    topics: [
      'Future Methods',
      'Batch Apex',
      'Queueable Apex',
      'Scheduled Apex',
      'Platform Events',
      'Change Data Capture',
    ],
  },
  {
    title: 'Salesforce Integrations',
    description:
      'Build robust integrations with external systems. REST APIs, SOAP callouts, named credentials, and error handling strategies.',
    icon: Globe,
    color: 'from-orange-500 to-red-500',
    lessons: 8,
    duration: '4 hours',
    level: 'Advanced',
    topics: [
      'REST API Endpoints',
      'HTTP Callouts',
      'Named Credentials',
      'OAuth Flows',
      'Error Handling & Retry',
      'Bulk API Patterns',
    ],
  },
];

export default function Learn() {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 mb-4">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-purple-300 font-medium">Learning Paths</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Learn Salesforce Apex
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Structured learning paths to take you from beginner to expert. Each track includes
            theory, interactive exercises, and real-world projects.
          </p>
        </div>

        {/* Quick Links to Roadmaps & Courses */}
        <div className="grid gap-4 sm:grid-cols-2 mb-12">
          <Link
            to="/roadmaps"
            className="group flex items-center gap-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg">
              <Map className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Roadmaps
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Interactive step-by-step guides to master Salesforce development
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link
            to="/courses"
            className="group flex items-center gap-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                Courses
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                Structured lessons with exercises, quizzes, and hands-on projects
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>

        {/* Learning Tracks */}
        <div className="grid gap-6 md:grid-cols-2">
          {tracks.map(track => (
            <div
              key={track.title}
              className="group bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all hover:shadow-lg"
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${track.color} shadow-lg`}
                >
                  <track.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {track.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <BarChart3 className="h-3 w-3" />
                      {track.lessons} lessons
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {track.duration}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-4 leading-relaxed">{track.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {track.topics.map(topic => (
                  <span
                    key={topic}
                    className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded"
                  >
                    {topic}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-500">{track.level}</span>
                <button className="flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors">
                  Start Learning
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resources Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Additional Resources</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Apex Developer Guide',
                desc: 'Official Salesforce documentation for Apex development.',
                url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/',
              },
              {
                title: 'Trailhead',
                desc: 'Free interactive learning platform with guided trails and projects.',
                url: 'https://trailhead.salesforce.com/',
              },
              {
                title: 'Apex Design Patterns',
                desc: 'Common design patterns adapted for the Salesforce platform.',
                url: 'https://developer.salesforce.com/wiki/apex_enterprise_patterns',
              },
              {
                title: 'Governor Limits Reference',
                desc: 'Complete reference for Apex governor limits and best practices.',
                url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm',
              },
              {
                title: 'Stack Exchange',
                desc: 'Community Q&A for Salesforce developers and administrators.',
                url: 'https://salesforce.stackexchange.com/',
              },
              {
                title: 'Apex Hours',
                desc: 'Video tutorials and webinars on advanced Salesforce topics.',
                url: 'https://www.apexhours.com/',
              },
            ].map(resource => (
              <a
                key={resource.title}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 bg-gray-900/80 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-all"
              >
                <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-cyan-400 mt-0.5 flex-shrink-0 transition-colors" />
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{resource.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
