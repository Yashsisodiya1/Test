import { useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor, { type OnMount } from '@monaco-editor/react';
import {
  ArrowLeft,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Loader2,
  FileText,
  TestTube2,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { getProblemBySlug, type TestCase } from '../data/problems';
import DifficultyBadge from '../components/DifficultyBadge';
import CategoryIcon from '../components/CategoryIcon';
import { useAuth, API_URL } from '../context/AuthContext';

type Tab = 'description' | 'solution' | 'hints';
type ResultStatus = 'idle' | 'running' | 'passed' | 'failed' | 'compilation_error';

interface TestResult {
  testCase: TestCase;
  status: 'passed' | 'failed';
  output: string;
  executionTime: number;
}

interface BackendTestResult {
  id: number;
  description: string;
  status: 'passed' | 'failed';
  expected: string;
  actual: string;
  execution_time_ms: number;
}

interface ExecutionResponse {
  compiled: boolean;
  compilation_errors: string[];
  lint_warnings: { message: string; severity: string }[];
  test_results: BackendTestResult[];
  execution_time_ms: number;
  debug_log: string[];
  overall_status: string;
}

export default function ProblemDetail() {
  const { slug } = useParams<{ slug: string }>();
  const problem = getProblemBySlug(slug || '');
  const [code, setCode] = useState(problem?.starterCode || '');
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [resultStatus, setResultStatus] = useState<ResultStatus>('idle');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [, setLintWarnings] = useState<{ message: string; severity: string }[]>([]);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { token } = useAuth();

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleReset = useCallback(() => {
    if (problem) {
      setCode(problem.starterCode);
      setResultStatus('idle');
      setTestResults([]);
      setConsoleOutput([]);
      setShowTestPanel(false);
    }
  }, [problem]);

  const executeCode = useCallback(async () => {
    if (!problem) return;

    setResultStatus('running');
    setShowTestPanel(true);
    setConsoleOutput(['Compiling Apex code...', 'Sending to execution engine...']);
    setLintWarnings([]);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          problem_id: problem.id,
          code: code,
          language: 'apex',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Execution failed');
      }

      const data: ExecutionResponse = await res.json();

      // Handle compilation errors
      if (!data.compiled) {
        setResultStatus('compilation_error');
        setConsoleOutput([
          'Compilation Failed!',
          '',
          ...data.compilation_errors,
        ]);
        setTestResults([]);
        return;
      }

      // Set lint warnings
      if (data.lint_warnings.length > 0) {
        setLintWarnings(data.lint_warnings);
      }

      // Map backend results to frontend format
      const results: TestResult[] = data.test_results.map((tr, idx) => ({
        testCase: problem.testCases[idx] || {
          id: tr.id,
          input: '',
          expectedOutput: tr.expected,
          description: tr.description,
        },
        status: tr.status,
        output: tr.actual,
        executionTime: tr.execution_time_ms,
      }));

      setTestResults(results);
      setResultStatus(data.overall_status === 'passed' ? 'passed' : 'failed');
      setConsoleOutput(data.debug_log);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      setResultStatus('failed');
      setConsoleOutput([
        'Error connecting to execution engine:',
        message,
        '',
        'Please try again.',
      ]);
    }
  }, [code, problem, token]);

  if (!problem) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Problem Not Found</h2>
          <p className="text-gray-500 mb-4">The problem you're looking for doesn't exist.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'hints', label: 'Hints', icon: Lightbulb },
    { id: 'solution', label: 'Solution', icon: BookOpen },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row bg-gray-950">
      {/* Left Panel - Description */}
      <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col border-r border-gray-800 overflow-hidden">
        {/* Problem Header */}
        <div className="flex-shrink-0 border-b border-gray-800 p-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-cyan-400 text-sm mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Problems
          </Link>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
              <div className="flex items-center flex-wrap gap-2">
                <DifficultyBadge difficulty={problem.difficulty} />
                <div className="flex items-center gap-1.5">
                  <CategoryIcon category={problem.category} size={14} />
                  <span className="text-sm text-gray-400">{problem.category}</span>
                </div>
                <span className="text-xs text-gray-600">|</span>
                <span className="text-xs text-gray-500">
                  {problem.submissions.toLocaleString()} submissions
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex border-b border-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'description' && (
            <div className="space-y-6">
              {/* Description as formatted text */}
              <div className="prose prose-invert prose-sm max-w-none">
                {problem.description.split('\n').map((line, i) => {
                  if (line.startsWith('## '))
                    return (
                      <h2 key={i} className="text-lg font-bold text-white mt-0">
                        {line.replace('## ', '')}
                      </h2>
                    );
                  if (line.startsWith('### '))
                    return (
                      <h3 key={i} className="text-base font-semibold text-gray-200 mt-4">
                        {line.replace('### ', '')}
                      </h3>
                    );
                  if (line.startsWith('- '))
                    return (
                      <li key={i} className="text-gray-400 text-sm ml-4">
                        {line
                          .replace('- ', '')
                          .split(/(`[^`]+`)/)
                          .map((part, j) =>
                            part.startsWith('`') && part.endsWith('`') ? (
                              <code
                                key={j}
                                className="bg-gray-800 text-cyan-300 px-1 py-0.5 rounded text-xs"
                              >
                                {part.slice(1, -1)}
                              </code>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                      </li>
                    );
                  if (line.trim() === '') return <div key={i} className="h-2" />;
                  return (
                    <p key={i} className="text-gray-400 text-sm leading-relaxed">
                      {line
                        .split(/(\*\*[^*]+\*\*|`[^`]+`|\\"[^"]+\\")/)
                        .map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**'))
                            return (
                              <strong key={j} className="text-white">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          if (part.startsWith('`') && part.endsWith('`'))
                            return (
                              <code
                                key={j}
                                className="bg-gray-800 text-cyan-300 px-1 py-0.5 rounded text-xs"
                              >
                                {part.slice(1, -1)}
                              </code>
                            );
                          if (part.startsWith('\\"') && part.endsWith('\\"'))
                            return (
                              <span key={j} className="text-amber-300">
                                {part}
                              </span>
                            );
                          return <span key={j}>{part}</span>;
                        })}
                    </p>
                  );
                })}
              </div>

              {/* Constraints */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-3">Constraints</h4>
                <ul className="space-y-2">
                  {problem.constraints.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-cyan-400 mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Examples</h4>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Input
                        </span>
                        <p className="text-sm text-gray-300 font-mono mt-1">{ex.input}</p>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Output
                        </span>
                        <p className="text-sm text-gray-300 font-mono mt-1">{ex.output}</p>
                      </div>
                      {ex.explanation && (
                        <div>
                          <span className="text-xs font-semibold text-gray-500 uppercase">
                            Explanation
                          </span>
                          <p className="text-sm text-gray-400 mt-1">{ex.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {problem.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md border border-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'hints' && (
            <div className="space-y-4">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-300">Hint 1: Approach</h4>
                </div>
                <p className="text-sm text-gray-400">
                  Start by collecting all the relevant data from Trigger.new into a Set or Map.
                  This avoids repetitive processing and sets you up for bulkification.
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-300">
                    Hint 2: Bulkification
                  </h4>
                </div>
                <p className="text-sm text-gray-400">
                  Remember: never put SOQL queries or DML operations inside loops. Query all
                  needed data before the loop, then process records in memory.
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                  <h4 className="text-sm font-semibold text-amber-300">
                    Hint 3: Error Handling
                  </h4>
                </div>
                <p className="text-sm text-gray-400">
                  Use <code className="text-cyan-300 bg-gray-800 px-1 rounded">addError()</code>{' '}
                  on the specific record in before triggers. This marks only the problematic
                  record without failing the entire batch.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-400" />
                  <h4 className="text-sm font-semibold text-blue-300">Solution Guide</h4>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  Try solving the problem yourself first! The solution is hidden to encourage
                  learning. Here's a general approach:
                </p>
                <ol className="space-y-2 text-sm text-gray-400 list-decimal list-inside">
                  <li>Understand the trigger context (before/after, insert/update/delete)</li>
                  <li>Collect data from Trigger.new/Trigger.old into collections</li>
                  <li>Perform any needed SOQL queries (outside loops)</li>
                  <li>Process records using the queried data</li>
                  <li>For before triggers: modify records directly or addError()</li>
                  <li>For after triggers: collect DML operations and execute in bulk</li>
                </ol>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Key Apex Patterns</h4>
                <pre className="text-xs text-gray-400 overflow-x-auto">
                  {`// Bulkified trigger pattern
Set<String> names = new Set<String>();
for (Account acc : Trigger.new) {
    names.add(acc.Name);
}

// Single SOQL query
Map<String, Account> existingMap = new Map<String, Account>();
for (Account acc : [SELECT Name FROM Account WHERE Name IN :names]) {
    existingMap.put(acc.Name, acc);
}

// Process in memory
for (Account acc : Trigger.new) {
    if (existingMap.containsKey(acc.Name)) {
        acc.addError('Duplicate found');
    }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Editor & Results */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400">Apex</span>
            <span className="text-xs text-gray-600">|</span>
            <span className="text-xs text-gray-500">UTF-8</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
            <button
              onClick={executeCode}
              disabled={resultStatus === 'running'}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
            >
              {resultStatus === 'running' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {resultStatus === 'running' ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="flex-1 min-h-0">
          <Editor
            height="100%"
            defaultLanguage="java"
            theme="vs-dark"
            value={code}
            onChange={v => setCode(v || '')}
            onMount={handleEditorMount}
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              suggest: {
                showKeywords: true,
              },
            }}
          />
        </div>

        {/* Test Results Panel */}
        <div
          className={`flex-shrink-0 border-t border-gray-800 bg-gray-900 transition-all ${
            showTestPanel ? 'max-h-80' : 'max-h-10'
          }`}
        >
          {/* Toggle Header */}
          <button
            onClick={() => setShowTestPanel(!showTestPanel)}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TestTube2 className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-400">Test Results</span>
              {resultStatus === 'passed' && (
                <span className="flex items-center gap-1 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  All Passed
                </span>
              )}
              {resultStatus === 'failed' && (
                <span className="flex items-center gap-1 text-xs text-red-400">
                  <XCircle className="h-3.5 w-3.5" />
                  Some Failed
                </span>
              )}
              {resultStatus === 'compilation_error' && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <XCircle className="h-3.5 w-3.5" />
                  Compilation Error
                </span>
              )}
              {resultStatus === 'running' && (
                <span className="flex items-center gap-1 text-xs text-amber-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Running...
                </span>
              )}
            </div>
            {showTestPanel ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {/* Results Content */}
          {showTestPanel && (
            <div className="overflow-y-auto max-h-64 px-4 pb-4">
              {/* Test Case Results */}
              {testResults.length > 0 && (
                <div className="space-y-2 mb-4">
                  {testResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        result.status === 'passed'
                          ? 'bg-emerald-500/5 border-emerald-500/20'
                          : 'bg-red-500/5 border-red-500/20'
                      }`}
                    >
                      {result.status === 'passed' ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-white">
                            Test Case {idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {result.executionTime}ms
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {result.testCase.description}
                        </p>
                        {result.status === 'failed' && (
                          <div className="mt-2 space-y-1">
                            <div className="text-xs">
                              <span className="text-gray-500">Expected: </span>
                              <code className="text-emerald-300 bg-gray-800 px-1 py-0.5 rounded">
                                {result.testCase.expectedOutput}
                              </code>
                            </div>
                            <div className="text-xs">
                              <span className="text-gray-500">Got: </span>
                              <code className="text-red-300 bg-gray-800 px-1 py-0.5 rounded">
                                {result.output}
                              </code>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Console Output */}
              {consoleOutput.length > 0 && (
                <div className="bg-gray-950 rounded-lg p-3 border border-gray-800">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Console</h5>
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                    {consoleOutput.join('\n')}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
