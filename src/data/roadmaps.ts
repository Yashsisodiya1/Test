export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'topic' | 'subtopic' | 'checkpoint';
  status: 'locked' | 'available' | 'completed';
  resources: { title: string; url: string; type: 'doc' | 'video' | 'article' | 'practice' }[];
  tips: string[];
}

export interface RoadmapSection {
  id: string;
  title: string;
  color: string;
  nodes: RoadmapNode[];
}

export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  totalNodes: number;
  estimatedHours: number;
  level: string;
  sections: RoadmapSection[];
}

export const roadmaps: Roadmap[] = [
  {
    id: 'apex-developer',
    slug: 'apex-developer',
    title: 'Apex Developer',
    description: 'Complete roadmap to become a proficient Salesforce Apex developer. From basic syntax to advanced patterns and deployment.',
    icon: 'code',
    color: 'from-cyan-500 to-blue-600',
    totalNodes: 32,
    estimatedHours: 80,
    level: 'Beginner to Advanced',
    sections: [
      {
        id: 'foundations',
        title: '1. Foundations',
        color: 'emerald',
        nodes: [
          {
            id: 'apex-basics',
            title: 'Apex Language Basics',
            description: 'Learn the fundamental syntax, data types, and control structures of Apex. Understand how Apex differs from Java and other languages.',
            type: 'milestone',
            status: 'available',
            resources: [
              { title: 'Apex Developer Guide - Getting Started', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_intro.htm', type: 'doc' },
              { title: 'Trailhead: Apex Basics & Database', url: 'https://trailhead.salesforce.com/content/learn/modules/apex_database', type: 'practice' },
            ],
            tips: ['Apex is strongly typed and runs on the Lightning Platform', 'All Apex code runs in a multi-tenant environment with governor limits'],
          },
          {
            id: 'data-types',
            title: 'Data Types & Variables',
            description: 'Master primitive types (Integer, String, Boolean, Date, Datetime), sObjects, collections (List, Set, Map), and type casting.',
            type: 'topic',
            status: 'available',
            resources: [
              { title: 'Apex Data Types', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_chapter.htm', type: 'doc' },
            ],
            tips: ['Use Map<Id, SObject> for efficient lookups', 'Sets automatically handle deduplication'],
          },
          {
            id: 'control-flow',
            title: 'Control Flow & Loops',
            description: 'If/else statements, switch/when, for loops, while loops, and for-each iterations over collections.',
            type: 'topic',
            status: 'available',
            resources: [
              { title: 'Control Flow Statements', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_control_flow.htm', type: 'doc' },
            ],
            tips: ['Prefer for-each loops when iterating over collections', 'Switch/when was introduced in API v42.0'],
          },
          {
            id: 'soql-sosl',
            title: 'SOQL & SOSL',
            description: 'Write Salesforce Object Query Language queries to retrieve data. Understand relationship queries, aggregate functions, and SOSL for full-text search.',
            type: 'topic',
            status: 'available',
            resources: [
              { title: 'SOQL and SOSL Reference', url: 'https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/', type: 'doc' },
              { title: 'Trailhead: SOQL for Admins', url: 'https://trailhead.salesforce.com/content/learn/modules/soql-for-admins', type: 'practice' },
            ],
            tips: ['Always filter queries to return only needed records', 'Use relationship queries to reduce the number of SOQL calls'],
          },
          {
            id: 'dml-operations',
            title: 'DML Operations',
            description: 'Insert, update, upsert, delete, undelete, and merge records. Understand partial success with Database methods.',
            type: 'topic',
            status: 'available',
            resources: [
              { title: 'DML Statements vs Database Methods', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/langCon_apex_dml.htm', type: 'doc' },
            ],
            tips: ['Use Database.insert(records, false) for partial success', 'Always perform DML outside of loops'],
          },
          {
            id: 'checkpoint-1',
            title: 'Checkpoint: Build a Contact Manager',
            description: 'Practice exercise: Build a class that queries, creates, and updates Contact records using SOQL and DML.',
            type: 'checkpoint',
            status: 'locked',
            resources: [],
            tips: ['Combine SOQL queries with DML operations', 'Handle edge cases like null values'],
          },
        ],
      },
      {
        id: 'triggers',
        title: '2. Triggers',
        color: 'amber',
        nodes: [
          {
            id: 'trigger-basics',
            title: 'Trigger Fundamentals',
            description: 'Understand trigger events (before/after insert/update/delete/undelete), context variables (Trigger.new, Trigger.old, Trigger.newMap, Trigger.oldMap), and when to use each.',
            type: 'milestone',
            status: 'locked',
            resources: [
              { title: 'Apex Triggers', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers.htm', type: 'doc' },
              { title: 'Trailhead: Apex Triggers', url: 'https://trailhead.salesforce.com/content/learn/modules/apex_triggers', type: 'practice' },
            ],
            tips: ['Before triggers can modify field values without DML', 'After triggers have access to record IDs'],
          },
          {
            id: 'bulkification',
            title: 'Bulkification',
            description: 'Never put SOQL or DML inside loops. Collect data, query once, process in memory, and perform DML once. Handle up to 200 records per trigger invocation.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Bulk Apex Triggers', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_bulk.htm', type: 'doc' },
            ],
            tips: ['Collect IDs/values into Sets, query with WHERE IN :setName', 'Use Maps for O(1) lookups instead of nested loops'],
          },
          {
            id: 'trigger-patterns',
            title: 'Trigger Handler Patterns',
            description: 'Implement the trigger handler pattern to separate trigger logic from the trigger itself. One trigger per object with a handler class.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Trigger Handler Framework', url: 'https://developer.salesforce.com/wiki/trigger_frameworks_and_apex_trigger_best_practices', type: 'article' },
            ],
            tips: ['One trigger per object is the best practice', 'Use a handler class to keep triggers clean and testable'],
          },
          {
            id: 'recursion-prevention',
            title: 'Recursion Prevention',
            description: 'Handle recursive trigger scenarios using static variables, trigger context checks, and the proper use of before vs after triggers.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Use a static Boolean or Set<Id> to track processed records', 'Consider using a static class to manage trigger state'],
          },
          {
            id: 'order-of-execution',
            title: 'Order of Execution',
            description: 'Understand the complete order of execution in Salesforce: validation rules, before triggers, after triggers, workflow rules, process builders, and flows.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Triggers and Order of Execution', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_order_of_execution.htm', type: 'doc' },
            ],
            tips: ['Before triggers fire before validation rules', 'Workflow field updates cause triggers to re-fire'],
          },
          {
            id: 'checkpoint-2',
            title: 'Checkpoint: Build a Trigger Suite',
            description: 'Build triggers for Account, Contact, and Opportunity with proper bulkification, handler classes, and recursion prevention.',
            type: 'checkpoint',
            status: 'locked',
            resources: [],
            tips: ['Test with bulk data using Data Loader', 'Verify triggers work with both single and bulk operations'],
          },
        ],
      },
      {
        id: 'oop-patterns',
        title: '3. OOP & Design Patterns',
        color: 'blue',
        nodes: [
          {
            id: 'classes-interfaces',
            title: 'Classes & Interfaces',
            description: 'Create Apex classes with constructors, methods, properties. Implement interfaces for polymorphism. Understand access modifiers (public, private, global, protected).',
            type: 'milestone',
            status: 'locked',
            resources: [
              { title: 'Classes, Objects, and Interfaces', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes.htm', type: 'doc' },
            ],
            tips: ['Use interfaces to define contracts', 'Global classes are accessible across namespaces'],
          },
          {
            id: 'service-layer',
            title: 'Service Layer Pattern',
            description: 'Implement a service layer to encapsulate business logic. Keep triggers thin and services reusable across triggers, VF, LWC, and APIs.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Enterprise Patterns - Service Layer', url: 'https://developer.salesforce.com/wiki/apex_enterprise_patterns_-_service_layer', type: 'article' },
            ],
            tips: ['Services should be stateless', 'Name services by domain: AccountService, OpportunityService'],
          },
          {
            id: 'selector-pattern',
            title: 'Selector Pattern',
            description: 'Centralize SOQL queries in selector classes. Ensure consistent field sets, security checks, and query optimization across the codebase.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Selectors return List<SObject> or Map<Id, SObject>', 'Always include security checks in selectors'],
          },
          {
            id: 'domain-layer',
            title: 'Domain Layer Pattern',
            description: 'Implement domain classes that encapsulate record-level behavior. Validate, default, and transform record data in a reusable way.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Domain classes wrap SObject records', 'Use for complex validation and business rules'],
          },
          {
            id: 'exception-handling',
            title: 'Exception Handling',
            description: 'Create custom exceptions, use try-catch-finally blocks, and implement error handling strategies that provide meaningful feedback.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Exception Class and Built-In Exceptions', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_exception_definition.htm', type: 'doc' },
            ],
            tips: ['Never catch generic Exception without logging', 'Use Database.SaveResult for granular error handling'],
          },
        ],
      },
      {
        id: 'async-apex',
        title: '4. Asynchronous Apex',
        color: 'purple',
        nodes: [
          {
            id: 'future-methods',
            title: 'Future Methods',
            description: 'Use @future for simple async operations like callouts from triggers. Understand limitations: no chaining, limited parameter types.',
            type: 'milestone',
            status: 'locked',
            resources: [
              { title: 'Future Methods', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_annotation_future.htm', type: 'doc' },
            ],
            tips: ['Use @future(callout=true) for HTTP callouts', 'Future methods cannot call other future methods'],
          },
          {
            id: 'batch-apex',
            title: 'Batch Apex',
            description: 'Process large data volumes with Database.Batchable interface. Implement start(), execute(), and finish() methods. Handle up to 50M records.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Batch Apex', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_batch_interface.htm', type: 'doc' },
            ],
            tips: ['Default batch size is 200, configurable 1-2000', 'Use Database.Stateful to maintain state across batches'],
          },
          {
            id: 'queueable-apex',
            title: 'Queueable Apex',
            description: 'Chain async jobs with Queueable interface. Pass complex objects, monitor job status, and handle failures gracefully.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Queueable Apex', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_queueing_jobs.htm', type: 'doc' },
            ],
            tips: ['Queueable jobs can be chained (one child per job)', 'Use System.enqueueJob() to start a queueable job'],
          },
          {
            id: 'scheduled-apex',
            title: 'Scheduled Apex',
            description: 'Schedule Apex to run at specific times using cron expressions. Combine with Batch Apex for scheduled data processing.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Schedulable Interface', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_scheduler.htm', type: 'doc' },
            ],
            tips: ['Use System.schedule() with cron expression', 'Scheduled jobs count toward the async apex limit'],
          },
          {
            id: 'platform-events',
            title: 'Platform Events',
            description: 'Publish and subscribe to platform events for event-driven architecture. Decouple processes and enable real-time integrations.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Platform Events Developer Guide', url: 'https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/', type: 'doc' },
            ],
            tips: ['Platform events are published immediately', 'Use EventBus.publish() for fine-grained control'],
          },
        ],
      },
      {
        id: 'testing',
        title: '5. Testing & Quality',
        color: 'rose',
        nodes: [
          {
            id: 'test-fundamentals',
            title: 'Test Class Fundamentals',
            description: 'Write @isTest classes with @testSetup methods. Achieve 75%+ code coverage. Use System.assert methods for verification.',
            type: 'milestone',
            status: 'locked',
            resources: [
              { title: 'Apex Testing', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing.htm', type: 'doc' },
              { title: 'Trailhead: Apex Testing', url: 'https://trailhead.salesforce.com/content/learn/modules/apex_testing', type: 'practice' },
            ],
            tips: ['75% coverage is minimum, aim for 90%+', 'Test positive, negative, and bulk scenarios'],
          },
          {
            id: 'test-data-factory',
            title: 'Test Data Factory',
            description: 'Build reusable test data factories that create consistent, valid test records. Use @testSetup for efficient test data creation.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Create a TestDataFactory class for reusable test data', 'Never rely on existing org data in tests'],
          },
          {
            id: 'mocking-stubbing',
            title: 'Mocking & Stubbing',
            description: 'Use HttpCalloutMock, WebServiceMock, and StubProvider for testing external integrations without actual callouts.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Implement HttpCalloutMock for REST callout tests', 'Use Test.setMock() to register mock implementations'],
          },
          {
            id: 'governor-limits',
            title: 'Governor Limits & Optimization',
            description: 'Understand and work within Salesforce governor limits. Optimize queries, reduce DML operations, and manage CPU time.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Execution Governors and Limits', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm', type: 'doc' },
            ],
            tips: ['100 SOQL queries per transaction', '150 DML statements per transaction', '10 seconds CPU time limit'],
          },
        ],
      },
      {
        id: 'integration',
        title: '6. Integration & Advanced',
        color: 'orange',
        nodes: [
          {
            id: 'rest-apis',
            title: 'REST API Development',
            description: 'Build custom REST endpoints with @RestResource. Handle GET, POST, PUT, PATCH, DELETE methods with proper error responses.',
            type: 'milestone',
            status: 'locked',
            resources: [
              { title: 'Apex REST Web Services', url: 'https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_rest.htm', type: 'doc' },
            ],
            tips: ['Use @RestResource(urlMapping=\'/api/v1/*\')', 'Return proper HTTP status codes'],
          },
          {
            id: 'http-callouts',
            title: 'HTTP Callouts',
            description: 'Make outbound REST and SOAP calls to external services. Use Named Credentials for secure authentication.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Always use Named Credentials over hard-coded URLs', 'Handle timeout and error scenarios'],
          },
          {
            id: 'lwc-integration',
            title: 'LWC & Apex Integration',
            description: 'Expose Apex methods to Lightning Web Components using @AuraEnabled. Handle wire services and imperative calls.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Call Apex Methods from LWC', url: 'https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.apex', type: 'doc' },
            ],
            tips: ['Use @AuraEnabled(cacheable=true) for wire services', 'Handle errors with try-catch in LWC'],
          },
          {
            id: 'deployment',
            title: 'Deployment & DevOps',
            description: 'Use Salesforce CLI (sf/sfdx), scratch orgs, and CI/CD pipelines. Understand metadata deployment, source tracking, and version control.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Salesforce CLI Setup Guide', url: 'https://developer.salesforce.com/tools/salesforcecli', type: 'doc' },
            ],
            tips: ['Use scratch orgs for development', 'Implement CI/CD with GitHub Actions or similar'],
          },
          {
            id: 'checkpoint-final',
            title: 'Final Project: Full-Stack Salesforce App',
            description: 'Build a complete application with triggers, services, tests, integrations, and LWC components. Deploy using CI/CD.',
            type: 'checkpoint',
            status: 'locked',
            resources: [],
            tips: ['Apply all patterns learned throughout the roadmap', 'Document your architecture decisions'],
          },
        ],
      },
    ],
  },
  {
    id: 'salesforce-admin-to-dev',
    slug: 'admin-to-developer',
    title: 'Admin to Developer',
    description: 'Transition from Salesforce Admin to Developer. Bridge the gap between declarative and programmatic solutions.',
    icon: 'graduation',
    color: 'from-purple-500 to-pink-500',
    totalNodes: 24,
    estimatedHours: 60,
    level: 'Admin → Developer',
    sections: [
      {
        id: 'declarative-review',
        title: '1. Declarative Foundation Review',
        color: 'emerald',
        nodes: [
          {
            id: 'when-to-code',
            title: 'When to Code vs Configure',
            description: 'Understand when declarative tools (Flow, Process Builder, Validation Rules) are sufficient and when Apex code is needed.',
            type: 'milestone',
            status: 'available',
            resources: [
              { title: 'Clicks vs Code', url: 'https://trailhead.salesforce.com/content/learn/modules/business_process_automation', type: 'practice' },
            ],
            tips: ['Always try declarative first', 'Code when you need complex logic, integrations, or governor limit control'],
          },
          {
            id: 'flow-limitations',
            title: 'Flow & Process Builder Limits',
            description: 'Know the limitations of Flows and Process Builder that drive the need for Apex solutions.',
            type: 'topic',
            status: 'available',
            resources: [],
            tips: ['Flows have governor limits too', 'Complex branching logic is often cleaner in Apex'],
          },
          {
            id: 'data-model-mastery',
            title: 'Data Model Deep Dive',
            description: 'Understand relationships, junction objects, and how the data model impacts code architecture.',
            type: 'topic',
            status: 'available',
            resources: [],
            tips: ['Master parent-child and lookup relationships', 'Understand how cascade delete affects triggers'],
          },
        ],
      },
      {
        id: 'first-code',
        title: '2. Your First Code',
        color: 'amber',
        nodes: [
          {
            id: 'dev-console',
            title: 'Developer Console & VS Code',
            description: 'Set up your development environment with Developer Console and VS Code with Salesforce Extensions.',
            type: 'milestone',
            status: 'locked',
            resources: [
              { title: 'VS Code for Salesforce', url: 'https://developer.salesforce.com/tools/vscode', type: 'doc' },
            ],
            tips: ['VS Code + Salesforce Extensions is the recommended IDE', 'Use Anonymous Apex in Dev Console for quick testing'],
          },
          {
            id: 'apex-for-admins',
            title: 'Apex Syntax for Admins',
            description: 'Learn Apex syntax with analogies to admin concepts you already know. Variables are like fields, methods are like flows.',
            type: 'topic',
            status: 'locked',
            resources: [
              { title: 'Trailhead: Apex Basics', url: 'https://trailhead.salesforce.com/content/learn/modules/apex_database', type: 'practice' },
            ],
            tips: ['Think of Apex classes as advanced Flow actions', 'SOQL is just a programmatic version of List Views and Reports'],
          },
          {
            id: 'first-trigger',
            title: 'Your First Trigger',
            description: 'Write your first trigger to automate record changes. Understand how it relates to Workflow Rules and Flows you already know.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Start with a simple before insert trigger', 'Compare it to a Record-Triggered Flow'],
          },
          {
            id: 'invocable-apex',
            title: 'Invocable Apex for Flows',
            description: 'Write @InvocableMethod and @InvocableVariable classes that extend your Flows with custom Apex logic.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['This is the easiest bridge between admin and developer', 'Invocable methods appear as Flow actions'],
          },
        ],
      },
      {
        id: 'growing-skills',
        title: '3. Growing Your Skills',
        color: 'blue',
        nodes: [
          {
            id: 'testing-basics',
            title: 'Testing for Admins-turned-Devs',
            description: 'Write test classes to deploy your code. Understand why testing matters and how to achieve 75%+ coverage.',
            type: 'milestone',
            status: 'locked',
            resources: [],
            tips: ['Think of tests as automated QA', 'Each test method verifies one behavior'],
          },
          {
            id: 'error-handling-admin',
            title: 'Error Handling & Debugging',
            description: 'Use debug logs, try-catch blocks, and System.debug to find and fix issues in your code.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Debug logs are your best friend', 'Always add meaningful error messages'],
          },
          {
            id: 'version-control',
            title: 'Git & Version Control',
            description: 'Learn Git basics for managing your Apex code. Branching, committing, and collaborating with other developers.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Start with git add, commit, push', 'Use feature branches for each change'],
          },
          {
            id: 'certification-prep',
            title: 'Platform Developer I Prep',
            description: 'Prepare for the Salesforce Platform Developer I certification with focused study on exam objectives.',
            type: 'checkpoint',
            status: 'locked',
            resources: [
              { title: 'PD1 Exam Guide', url: 'https://trailhead.salesforce.com/en/credentials/platformdeveloperi', type: 'doc' },
            ],
            tips: ['Focus on trigger context variables and bulk patterns', 'Practice with mock exams'],
          },
        ],
      },
    ],
  },
  {
    id: 'integration-specialist',
    slug: 'integration-specialist',
    title: 'Integration Specialist',
    description: 'Master Salesforce integrations — REST, SOAP, Platform Events, Change Data Capture, and external system connectivity.',
    icon: 'globe',
    color: 'from-orange-500 to-red-500',
    totalNodes: 20,
    estimatedHours: 50,
    level: 'Intermediate to Advanced',
    sections: [
      {
        id: 'integration-fundamentals',
        title: '1. Integration Fundamentals',
        color: 'emerald',
        nodes: [
          {
            id: 'integration-patterns',
            title: 'Integration Patterns Overview',
            description: 'Understand request-reply, fire-and-forget, batch data sync, and remote call-in patterns for Salesforce integrations.',
            type: 'milestone',
            status: 'available',
            resources: [
              { title: 'Integration Patterns', url: 'https://developer.salesforce.com/docs/atlas.en-us.integration_patterns_and_practices.meta/integration_patterns_and_practices/', type: 'doc' },
            ],
            tips: ['Choose the right pattern based on data volume and latency requirements', 'Consider governor limits when designing integrations'],
          },
          {
            id: 'auth-mechanisms',
            title: 'Authentication Mechanisms',
            description: 'OAuth 2.0 flows, JWT Bearer, Named Credentials, and Connected Apps for secure API authentication.',
            type: 'topic',
            status: 'available',
            resources: [],
            tips: ['Named Credentials abstract auth complexity', 'Use JWT for server-to-server integrations'],
          },
          {
            id: 'data-formats',
            title: 'Data Formats & Serialization',
            description: 'JSON and XML serialization/deserialization in Apex. Custom serialization, wrapper classes, and handling nested structures.',
            type: 'topic',
            status: 'available',
            resources: [],
            tips: ['Use JSON.deserialize() with a wrapper class for type safety', 'JSON.serializePretty() for debugging'],
          },
        ],
      },
      {
        id: 'outbound-integrations',
        title: '2. Outbound Integrations',
        color: 'amber',
        nodes: [
          {
            id: 'rest-callouts',
            title: 'REST Callouts',
            description: 'Make HTTP GET, POST, PUT, PATCH, DELETE requests to external APIs. Handle responses, errors, and timeouts.',
            type: 'milestone',
            status: 'locked',
            resources: [],
            tips: ['Set timeout to prevent long-running callouts', 'Always test with HttpCalloutMock'],
          },
          {
            id: 'soap-callouts',
            title: 'SOAP Callouts & WSDL',
            description: 'Generate Apex classes from WSDL files. Make SOAP callouts and handle complex XML responses.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Use WSDL2Apex to generate stub classes', 'SOAP is still common in enterprise integrations'],
          },
          {
            id: 'async-callouts',
            title: 'Async Callouts',
            description: 'Use @future(callout=true), Queueable with callouts, and Continuation for long-running operations.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Cannot make callouts from triggers directly', 'Use Queueable for chained callout sequences'],
          },
        ],
      },
      {
        id: 'inbound-integrations',
        title: '3. Inbound Integrations',
        color: 'blue',
        nodes: [
          {
            id: 'rest-services',
            title: 'Custom REST Services',
            description: 'Build REST APIs with @RestResource. Define URL mappings, handle parameters, and return proper responses.',
            type: 'milestone',
            status: 'locked',
            resources: [],
            tips: ['Use meaningful URL mappings', 'Return proper HTTP status codes (200, 201, 400, 404, 500)'],
          },
          {
            id: 'soap-services',
            title: 'Custom SOAP Services',
            description: 'Expose Apex classes as SOAP web services using the webservice keyword. Generate WSDL for external consumers.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Use webservice keyword for SOAP endpoints', 'SOAP is preferred for complex type contracts'],
          },
          {
            id: 'event-driven',
            title: 'Event-Driven Architecture',
            description: 'Platform Events, Change Data Capture, and Streaming API for real-time data synchronization.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Platform Events for custom events', 'CDC for automatic change tracking'],
          },
        ],
      },
      {
        id: 'advanced-integration',
        title: '4. Advanced Patterns',
        color: 'purple',
        nodes: [
          {
            id: 'error-recovery',
            title: 'Error Handling & Recovery',
            description: 'Retry patterns, dead letter queues, circuit breakers, and monitoring for robust integrations.',
            type: 'milestone',
            status: 'locked',
            resources: [],
            tips: ['Implement exponential backoff for retries', 'Log all integration failures for monitoring'],
          },
          {
            id: 'bulk-apis',
            title: 'Bulk Data Integration',
            description: 'Handle large data volumes with Bulk API, Batch Apex, and efficient data loading strategies.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Use Bulk API 2.0 for large data loads', 'Batch Apex can process up to 50M records'],
          },
          {
            id: 'integration-testing',
            title: 'Integration Testing',
            description: 'Test integrations with mocks, stubs, and integration test environments. Verify end-to-end data flow.',
            type: 'topic',
            status: 'locked',
            resources: [],
            tips: ['Always use mock classes for unit tests', 'Create integration test suites for end-to-end verification'],
          },
          {
            id: 'integration-cert',
            title: 'Integration Architect Cert Prep',
            description: 'Prepare for the Salesforce Integration Architecture Designer certification.',
            type: 'checkpoint',
            status: 'locked',
            resources: [
              { title: 'Integration Architecture Designer', url: 'https://trailhead.salesforce.com/en/credentials/integrationarchitecturedesigner', type: 'doc' },
            ],
            tips: ['Focus on pattern selection and trade-offs', 'Study the integration patterns documentation thoroughly'],
          },
        ],
      },
    ],
  },
];

export function getRoadmapBySlug(slug: string): Roadmap | undefined {
  return roadmaps.find(r => r.slug === slug);
}
