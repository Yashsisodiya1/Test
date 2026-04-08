export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  type: 'video' | 'reading' | 'exercise' | 'quiz' | 'project';
  content: string;
  completed: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  color: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  totalLessons: number;
  modules: Module[];
  prerequisites: string[];
  outcomes: string[];
  author: string;
  rating: number;
  enrolled: number;
}

export const courses: Course[] = [
  {
    id: 'apex-triggers-101',
    slug: 'apex-triggers-101',
    title: 'Apex Triggers from Zero to Hero',
    description: 'Master Apex triggers with hands-on exercises. Learn bulkification, context variables, handler patterns, and real-world best practices.',
    longDescription: 'This comprehensive course takes you from writing your first trigger to implementing enterprise-grade trigger frameworks. Each module builds on the previous one with hands-on exercises that mirror real Salesforce development scenarios. You will learn to write efficient, bulkified triggers that follow Salesforce best practices and can handle up to 200 records per invocation.',
    icon: 'zap',
    color: 'from-yellow-500 to-amber-500',
    level: 'Beginner',
    duration: '6 hours',
    totalLessons: 18,
    prerequisites: ['Basic understanding of Salesforce objects and fields', 'Familiarity with any programming language is helpful but not required'],
    outcomes: [
      'Write before and after triggers for any Salesforce object',
      'Bulkify triggers to handle up to 200 records efficiently',
      'Implement trigger handler frameworks used in enterprise orgs',
      'Prevent trigger recursion and understand order of execution',
      'Write test classes for triggers with 90%+ coverage',
    ],
    author: 'Apex Academy',
    rating: 4.8,
    enrolled: 3420,
    modules: [
      {
        id: 'triggers-intro',
        title: 'Introduction to Triggers',
        description: 'Understand what triggers are, when they execute, and the different trigger events available.',
        lessons: [
          {
            id: 'what-are-triggers',
            title: 'What Are Apex Triggers?',
            description: 'Understanding triggers as database event listeners in Salesforce.',
            duration: '15 min',
            type: 'reading',
            content: `# What Are Apex Triggers?

Apex triggers are pieces of code that execute before or after specific data manipulation language (DML) events occur in Salesforce. Think of them as event listeners for your database.

## When Do Triggers Fire?

Triggers fire when records are:
- **Inserted** — new records created
- **Updated** — existing records modified
- **Deleted** — records removed
- **Undeleted** — records restored from recycle bin

## Before vs After

- **Before triggers** run before the record is saved. Use them to validate or modify field values.
- **After triggers** run after the record is saved and has an ID. Use them to access field values set by the system or to make changes to other records.

## Basic Syntax

\`\`\`apex
trigger AccountTrigger on Account (before insert, before update) {
    for (Account acc : Trigger.new) {
        // Your logic here
    }
}
\`\`\`

## Key Takeaways
1. One trigger per object is the recommended best practice
2. Triggers execute for every DML operation — even bulk operations
3. Always plan for bulk data (up to 200 records at once)`,
            completed: false,
          },
          {
            id: 'trigger-context',
            title: 'Trigger Context Variables',
            description: 'Master Trigger.new, Trigger.old, Trigger.newMap, and Trigger.oldMap.',
            duration: '20 min',
            type: 'reading',
            content: `# Trigger Context Variables

Apex provides several context variables that give you access to the records being processed.

## Core Context Variables

| Variable | Type | Description |
|----------|------|-------------|
| Trigger.new | List<SObject> | New versions of records |
| Trigger.old | List<SObject> | Old versions of records (update/delete only) |
| Trigger.newMap | Map<Id, SObject> | Map of new records by ID (after insert, update) |
| Trigger.oldMap | Map<Id, SObject> | Map of old records by ID (update/delete) |

## Boolean Context Variables

| Variable | Description |
|----------|-------------|
| Trigger.isBefore | True if before trigger |
| Trigger.isAfter | True if after trigger |
| Trigger.isInsert | True if insert operation |
| Trigger.isUpdate | True if update operation |
| Trigger.isDelete | True if delete operation |

## Common Pattern: Detecting Field Changes

\`\`\`apex
trigger AccountTrigger on Account (before update) {
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        if (acc.Name != oldAcc.Name) {
            // Name changed — take action
        }
    }
}
\`\`\``,
            completed: false,
          },
          {
            id: 'first-trigger-exercise',
            title: 'Exercise: Your First Trigger',
            description: 'Write a before insert trigger that sets a default value on Account records.',
            duration: '25 min',
            type: 'exercise',
            content: `# Exercise: Your First Trigger

## Objective
Write a before insert trigger on the Account object that automatically sets the \`Description\` field to "New Account - needs review" if it's left blank.

## Instructions

1. Create a trigger named \`AccountDefaultDescription\`
2. It should fire on \`before insert\`
3. Loop through \`Trigger.new\`
4. If \`Description\` is null or blank, set it to "New Account - needs review"

## Expected Code Structure

\`\`\`apex
trigger AccountDefaultDescription on Account (before insert) {
    for (Account acc : Trigger.new) {
        if (acc.Description == null || acc.Description == '') {
            acc.Description = 'New Account - needs review';
        }
    }
}
\`\`\`

## Test It
Create a test class that:
1. Inserts an Account without a Description
2. Asserts the Description was set
3. Inserts an Account with a Description
4. Asserts the Description was NOT overwritten`,
            completed: false,
          },
        ],
      },
      {
        id: 'bulkification',
        title: 'Bulkification Mastery',
        description: 'Learn to write triggers that efficiently handle bulk operations without hitting governor limits.',
        lessons: [
          {
            id: 'why-bulkify',
            title: 'Why Bulkification Matters',
            description: 'Understand governor limits and why every trigger must handle bulk data.',
            duration: '15 min',
            type: 'reading',
            content: `# Why Bulkification Matters

## The Problem
Salesforce processes records in batches of up to 200. If your trigger works for 1 record but fails for 200, you have a critical bug.

## Governor Limits That Matter

| Limit | Value |
|-------|-------|
| SOQL queries per transaction | 100 |
| DML statements per transaction | 150 |
| CPU time | 10,000 ms |
| Heap size | 6 MB |

## The Anti-Pattern

\`\`\`apex
// BAD — SOQL inside a loop!
trigger BadTrigger on Account (before insert) {
    for (Account acc : Trigger.new) {
        // This query runs for EACH record
        // 200 records = 200 queries = GOVERNOR LIMIT HIT
        List<Account> existing = [SELECT Id FROM Account WHERE Name = :acc.Name];
        if (!existing.isEmpty()) {
            acc.addError('Duplicate found!');
        }
    }
}
\`\`\`

## The Bulkified Pattern

\`\`\`apex
// GOOD — Query once, process in memory
trigger GoodTrigger on Account (before insert) {
    Set<String> names = new Set<String>();
    for (Account acc : Trigger.new) {
        names.add(acc.Name);
    }

    Map<String, Account> existingMap = new Map<String, Account>();
    for (Account existing : [SELECT Id, Name FROM Account WHERE Name IN :names]) {
        existingMap.put(existing.Name, existing);
    }

    for (Account acc : Trigger.new) {
        if (existingMap.containsKey(acc.Name)) {
            acc.addError('Duplicate found!');
        }
    }
}
\`\`\``,
            completed: false,
          },
          {
            id: 'collection-patterns',
            title: 'Collection Patterns for Triggers',
            description: 'Master Set, List, and Map patterns for efficient trigger processing.',
            duration: '20 min',
            type: 'reading',
            content: `# Collection Patterns for Triggers

## Pattern 1: Collect → Query → Process

This is the most common pattern:

\`\`\`apex
// Step 1: Collect relevant data
Set<Id> accountIds = new Set<Id>();
for (Contact con : Trigger.new) {
    if (con.AccountId != null) {
        accountIds.add(con.AccountId);
    }
}

// Step 2: Query related data once
Map<Id, Account> accountMap = new Map<Id, Account>(
    [SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds]
);

// Step 3: Process using the map
for (Contact con : Trigger.new) {
    if (con.AccountId != null) {
        Account acc = accountMap.get(con.AccountId);
        if (acc != null && acc.Industry == 'Technology') {
            con.LeadSource = 'Web';
        }
    }
}
\`\`\`

## Pattern 2: Aggregate DML

\`\`\`apex
// Collect records to update
List<Task> tasksToInsert = new List<Task>();

for (Opportunity opp : Trigger.new) {
    if (opp.StageName == 'Closed Won') {
        tasksToInsert.add(new Task(
            WhatId = opp.Id,
            Subject = 'Follow up with customer'
        ));
    }
}

// Single DML operation outside the loop
if (!tasksToInsert.isEmpty()) {
    insert tasksToInsert;
}
\`\`\``,
            completed: false,
          },
          {
            id: 'bulk-exercise',
            title: 'Exercise: Bulkify a Trigger',
            description: 'Take a non-bulkified trigger and refactor it to handle 200 records.',
            duration: '30 min',
            type: 'exercise',
            content: `# Exercise: Bulkify This Trigger

## The Problem

Refactor this trigger to be fully bulkified:

\`\`\`apex
// BROKEN — Will hit limits with bulk data
trigger ContactPhoneSync on Contact (after update) {
    for (Contact con : Trigger.new) {
        Contact oldCon = Trigger.oldMap.get(con.Id);
        if (con.Phone != oldCon.Phone) {
            Account acc = [SELECT Id, Phone FROM Account WHERE Id = :con.AccountId];
            acc.Phone = con.Phone;
            update acc;
        }
    }
}
\`\`\`

## Requirements

1. Must handle up to 200 Contact updates
2. Should only query Accounts once
3. Should perform only one DML update
4. Should only update Accounts where the Contact phone actually changed

## Hints
- Collect AccountIds where phone changed
- Query all needed Accounts in one query
- Build a list of Accounts to update
- Perform one update operation`,
            completed: false,
          },
          {
            id: 'bulk-quiz',
            title: 'Quiz: Bulkification',
            description: 'Test your knowledge of trigger bulkification patterns.',
            duration: '10 min',
            type: 'quiz',
            content: `# Quiz: Bulkification

**Q1:** What is the maximum number of records a trigger can receive in a single invocation?
- A) 100
- B) 200 ✓
- C) 500
- D) 1000

**Q2:** How many SOQL queries can you execute in a single transaction?
- A) 50
- B) 100 ✓
- C) 150
- D) 200

**Q3:** Which collection type provides O(1) lookup by key?
- A) List
- B) Set
- C) Map ✓
- D) Array

**Q4:** What happens when you exceed a governor limit?
- A) The excess operations are queued
- B) A warning is logged
- C) An unhandled exception is thrown ✓
- D) The operation silently fails

**Q5:** Where should DML operations be placed in a trigger?
- A) Inside the for loop
- B) Outside the for loop ✓
- C) In a separate trigger
- D) It doesn't matter`,
            completed: false,
          },
        ],
      },
      {
        id: 'handler-framework',
        title: 'Trigger Handler Framework',
        description: 'Implement professional trigger handler patterns used in enterprise Salesforce orgs.',
        lessons: [
          {
            id: 'why-handler',
            title: 'Why Use a Trigger Handler?',
            description: 'The benefits of separating trigger logic into handler classes.',
            duration: '10 min',
            type: 'reading',
            content: `# Why Use a Trigger Handler?

## Problems with Logic in Triggers
1. **Not testable** — You can't directly call trigger logic
2. **Not reusable** — Logic is locked inside the trigger
3. **Hard to maintain** — Large triggers become unreadable
4. **No separation of concerns** — Everything mixed together

## The Handler Pattern

\`\`\`apex
// Trigger — thin, just dispatches
trigger AccountTrigger on Account (before insert, before update, after insert, after update) {
    AccountTriggerHandler handler = new AccountTriggerHandler();
    handler.run();
}

// Handler — all the logic
public class AccountTriggerHandler extends TriggerHandler {
    public override void beforeInsert() {
        // handle before insert
    }
    public override void beforeUpdate() {
        // handle before update
    }
}
\`\`\`

## Benefits
- **Testable** — Call handler methods directly in tests
- **Organized** — Each event has its own method
- **Reusable** — Handler methods can be called from services
- **Maintainable** — Easy to find and update specific logic`,
            completed: false,
          },
          {
            id: 'build-framework',
            title: 'Building a Trigger Framework',
            description: 'Step-by-step implementation of a reusable trigger framework.',
            duration: '30 min',
            type: 'reading',
            content: `# Building a Trigger Framework

## The Base Handler Class

\`\`\`apex
public virtual class TriggerHandler {
    // Prevent recursion
    private static Set<String> runHandlers = new Set<String>();

    public void run() {
        String handlerName = String.valueOf(this).split(':')[0];

        if (runHandlers.contains(handlerName)) {
            return; // Prevent recursion
        }
        runHandlers.add(handlerName);

        if (Trigger.isBefore) {
            if (Trigger.isInsert) beforeInsert();
            if (Trigger.isUpdate) beforeUpdate();
            if (Trigger.isDelete) beforeDelete();
        }
        if (Trigger.isAfter) {
            if (Trigger.isInsert) afterInsert();
            if (Trigger.isUpdate) afterUpdate();
            if (Trigger.isDelete) afterDelete();
            if (Trigger.isUndelete) afterUndelete();
        }

        runHandlers.remove(handlerName);
    }

    // Virtual methods — override in child classes
    protected virtual void beforeInsert() {}
    protected virtual void beforeUpdate() {}
    protected virtual void beforeDelete() {}
    protected virtual void afterInsert() {}
    protected virtual void afterUpdate() {}
    protected virtual void afterDelete() {}
    protected virtual void afterUndelete() {}
}
\`\`\`

## Using the Framework

\`\`\`apex
public class OpportunityTriggerHandler extends TriggerHandler {
    protected override void beforeUpdate() {
        validateStageTransitions();
    }

    protected override void afterInsert() {
        createWelcomeTasks();
    }

    private void validateStageTransitions() {
        for (Opportunity opp : (List<Opportunity>) Trigger.new) {
            // validation logic
        }
    }

    private void createWelcomeTasks() {
        List<Task> tasks = new List<Task>();
        for (Opportunity opp : (List<Opportunity>) Trigger.new) {
            tasks.add(new Task(WhatId = opp.Id, Subject = 'Welcome!'));
        }
        if (!tasks.isEmpty()) insert tasks;
    }
}
\`\`\``,
            completed: false,
          },
          {
            id: 'framework-exercise',
            title: 'Exercise: Implement a Handler',
            description: 'Create a complete trigger handler for the Contact object.',
            duration: '35 min',
            type: 'exercise',
            content: `# Exercise: Implement a Contact Trigger Handler

## Objective
Create a ContactTriggerHandler that:
1. Before Insert: Defaults MailingCountry to "US" if blank
2. Before Update: Validates that Email is not removed from existing contacts
3. After Insert: Creates a welcome Task for each new Contact
4. After Update: If Phone changes, updates the parent Account's Phone

## Requirements
- Extend TriggerHandler
- Fully bulkified
- Handle null checks properly
- Write a test class with 90%+ coverage`,
            completed: false,
          },
        ],
      },
      {
        id: 'testing-triggers',
        title: 'Testing Triggers',
        description: 'Write comprehensive test classes for your triggers with high code coverage.',
        lessons: [
          {
            id: 'test-class-basics',
            title: 'Test Class Fundamentals',
            description: 'Structure of test classes, @isTest, @testSetup, and assertion methods.',
            duration: '20 min',
            type: 'reading',
            content: `# Test Class Fundamentals

## Basic Structure

\`\`\`apex
@isTest
private class AccountTriggerTest {

    @testSetup
    static void setup() {
        // Create test data used by all test methods
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 5; i++) {
            accounts.add(new Account(Name = 'Test Account ' + i));
        }
        insert accounts;
    }

    @isTest
    static void testBeforeInsert_setsDefaultValues() {
        // Arrange
        Account acc = new Account(Name = 'New Test Account');

        // Act
        Test.startTest();
        insert acc;
        Test.stopTest();

        // Assert
        Account result = [SELECT Description FROM Account WHERE Id = :acc.Id];
        System.assertEquals('New Account - needs review', result.Description);
    }

    @isTest
    static void testBeforeInsert_preservesExistingValues() {
        // Arrange
        Account acc = new Account(
            Name = 'Test Account',
            Description = 'Custom description'
        );

        // Act
        Test.startTest();
        insert acc;
        Test.stopTest();

        // Assert
        Account result = [SELECT Description FROM Account WHERE Id = :acc.Id];
        System.assertEquals('Custom description', result.Description);
    }

    @isTest
    static void testBulkInsert_200Records() {
        // Arrange
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < 200; i++) {
            accounts.add(new Account(Name = 'Bulk Account ' + i));
        }

        // Act
        Test.startTest();
        insert accounts;
        Test.stopTest();

        // Assert
        System.assertEquals(200,
            [SELECT COUNT() FROM Account WHERE Name LIKE 'Bulk Account%']);
    }
}
\`\`\``,
            completed: false,
          },
          {
            id: 'testing-project',
            title: 'Project: Complete Trigger Test Suite',
            description: 'Build a full test suite covering positive, negative, and bulk scenarios.',
            duration: '45 min',
            type: 'project',
            content: `# Project: Complete Trigger Test Suite

## Overview
Build a comprehensive test suite for the Prevent Duplicate Accounts trigger that covers all scenarios.

## Test Scenarios to Cover

### Positive Tests
1. Inserting a unique account succeeds
2. Bulk inserting 200 unique accounts succeeds
3. Updating an existing account name to a unique name succeeds

### Negative Tests
4. Inserting a duplicate account name fails with correct error
5. Inserting multiple accounts with the same name in one batch fails
6. Bulk insert with mix of unique and duplicate names — only duplicates fail

### Edge Cases
7. Account names are case-insensitive for matching
8. Empty/null account names don't cause errors
9. Updating an account to keep the same name doesn't trigger false positive

## Deliverables
- TestDataFactory class for creating test accounts
- AccountTriggerTest class with all 9+ scenarios
- 95%+ code coverage on the trigger and handler
- All tests passing in bulk (200 records)`,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'async-apex-mastery',
    slug: 'async-apex-mastery',
    title: 'Async Apex Mastery',
    description: 'Deep dive into asynchronous Apex: Future methods, Batch, Queueable, Scheduled, and Platform Events.',
    longDescription: 'Asynchronous processing is essential for building scalable Salesforce applications. This course covers every async mechanism available in Apex, helping you choose the right tool for each scenario. From simple future methods to complex batch chains and event-driven architectures.',
    icon: 'layers',
    color: 'from-purple-500 to-pink-500',
    level: 'Intermediate',
    duration: '8 hours',
    totalLessons: 20,
    prerequisites: ['Comfortable writing Apex classes and triggers', 'Understanding of governor limits', 'Basic knowledge of SOQL and DML'],
    outcomes: [
      'Choose the right async mechanism for any scenario',
      'Build batch jobs that process millions of records',
      'Chain Queueable jobs for complex workflows',
      'Implement scheduled jobs with cron expressions',
      'Design event-driven architectures with Platform Events',
    ],
    author: 'Apex Academy',
    rating: 4.7,
    enrolled: 2180,
    modules: [
      {
        id: 'async-overview',
        title: 'Async Apex Overview',
        description: 'Understand why async processing exists and when to use each mechanism.',
        lessons: [
          {
            id: 'why-async',
            title: 'Why Asynchronous Apex?',
            description: 'Governor limits, long-running operations, and mixed DML — why sync isn\'t always enough.',
            duration: '15 min',
            type: 'reading',
            content: `# Why Asynchronous Apex?

## Synchronous Limits
- 10 seconds CPU time
- 100 SOQL queries
- 6MB heap size
- No callouts from triggers

## Async Benefits
- **Higher limits** — 60 seconds CPU, 200 SOQL queries, 12MB heap
- **Background processing** — User doesn't wait
- **Callouts from triggers** — via @future(callout=true)
- **Large data volumes** — Batch processes millions of records

## Choosing the Right Tool

| Mechanism | Best For | Max Records |
|-----------|----------|-------------|
| @future | Simple async, callouts from triggers | N/A |
| Queueable | Complex objects, chaining, monitoring | N/A |
| Batch | Large data processing | 50 million |
| Scheduled | Time-based execution | N/A |
| Platform Events | Event-driven, real-time | N/A |`,
            completed: false,
          },
          {
            id: 'async-decision-tree',
            title: 'Async Decision Tree',
            description: 'A practical guide to choosing between Future, Batch, Queueable, and Scheduled.',
            duration: '10 min',
            type: 'reading',
            content: `# Async Decision Tree

## Ask These Questions:

### 1. Do you need to make a callout from a trigger?
→ Use **@future(callout=true)**

### 2. Do you need to process more than 50,000 records?
→ Use **Batch Apex**

### 3. Do you need to chain jobs (one after another)?
→ Use **Queueable** (supports one child job per parent)

### 4. Do you need to pass complex objects?
→ Use **Queueable** (supports non-primitive types)

### 5. Do you need to run at a specific time?
→ Use **Scheduled Apex**

### 6. Do you need real-time event notification?
→ Use **Platform Events**

### 7. Is it a simple fire-and-forget operation?
→ Use **@future** (simplest option)`,
            completed: false,
          },
        ],
      },
      {
        id: 'future-methods',
        title: 'Future Methods',
        description: 'Simple asynchronous processing with @future annotation.',
        lessons: [
          {
            id: 'future-basics',
            title: 'Future Method Basics',
            description: 'Syntax, limitations, and common use cases for @future methods.',
            duration: '15 min',
            type: 'reading',
            content: `# Future Methods

## Syntax

\`\`\`apex
public class AccountService {
    @future
    public static void updateAccountRatings(Set<Id> accountIds) {
        List<Account> accounts = [SELECT Id, AnnualRevenue, Rating FROM Account WHERE Id IN :accountIds];
        for (Account acc : accounts) {
            if (acc.AnnualRevenue > 1000000) {
                acc.Rating = 'Hot';
            }
        }
        update accounts;
    }

    @future(callout=true)
    public static void syncToExternalSystem(Set<Id> accountIds) {
        // Make HTTP callout to external system
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:ExternalAPI/accounts');
        req.setMethod('POST');
        // ...
    }
}
\`\`\`

## Limitations
- Parameters must be primitive types or collections of primitives
- Cannot call another @future method
- Cannot be used in Batch Apex
- No way to monitor job status
- Max 50 future calls per transaction`,
            completed: false,
          },
          {
            id: 'future-exercise',
            title: 'Exercise: Future Callout',
            description: 'Implement a future method that syncs Account data to an external API.',
            duration: '25 min',
            type: 'exercise',
            content: `# Exercise: Future Method Callout

## Objective
Create a future method that sends Account data to an external REST API when an Account is created.

## Requirements
1. Create an AccountSyncService class
2. Add a @future(callout=true) method: syncNewAccounts(Set<Id> accountIds)
3. Query the Accounts
4. Serialize to JSON and POST to an endpoint
5. Write a test class using HttpCalloutMock`,
            completed: false,
          },
        ],
      },
      {
        id: 'batch-apex',
        title: 'Batch Apex',
        description: 'Process large data volumes with Database.Batchable.',
        lessons: [
          {
            id: 'batch-basics',
            title: 'Batch Apex Fundamentals',
            description: 'The three methods: start(), execute(), finish(). Scope size and stateful processing.',
            duration: '20 min',
            type: 'reading',
            content: `# Batch Apex Fundamentals

## The Three Methods

\`\`\`apex
public class DataCleanupBatch implements Database.Batchable<SObject>, Database.Stateful {
    private Integer recordsProcessed = 0;

    // start() — Define what records to process
    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id, Name, LastModifiedDate FROM Account WHERE LastModifiedDate < LAST_N_YEARS:2'
        );
    }

    // execute() — Process each batch of records
    public void execute(Database.BatchableContext bc, List<Account> scope) {
        List<Account> toUpdate = new List<Account>();
        for (Account acc : scope) {
            acc.Description = 'Archived - ' + Date.today().format();
            toUpdate.add(acc);
        }
        update toUpdate;
        recordsProcessed += scope.size();
    }

    // finish() — Cleanup and notification
    public void finish(Database.BatchableContext bc) {
        System.debug('Processed ' + recordsProcessed + ' records');
        // Send email, chain another batch, etc.
    }
}
\`\`\`

## Running a Batch

\`\`\`apex
DataCleanupBatch batch = new DataCleanupBatch();
Id batchId = Database.executeBatch(batch, 200); // scope size = 200
\`\`\``,
            completed: false,
          },
          {
            id: 'batch-exercise',
            title: 'Exercise: Build a Cleanup Batch',
            description: 'Create a batch job that archives old records and sends a summary email.',
            duration: '35 min',
            type: 'exercise',
            content: `# Exercise: Build a Data Cleanup Batch

## Objective
Create a batch job that:
1. Finds all Contacts without an email who were created more than 1 year ago
2. Updates their Description to "Needs email - flagged for cleanup"
3. Tracks the count of processed records
4. Sends a summary email to the running user when complete

## Requirements
- Implement Database.Batchable<SObject>
- Implement Database.Stateful for tracking counts
- Use Database.QueryLocator in start()
- Batch size should be 100
- Write a complete test class`,
            completed: false,
          },
          {
            id: 'batch-chaining',
            title: 'Batch Chaining & Scheduling',
            description: 'Chain batch jobs and schedule them to run automatically.',
            duration: '15 min',
            type: 'reading',
            content: `# Batch Chaining & Scheduling

## Chaining Batches

Start the next batch in the finish() method:

\`\`\`apex
public void finish(Database.BatchableContext bc) {
    // Chain the next batch
    Database.executeBatch(new NextStepBatch(), 200);
}
\`\`\`

## Scheduling a Batch

\`\`\`apex
public class ScheduledCleanup implements Schedulable {
    public void execute(SchedulableContext sc) {
        Database.executeBatch(new DataCleanupBatch(), 200);
    }
}

// Schedule it — runs every day at midnight
String cronExp = '0 0 0 * * ?';
System.schedule('Daily Cleanup', cronExp, new ScheduledCleanup());
\`\`\`

## Cron Expression Format
\`\`\`
Seconds Minutes Hours Day_of_month Month Day_of_week Optional_year
0       0       0     *             *     ?
\`\`\``,
            completed: false,
          },
        ],
      },
      {
        id: 'queueable-apex',
        title: 'Queueable Apex',
        description: 'Chain complex async operations with Queueable interface.',
        lessons: [
          {
            id: 'queueable-basics',
            title: 'Queueable Apex Basics',
            description: 'Implement Queueable for complex async processing with job chaining.',
            duration: '15 min',
            type: 'reading',
            content: `# Queueable Apex

## Why Queueable over Future?
- Accept complex parameters (non-primitives)
- Chain jobs (one child per parent)
- Monitor with AsyncApexJob
- Get a Job ID back

## Implementation

\`\`\`apex
public class OrderProcessingJob implements Queueable, Database.AllowsCallouts {
    private List<Order__c> orders;

    public OrderProcessingJob(List<Order__c> orders) {
        this.orders = orders;
    }

    public void execute(QueueableContext context) {
        // Process orders
        for (Order__c order : orders) {
            // Complex processing logic
            order.Status__c = 'Processed';
        }
        update orders;

        // Chain next job if needed
        if (!orders.isEmpty()) {
            System.enqueueJob(new OrderNotificationJob(orders));
        }
    }
}

// Start the job
Id jobId = System.enqueueJob(new OrderProcessingJob(myOrders));
\`\`\``,
            completed: false,
          },
          {
            id: 'queueable-exercise',
            title: 'Exercise: Queueable Chain',
            description: 'Build a chain of Queueable jobs for order processing workflow.',
            duration: '30 min',
            type: 'exercise',
            content: `# Exercise: Queueable Job Chain

## Objective
Build a 3-step order processing pipeline using chained Queueable jobs:

### Step 1: ValidateOrderJob
- Verify all required fields are filled
- Check inventory availability
- Mark invalid orders as "Failed"

### Step 2: ProcessPaymentJob
- Calculate totals with tax
- Update payment status
- Chain to Step 3

### Step 3: SendConfirmationJob
- Create a Task for the Account owner
- Update order status to "Completed"

## Requirements
- Each job implements Queueable
- Pass the order list between jobs
- Handle errors at each step
- Write test classes for each job`,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'salesforce-integration',
    slug: 'salesforce-integrations',
    title: 'Salesforce Integration Patterns',
    description: 'Build robust integrations with REST APIs, SOAP services, Platform Events, and external system connectivity.',
    longDescription: 'Master the art of connecting Salesforce with external systems. This course covers both inbound and outbound integrations, authentication mechanisms, error handling, and testing strategies. Learn to build production-grade integrations that handle failures gracefully.',
    icon: 'globe',
    color: 'from-orange-500 to-red-500',
    level: 'Advanced',
    duration: '10 hours',
    totalLessons: 16,
    prerequisites: ['Strong understanding of Apex classes and triggers', 'Familiarity with REST APIs and JSON', 'Understanding of async Apex mechanisms'],
    outcomes: [
      'Build custom REST API endpoints in Salesforce',
      'Make outbound HTTP callouts to external services',
      'Implement OAuth and Named Credentials for authentication',
      'Design event-driven integrations with Platform Events',
      'Test integrations with mock classes and strategies',
    ],
    author: 'Apex Academy',
    rating: 4.6,
    enrolled: 1540,
    modules: [
      {
        id: 'rest-fundamentals',
        title: 'REST API Fundamentals',
        description: 'Build and consume REST APIs in Salesforce.',
        lessons: [
          {
            id: 'rest-intro',
            title: 'REST APIs in Salesforce',
            description: 'Overview of inbound and outbound REST patterns.',
            duration: '15 min',
            type: 'reading',
            content: `# REST APIs in Salesforce

## Two Directions

### Inbound (External → Salesforce)
Build custom REST endpoints that external systems can call:
\`\`\`apex
@RestResource(urlMapping='/api/v1/accounts/*')
global class AccountAPI {
    @HttpGet
    global static Account getAccount() {
        RestRequest req = RestContext.request;
        String accountId = req.requestURI.substringAfterLast('/');
        return [SELECT Id, Name FROM Account WHERE Id = :accountId];
    }

    @HttpPost
    global static String createAccount(String name, String industry) {
        Account acc = new Account(Name = name, Industry = industry);
        insert acc;
        return acc.Id;
    }
}
\`\`\`

### Outbound (Salesforce → External)
Call external APIs from Apex:
\`\`\`apex
Http http = new Http();
HttpRequest req = new HttpRequest();
req.setEndpoint('callout:ExternalAPI/data');
req.setMethod('GET');
req.setHeader('Content-Type', 'application/json');

HttpResponse res = http.send(req);
if (res.getStatusCode() == 200) {
    Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
}
\`\`\``,
            completed: false,
          },
          {
            id: 'named-credentials',
            title: 'Named Credentials & Auth',
            description: 'Secure authentication with Named Credentials and OAuth.',
            duration: '20 min',
            type: 'reading',
            content: `# Named Credentials & Authentication

## Why Named Credentials?
- No hard-coded URLs or credentials in code
- Auth handled declaratively
- Supports OAuth 2.0, Basic Auth, JWT
- Easy to change endpoints without code changes

## Using Named Credentials

\`\`\`apex
HttpRequest req = new HttpRequest();
// Named Credential handles auth automatically
req.setEndpoint('callout:MyExternalService/api/data');
req.setMethod('GET');

Http http = new Http();
HttpResponse res = http.send(req);
\`\`\`

## OAuth 2.0 Flows
1. **Web Server Flow** — For user-facing apps
2. **JWT Bearer Flow** — For server-to-server
3. **Client Credentials** — For service accounts
4. **Device Flow** — For limited-input devices`,
            completed: false,
          },
        ],
      },
      {
        id: 'error-handling',
        title: 'Integration Error Handling',
        description: 'Build resilient integrations with proper error handling and retry logic.',
        lessons: [
          {
            id: 'error-patterns',
            title: 'Error Handling Patterns',
            description: 'Retry logic, circuit breakers, and dead letter queues for integrations.',
            duration: '20 min',
            type: 'reading',
            content: `# Integration Error Handling

## Retry Pattern

\`\`\`apex
public class IntegrationService {
    private static final Integer MAX_RETRIES = 3;

    public static HttpResponse callWithRetry(HttpRequest req) {
        Integer retryCount = 0;
        HttpResponse res;

        while (retryCount < MAX_RETRIES) {
            try {
                Http http = new Http();
                res = http.send(req);
                if (res.getStatusCode() < 300) {
                    return res; // Success
                }
                if (res.getStatusCode() >= 500) {
                    retryCount++; // Server error, retry
                    continue;
                }
                return res; // Client error, don't retry
            } catch (CalloutException e) {
                retryCount++;
                if (retryCount >= MAX_RETRIES) {
                    throw e;
                }
            }
        }
        return res;
    }
}
\`\`\`

## Logging Pattern

\`\`\`apex
public class IntegrationLog__c {
    // Custom object to track all integration calls
    // Fields: Endpoint, Method, Request_Body, Response_Body,
    //         Status_Code, Error_Message, Timestamp
}
\`\`\``,
            completed: false,
          },
          {
            id: 'integration-project',
            title: 'Project: Full Integration Suite',
            description: 'Build a complete integration with error handling, retry logic, and monitoring.',
            duration: '60 min',
            type: 'project',
            content: `# Project: Full Integration Suite

## Build a complete integration that:

1. **Outbound sync** — When Accounts are updated, sync changes to an external CRM
2. **Inbound API** — Expose a REST endpoint for the external CRM to push updates back
3. **Error handling** — Retry failed callouts up to 3 times
4. **Logging** — Track all integration calls in a custom object
5. **Monitoring** — Scheduled job to check for failed integrations and alert admins
6. **Testing** — Complete test coverage with mock classes

This is your capstone project — apply everything you've learned!`,
            completed: false,
          },
        ],
      },
    ],
  },
  {
    id: 'apex-testing-pro',
    slug: 'apex-testing-pro',
    title: 'Apex Testing Like a Pro',
    description: 'Write bulletproof test classes with test data factories, mocking, and advanced assertion patterns.',
    longDescription: 'Testing is not just about code coverage — it\'s about confidence. This course teaches you to write tests that actually verify behavior, catch bugs early, and serve as living documentation for your codebase.',
    icon: 'shield',
    color: 'from-emerald-500 to-teal-500',
    level: 'Intermediate',
    duration: '5 hours',
    totalLessons: 12,
    prerequisites: ['Experience writing Apex classes and triggers', 'Understanding of SOQL and DML'],
    outcomes: [
      'Build reusable test data factories',
      'Write tests that verify behavior, not just coverage',
      'Mock HTTP callouts and external services',
      'Test bulk scenarios with 200+ records',
      'Achieve 90%+ meaningful code coverage',
    ],
    author: 'Apex Academy',
    rating: 4.9,
    enrolled: 2850,
    modules: [
      {
        id: 'testing-mindset',
        title: 'The Testing Mindset',
        description: 'Think like a tester — what to test, how to structure tests, and common pitfalls.',
        lessons: [
          {
            id: 'testing-philosophy',
            title: 'Testing Philosophy',
            description: 'Why we test, what good tests look like, and the AAA pattern.',
            duration: '15 min',
            type: 'reading',
            content: `# Testing Philosophy

## Why We Test
- **Confidence** — Deploy without fear
- **Documentation** — Tests show how code should behave
- **Regression protection** — Catch bugs before they reach production
- **Design feedback** — Hard-to-test code is often poorly designed

## The AAA Pattern
\`\`\`
Arrange — Set up test data and conditions
Act — Execute the code being tested
Assert — Verify the expected outcome
\`\`\`

## What Makes a Good Test?
1. **Focused** — Tests one behavior
2. **Independent** — Doesn't depend on other tests
3. **Fast** — Completes quickly
4. **Readable** — Clear intent from the name
5. **Reliable** — Same result every time`,
            completed: false,
          },
          {
            id: 'test-data-factory-lesson',
            title: 'Building Test Data Factories',
            description: 'Create reusable, flexible test data creation utilities.',
            duration: '20 min',
            type: 'reading',
            content: `# Building Test Data Factories

## The Factory Pattern

\`\`\`apex
@isTest
public class TestDataFactory {

    public static Account createAccount(String name) {
        return new Account(
            Name = name,
            Industry = 'Technology',
            BillingCity = 'San Francisco',
            BillingState = 'CA'
        );
    }

    public static List<Account> createAccounts(Integer count) {
        List<Account> accounts = new List<Account>();
        for (Integer i = 0; i < count; i++) {
            accounts.add(createAccount('Test Account ' + i));
        }
        return accounts;
    }

    public static Contact createContact(Id accountId) {
        return new Contact(
            FirstName = 'Test',
            LastName = 'Contact',
            Email = 'test@example.com',
            AccountId = accountId
        );
    }

    public static Opportunity createOpportunity(Id accountId, String stage) {
        return new Opportunity(
            Name = 'Test Opp',
            AccountId = accountId,
            StageName = stage,
            CloseDate = Date.today().addDays(30),
            Amount = 50000
        );
    }
}
\`\`\``,
            completed: false,
          },
        ],
      },
      {
        id: 'advanced-testing',
        title: 'Advanced Testing Techniques',
        description: 'Mocking, negative testing, and bulk testing strategies.',
        lessons: [
          {
            id: 'mocking-lesson',
            title: 'Mocking External Services',
            description: 'Use HttpCalloutMock and WebServiceMock for integration tests.',
            duration: '25 min',
            type: 'reading',
            content: `# Mocking External Services

## HttpCalloutMock

\`\`\`apex
@isTest
public class MockHttpResponse implements HttpCalloutMock {
    private Integer statusCode;
    private String body;

    public MockHttpResponse(Integer statusCode, String body) {
        this.statusCode = statusCode;
        this.body = body;
    }

    public HttpResponse respond(HttpRequest req) {
        HttpResponse res = new HttpResponse();
        res.setStatusCode(statusCode);
        res.setBody(body);
        return res;
    }
}

// In your test
@isTest
static void testCallout_success() {
    Test.setMock(HttpCalloutMock.class,
        new MockHttpResponse(200, '{"status":"ok"}'));

    Test.startTest();
    String result = MyService.callExternalAPI();
    Test.stopTest();

    System.assertEquals('ok', result);
}
\`\`\``,
            completed: false,
          },
          {
            id: 'negative-testing',
            title: 'Negative & Edge Case Testing',
            description: 'Test error paths, boundary conditions, and unexpected inputs.',
            duration: '20 min',
            type: 'reading',
            content: `# Negative & Edge Case Testing

## Test the Unhappy Path

\`\`\`apex
@isTest
static void testDuplicate_showsError() {
    // Arrange
    insert new Account(Name = 'Existing Corp');

    // Act & Assert
    try {
        insert new Account(Name = 'Existing Corp');
        System.assert(false, 'Should have thrown an exception');
    } catch (DmlException e) {
        System.assert(e.getMessage().contains('duplicate'),
            'Error should mention duplicate');
    }
}

@isTest
static void testNullInput_handledGracefully() {
    // Act
    String result = MyService.processData(null);

    // Assert
    System.assertEquals('No data provided', result);
}

@isTest
static void testEmptyList_noErrors() {
    Test.startTest();
    MyService.processBatch(new List<Account>());
    Test.stopTest();
    // Should complete without errors
}
\`\`\``,
            completed: false,
          },
        ],
      },
    ],
  },
];

export function getCourseBySlug(slug: string): Course | undefined {
  return courses.find(c => c.slug === slug);
}
