export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Category = 'Trigger' | 'Class' | 'Async Apex' | 'SOQL' | 'Integration';

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
  description: string;
}

export interface Problem {
  id: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: Category;
  tags: string[];
  description: string;
  constraints: string[];
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: string;
  testCases: TestCase[];
  solution?: string;
  acceptance: number;
  submissions: number;
}

export const problems: Problem[] = [
  {
    id: 1,
    title: 'Prevent Duplicate Accounts',
    slug: 'prevent-duplicate-accounts',
    difficulty: 'Easy',
    category: 'Trigger',
    tags: ['Before Insert', 'Duplicate Prevention', 'Validation'],
    description: `## Prevent Duplicate Accounts

Write a **before insert** trigger on the \`Account\` object that prevents duplicate Account records from being created based on the \`Name\` field.

### Requirements:
- When a new Account is being inserted, check if an Account with the same **Name** already exists in the database.
- If a duplicate is found, add an error to the record to prevent insertion.
- The error message should be: \`"An Account with this name already exists."\`
- Handle bulk operations (multiple records in \`Trigger.new\`).

### Real-World Context:
Data quality is critical in Salesforce orgs. Duplicate accounts lead to fragmented customer data, inaccurate reporting, and poor user experience. This trigger acts as a first line of defense.`,
    constraints: [
      'Must handle bulk inserts (up to 200 records)',
      'Must be bulkified — no SOQL inside loops',
      'Should use before insert context only',
    ],
    examples: [
      {
        input: 'Insert Account with Name = "Acme Corp" (already exists)',
        output: 'Error: "An Account with this name already exists."',
        explanation: 'The trigger detects the existing Account and blocks the insert.',
      },
      {
        input: 'Insert Account with Name = "New Corp" (does not exist)',
        output: 'Record inserted successfully',
      },
    ],
    starterCode: `trigger PreventDuplicateAccounts on Account (before insert) {
    // Collect all Account names from Trigger.new
    
    // Query existing Accounts with matching names
    
    // Check for duplicates and add error
    
}`,
    testCases: [
      {
        id: 1,
        input: '{"records": [{"Name": "Acme Corp"}], "existing": ["Acme Corp"]}',
        expectedOutput: '{"success": false, "error": "An Account with this name already exists."}',
        description: 'Should block duplicate account insertion',
      },
      {
        id: 2,
        input: '{"records": [{"Name": "New Corp"}], "existing": ["Acme Corp"]}',
        expectedOutput: '{"success": true}',
        description: 'Should allow unique account insertion',
      },
      {
        id: 3,
        input: '{"records": [{"Name": "Acme Corp"}, {"Name": "Acme Corp"}], "existing": []}',
        expectedOutput: '{"success": false, "error": "An Account with this name already exists."}',
        description: 'Should detect duplicates within the same batch',
      },
    ],
    acceptance: 72,
    submissions: 15420,
  },
  {
    id: 2,
    title: 'Auto-Populate Contact Fields',
    slug: 'auto-populate-contact-fields',
    difficulty: 'Easy',
    category: 'Trigger',
    tags: ['Before Insert', 'Field Default', 'Automation'],
    description: `## Auto-Populate Contact Fields

Write a **before insert** trigger on the \`Contact\` object that automatically populates fields based on the parent Account.

### Requirements:
- When a Contact is inserted with an \`AccountId\`, automatically copy the Account's \`Phone\` and \`BillingCity\` to the Contact's \`Phone\` and \`MailingCity\` fields (only if they are blank).
- Must be bulkified — query the parent Accounts in a single SOQL query.
- Do not overwrite existing values on the Contact.

### Real-World Context:
Sales reps frequently create contacts without filling in all fields. Auto-populating from the parent Account improves data completeness and saves time.`,
    constraints: [
      'Only populate blank fields on the Contact',
      'Must handle bulk inserts efficiently',
      'Single SOQL query for all parent Accounts',
    ],
    examples: [
      {
        input: 'Contact with blank Phone, AccountId points to Account with Phone "555-1234"',
        output: 'Contact.Phone = "555-1234"',
      },
      {
        input: 'Contact with Phone = "999-0000" and AccountId set',
        output: 'Contact.Phone remains "999-0000" (not overwritten)',
      },
    ],
    starterCode: `trigger AutoPopulateContact on Contact (before insert) {
    // Collect AccountIds from Trigger.new
    
    // Query parent Accounts
    
    // Populate blank fields from parent Account
    
}`,
    testCases: [
      {
        id: 1,
        input: '{"contacts": [{"LastName": "Smith", "AccountId": "001xx", "Phone": null}], "accounts": {"001xx": {"Phone": "555-1234", "BillingCity": "NYC"}}}',
        expectedOutput: '{"Phone": "555-1234", "MailingCity": "NYC"}',
        description: 'Should populate blank fields from parent Account',
      },
      {
        id: 2,
        input: '{"contacts": [{"LastName": "Jones", "AccountId": "001xx", "Phone": "999-0000"}], "accounts": {"001xx": {"Phone": "555-1234", "BillingCity": "NYC"}}}',
        expectedOutput: '{"Phone": "999-0000", "MailingCity": "NYC"}',
        description: 'Should not overwrite existing Contact Phone',
      },
    ],
    acceptance: 81,
    submissions: 12300,
  },
  {
    id: 3,
    title: 'Opportunity Stage Validation',
    slug: 'opportunity-stage-validation',
    difficulty: 'Medium',
    category: 'Trigger',
    tags: ['Before Update', 'Validation', 'Business Logic'],
    description: `## Opportunity Stage Validation

Write a **before update** trigger on the \`Opportunity\` object that enforces business rules around stage progression.

### Requirements:
- Opportunities cannot skip stages. The valid progression is:
  \`Prospecting → Qualification → Proposal → Negotiation → Closed Won\`
- Closed Lost can be set from any stage.
- Moving backward in stages should be allowed (for corrections).
- If an invalid stage transition is attempted, add an error with message: \`"Invalid stage transition from {oldStage} to {newStage}."\`
- When moving to "Closed Won", the \`Amount\` field must not be null or zero.

### Real-World Context:
Sales processes require structured stage progression. Skipping stages often means critical activities were missed (discovery calls, proposal reviews, etc.).`,
    constraints: [
      'Handle bulk updates',
      'Allow backward stage movement',
      'Allow Closed Lost from any stage',
      'Validate Amount on Closed Won',
    ],
    examples: [
      {
        input: 'Stage change: Prospecting → Proposal',
        output: 'Error: "Invalid stage transition from Prospecting to Proposal."',
        explanation: 'Cannot skip Qualification stage',
      },
      {
        input: 'Stage change: Qualification → Closed Lost',
        output: 'Stage updated successfully',
        explanation: 'Closed Lost is always allowed',
      },
    ],
    starterCode: `trigger OpportunityStageValidation on Opportunity (before update) {
    // Define valid stage order
    
    // For each updated Opportunity, check stage transition
    
    // Validate Amount for Closed Won
    
}`,
    testCases: [
      {
        id: 1,
        input: '{"oldStage": "Prospecting", "newStage": "Proposal", "Amount": 5000}',
        expectedOutput: '{"success": false, "error": "Invalid stage transition from Prospecting to Proposal."}',
        description: 'Should prevent skipping stages',
      },
      {
        id: 2,
        input: '{"oldStage": "Prospecting", "newStage": "Qualification", "Amount": 5000}',
        expectedOutput: '{"success": true}',
        description: 'Should allow valid forward progression',
      },
      {
        id: 3,
        input: '{"oldStage": "Negotiation", "newStage": "Closed Won", "Amount": 0}',
        expectedOutput: '{"success": false, "error": "Amount is required for Closed Won opportunities."}',
        description: 'Should require Amount for Closed Won',
      },
    ],
    acceptance: 58,
    submissions: 9870,
  },
  {
    id: 4,
    title: 'Roll-Up Summary Calculator',
    slug: 'rollup-summary-calculator',
    difficulty: 'Medium',
    category: 'Trigger',
    tags: ['After Insert', 'After Update', 'After Delete', 'Aggregation'],
    description: `## Roll-Up Summary Calculator

Write a trigger on the \`OpportunityLineItem\` object that maintains a custom roll-up summary on the parent \`Opportunity\`.

### Requirements:
- Calculate and update \`Total_Line_Items__c\` (count) and \`Total_Discount__c\` (sum of all line item discounts) on the parent Opportunity.
- Handle insert, update, and delete events.
- Handle undelete as well.
- Must be fully bulkified.

### Real-World Context:
While Salesforce provides native roll-up summary fields for master-detail relationships, custom roll-ups are needed for complex calculations, cross-object summaries, or lookup relationships.`,
    constraints: [
      'Handle all DML events: insert, update, delete, undelete',
      'Bulkified — single update DML for all affected Opportunities',
      'Use AggregateResult for calculations',
    ],
    examples: [
      {
        input: 'Insert 3 line items for Opportunity "Big Deal" with discounts 10%, 15%, 5%',
        output: 'Opportunity.Total_Line_Items__c = 3, Opportunity.Total_Discount__c = 30',
      },
    ],
    starterCode: `trigger RollUpSummary on OpportunityLineItem (after insert, after update, after delete, after undelete) {
    // Collect affected Opportunity Ids
    
    // Query aggregate results
    
    // Update parent Opportunities
    
}`,
    testCases: [
      {
        id: 1,
        input: '{"event": "insert", "lineItems": [{"OpportunityId": "006xx", "Discount": 10}, {"OpportunityId": "006xx", "Discount": 15}]}',
        expectedOutput: '{"Total_Line_Items__c": 2, "Total_Discount__c": 25}',
        description: 'Should calculate totals on insert',
      },
      {
        id: 2,
        input: '{"event": "delete", "lineItems": [{"OpportunityId": "006xx", "Discount": 10}], "remaining": [{"Discount": 15}]}',
        expectedOutput: '{"Total_Line_Items__c": 1, "Total_Discount__c": 15}',
        description: 'Should recalculate on delete',
      },
    ],
    acceptance: 52,
    submissions: 7650,
  },
  {
    id: 5,
    title: 'Account Territory Assignment Service',
    slug: 'account-territory-assignment',
    difficulty: 'Medium',
    category: 'Class',
    tags: ['Apex Class', 'Business Logic', 'Service Layer'],
    description: `## Account Territory Assignment Service

Create an Apex class \`TerritoryAssignmentService\` that assigns Accounts to sales territories based on their billing address.

### Requirements:
- Method: \`static List<Account> assignTerritories(List<Account> accounts)\`
- Territory rules:
  - **West**: CA, OR, WA, NV, AZ
  - **Central**: TX, IL, OH, MI, MN
  - **East**: NY, NJ, MA, PA, FL
  - **International**: Any non-US country
- Set the \`Territory__c\` custom field on each Account.
- If the state doesn't match any region, set Territory to "Unassigned".
- Return the list of Accounts with territories assigned.

### Real-World Context:
Territory management is essential for sales organizations. Automating territory assignment ensures consistent coverage and eliminates manual routing errors.`,
    constraints: [
      'Method must be static and bulkified',
      'Handle null BillingState gracefully',
      'Support both US and International accounts',
    ],
    examples: [
      {
        input: 'Account with BillingState = "CA", BillingCountry = "US"',
        output: 'Territory__c = "West"',
      },
      {
        input: 'Account with BillingCountry = "UK"',
        output: 'Territory__c = "International"',
      },
    ],
    starterCode: `public class TerritoryAssignmentService {
    
    public static List<Account> assignTerritories(List<Account> accounts) {
        // Define territory mappings
        
        // Iterate through accounts and assign territories
        
        // Return updated accounts
        return accounts;
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"accounts": [{"Name": "West Co", "BillingState": "CA", "BillingCountry": "US"}]}',
        expectedOutput: '{"Territory__c": "West"}',
        description: 'Should assign West territory for CA',
      },
      {
        id: 2,
        input: '{"accounts": [{"Name": "UK Ltd", "BillingState": null, "BillingCountry": "UK"}]}',
        expectedOutput: '{"Territory__c": "International"}',
        description: 'Should assign International for non-US',
      },
      {
        id: 3,
        input: '{"accounts": [{"Name": "Unknown", "BillingState": "XX", "BillingCountry": "US"}]}',
        expectedOutput: '{"Territory__c": "Unassigned"}',
        description: 'Should assign Unassigned for unknown state',
      },
    ],
    acceptance: 67,
    submissions: 8900,
  },
  {
    id: 6,
    title: 'Dynamic SOQL Query Builder',
    slug: 'dynamic-soql-query-builder',
    difficulty: 'Hard',
    category: 'Class',
    tags: ['Dynamic SOQL', 'Security', 'Utility'],
    description: `## Dynamic SOQL Query Builder

Create an Apex class \`QueryBuilder\` that constructs dynamic, injection-safe SOQL queries.

### Requirements:
- Implement a fluent/builder pattern API:
  \`\`\`apex
  QueryBuilder qb = new QueryBuilder('Account')
      .selectFields(new List<String>{'Name', 'Industry'})
      .addFilter('Industry', '=', 'Technology')
      .addFilter('AnnualRevenue', '>', 1000000)
      .orderBy('Name', 'ASC')
      .setLimit(50);
  List<SObject> results = qb.execute();
  \`\`\`
- Prevent SOQL injection by using bind variables or escaping.
- Enforce Field-Level Security (FLS) checks before querying.
- Support the following filter operators: \`=\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`, \`LIKE\`, \`IN\`.
- Throw meaningful exceptions for invalid inputs.

### Real-World Context:
Dynamic SOQL is common in AppExchange packages and configurable apps. Building a secure query builder prevents injection attacks and ensures governor limit compliance.`,
    constraints: [
      'Must prevent SOQL injection',
      'Must check FLS before executing',
      'Support all listed operators',
      'Handle null values appropriately',
    ],
    examples: [
      {
        input: "QueryBuilder('Account').selectFields(['Name']).addFilter('Industry', '=', 'Tech').execute()",
        output: "SELECT Name FROM Account WHERE Industry = 'Tech'",
      },
    ],
    starterCode: `public class QueryBuilder {
    private String objectName;
    private List<String> fields;
    private List<String> conditions;
    private String orderByField;
    private String orderByDirection;
    private Integer queryLimit;
    
    public QueryBuilder(String objectName) {
        this.objectName = objectName;
        this.fields = new List<String>();
        this.conditions = new List<String>();
    }
    
    public QueryBuilder selectFields(List<String> fieldNames) {
        // Add fields to select
        return this;
    }
    
    public QueryBuilder addFilter(String field, String operator, Object value) {
        // Add WHERE condition (injection-safe)
        return this;
    }
    
    public QueryBuilder orderBy(String field, String direction) {
        // Set ORDER BY
        return this;
    }
    
    public QueryBuilder setLimit(Integer lim) {
        // Set LIMIT
        return this;
    }
    
    public String buildQuery() {
        // Build the SOQL string
        return '';
    }
    
    public List<SObject> execute() {
        // Execute and return results
        return null;
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"object": "Account", "fields": ["Name", "Industry"], "filters": [{"field": "Industry", "op": "=", "value": "Technology"}]}',
        expectedOutput: '{"query": "SELECT Name, Industry FROM Account WHERE Industry = :bind0"}',
        description: 'Should build basic SELECT with WHERE',
      },
      {
        id: 2,
        input: '{"object": "Contact", "fields": ["FirstName"], "filters": [{"field": "Name", "op": "LIKE", "value": "%test%"}], "limit": 10}',
        expectedOutput: '{"query": "SELECT FirstName FROM Contact WHERE Name LIKE :bind0 LIMIT 10"}',
        description: 'Should support LIKE operator with LIMIT',
      },
    ],
    acceptance: 41,
    submissions: 6200,
  },
  {
    id: 7,
    title: 'Batch Apex: Data Cleanup Job',
    slug: 'batch-data-cleanup',
    difficulty: 'Medium',
    category: 'Async Apex',
    tags: ['Batch Apex', 'Data Cleanup', 'Schedulable'],
    description: `## Batch Apex: Data Cleanup Job

Create a Batch Apex class \`DataCleanupBatch\` that identifies and processes stale records.

### Requirements:
- Implement \`Database.Batchable<SObject>\` and \`Schedulable\` interfaces.
- \`start()\`: Query all Contacts where \`LastActivityDate\` is older than 1 year and \`Status__c\` is not "Active".
- \`execute()\`: For each batch of stale contacts:
  - Set \`Status__c = 'Inactive'\`
  - Set \`Cleanup_Date__c = System.today()\`
  - Send a summary email to the admin after each batch.
- \`finish()\`: Send a final summary email with total records processed.
- Implement the \`Schedulable\` interface to schedule this job to run weekly.
- Use \`Database.Stateful\` to track total records processed across batches.

### Real-World Context:
Large Salesforce orgs accumulate stale data over time. Batch Apex is the proper tool for processing large datasets while respecting governor limits.`,
    constraints: [
      'Must implement Database.Batchable and Schedulable',
      'Use Database.Stateful for cross-batch state',
      'Handle partial failures gracefully',
      'Batch size should default to 200',
    ],
    examples: [
      {
        input: '500 stale Contacts with LastActivityDate > 1 year ago',
        output: 'All 500 Contacts updated to Status = Inactive, finish email sent',
      },
    ],
    starterCode: `global class DataCleanupBatch implements Database.Batchable<SObject>, Database.Stateful, Schedulable {
    
    global Integer totalProcessed = 0;
    global Integer totalErrors = 0;
    
    // Schedulable execute
    global void execute(SchedulableContext sc) {
        // Execute the batch
    }
    
    // Batchable start
    global Database.QueryLocator start(Database.BatchableContext bc) {
        // Query stale contacts
        return null;
    }
    
    // Batchable execute
    global void execute(Database.BatchableContext bc, List<Contact> scope) {
        // Process stale contacts
    }
    
    // Batchable finish
    global void finish(Database.BatchableContext bc) {
        // Send summary email
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"contacts": [{"LastName": "Old", "LastActivityDate": "2023-01-01", "Status__c": "Prospect"}]}',
        expectedOutput: '{"Status__c": "Inactive", "Cleanup_Date__c": "today"}',
        description: 'Should mark stale contacts as Inactive',
      },
      {
        id: 2,
        input: '{"contacts": [{"LastName": "Active", "LastActivityDate": "2023-01-01", "Status__c": "Active"}]}',
        expectedOutput: '{"filtered": true}',
        description: 'Should not process Active contacts',
      },
    ],
    acceptance: 63,
    submissions: 11200,
  },
  {
    id: 8,
    title: 'Queueable Chain: Order Processing',
    slug: 'queueable-order-processing',
    difficulty: 'Hard',
    category: 'Async Apex',
    tags: ['Queueable', 'Chaining', 'Transaction Control'],
    description: `## Queueable Chain: Order Processing Pipeline

Create a series of Queueable Apex classes that implement an order processing pipeline.

### Requirements:
- **Step 1 - \`ValidateOrderQueueable\`**: Validates order data (check inventory, validate addresses, verify customer credit).
- **Step 2 - \`ProcessPaymentQueueable\`**: Processes payment (called from Step 1 on success). Updates \`Payment_Status__c\`.
- **Step 3 - \`FulfillOrderQueueable\`**: Creates shipment records and sends confirmation (called from Step 2 on success).
- Each step should:
  - Accept order IDs as constructor parameters
  - Implement proper error handling
  - Log results to a custom \`Order_Processing_Log__c\` object
  - Chain to the next step only on success
- Implement \`Database.AllowsCallouts\` on the payment step for external payment gateway integration.

### Real-World Context:
Complex business processes often need to be broken into separate transactions to avoid governor limits and handle failures gracefully. Queueable chaining provides a reliable way to orchestrate multi-step processes.`,
    constraints: [
      'Each step must be a separate Queueable class',
      'Implement proper error handling and logging',
      'Chain only on success',
      'Payment step must allow callouts',
    ],
    examples: [
      {
        input: 'Order "ORD-001" with valid inventory and payment',
        output: 'All 3 steps complete, Order_Status__c = "Fulfilled"',
      },
      {
        input: 'Order "ORD-002" with invalid payment',
        output: 'Step 1 passes, Step 2 fails, Step 3 not executed, error logged',
      },
    ],
    starterCode: `public class ValidateOrderQueueable implements Queueable {
    
    private List<Id> orderIds;
    
    public ValidateOrderQueueable(List<Id> orderIds) {
        this.orderIds = orderIds;
    }
    
    public void execute(QueueableContext context) {
        // Validate orders
        
        // On success, chain to ProcessPaymentQueueable
    }
}

public class ProcessPaymentQueueable implements Queueable, Database.AllowsCallouts {
    
    private List<Id> orderIds;
    
    public ProcessPaymentQueueable(List<Id> orderIds) {
        this.orderIds = orderIds;
    }
    
    public void execute(QueueableContext context) {
        // Process payments
        
        // On success, chain to FulfillOrderQueueable
    }
}

public class FulfillOrderQueueable implements Queueable {
    
    private List<Id> orderIds;
    
    public FulfillOrderQueueable(List<Id> orderIds) {
        this.orderIds = orderIds;
    }
    
    public void execute(QueueableContext context) {
        // Create shipment records
        
        // Update Order status to Fulfilled
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"orderIds": ["ORD-001"], "inventory": "available", "payment": "valid"}',
        expectedOutput: '{"Order_Status__c": "Fulfilled", "steps_completed": 3}',
        description: 'Should complete full pipeline for valid order',
      },
      {
        id: 2,
        input: '{"orderIds": ["ORD-002"], "inventory": "available", "payment": "declined"}',
        expectedOutput: '{"Order_Status__c": "Payment Failed", "steps_completed": 1, "error_logged": true}',
        description: 'Should stop pipeline on payment failure',
      },
    ],
    acceptance: 38,
    submissions: 5400,
  },
  {
    id: 9,
    title: 'Future Method: External API Sync',
    slug: 'future-method-api-sync',
    difficulty: 'Easy',
    category: 'Async Apex',
    tags: ['Future Method', 'Callout', 'Integration'],
    description: `## Future Method: External API Sync

Create an Apex class \`ExternalSyncService\` with a future method that syncs Account data to an external system via REST API.

### Requirements:
- Method signature: \`@future(callout=true) public static void syncAccounts(Set<Id> accountIds)\`
- Query Account fields: Name, Phone, BillingStreet, BillingCity, BillingState, BillingCountry.
- Make an HTTP POST to the external endpoint with Account data as JSON.
- Handle HTTP responses:
  - 200/201: Log success
  - 4xx: Log error, do not retry
  - 5xx: Log error for manual retry
- Create \`Integration_Log__c\` records for each sync attempt.
- Method should be called from an after insert/update trigger.

### Real-World Context:
Salesforce often serves as the system of record, but data needs to be synced to external ERP, marketing, or analytics platforms. Future methods provide a simple way to make callouts from trigger context.`,
    constraints: [
      'Must use @future(callout=true)',
      'Handle all HTTP response codes',
      'Create integration log records',
      'Accept Set<Id> (future methods cannot accept SObjects)',
    ],
    examples: [
      {
        input: 'Sync Account "Acme Corp" to external API',
        output: 'HTTP 200 — Integration_Log__c created with Status = "Success"',
      },
    ],
    starterCode: `public class ExternalSyncService {
    
    private static final String ENDPOINT = 'https://api.external-system.com/accounts';
    
    @future(callout=true)
    public static void syncAccounts(Set<Id> accountIds) {
        // Query Account data
        
        // Build JSON payload
        
        // Make HTTP POST callout
        
        // Handle response and create log records
    }
    
    private static void createLog(Id accountId, String status, String message) {
        // Create Integration_Log__c record
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"accountIds": ["001xx"], "httpResponse": 200}',
        expectedOutput: '{"logStatus": "Success", "logMessage": "Account synced successfully"}',
        description: 'Should log success for 200 response',
      },
      {
        id: 2,
        input: '{"accountIds": ["001xx"], "httpResponse": 500}',
        expectedOutput: '{"logStatus": "Error", "logMessage": "Server error - manual retry required"}',
        description: 'Should log error for 500 response',
      },
    ],
    acceptance: 75,
    submissions: 13500,
  },
  {
    id: 10,
    title: 'Platform Event Handler',
    slug: 'platform-event-handler',
    difficulty: 'Hard',
    category: 'Async Apex',
    tags: ['Platform Events', 'Event-Driven', 'Trigger'],
    description: `## Platform Event: Order Notification System

Design a Platform Event-based notification system for order status changes.

### Requirements:
- Create a trigger on \`Order_Event__e\` Platform Event.
- The event payload includes: \`Order_Id__c\`, \`Status__c\`, \`Customer_Email__c\`, \`Priority__c\`.
- Based on Priority:
  - **High**: Create a Task for the Account owner AND send an email notification.
  - **Medium**: Create a Task for the Account owner.
  - **Low**: Only update the order record.
- Implement \`EventBus.RetryableException\` for transient failures.
- Use \`setResumeCheckpoint\` to handle partial processing in case of retries.
- Log all events to \`Event_Processing_Log__c\`.

### Real-World Context:
Platform Events enable event-driven architecture in Salesforce. They're ideal for decoupling producers and consumers, handling high-volume integrations, and building reactive systems.`,
    constraints: [
      'Handle EventBus replay and retry',
      'Use setResumeCheckpoint for large batches',
      'Bulkify all DML operations',
      'Handle mixed priorities in a single batch',
    ],
    examples: [
      {
        input: 'High priority event for Order "ORD-100"',
        output: 'Task created + Email sent + Log record created',
      },
      {
        input: 'Low priority event for Order "ORD-200"',
        output: 'Order record updated + Log record created',
      },
    ],
    starterCode: `trigger OrderEventTrigger on Order_Event__e (after insert) {
    
    List<Task> tasksToCreate = new List<Task>();
    List<Messaging.SingleEmailMessage> emailsToSend = new List<Messaging.SingleEmailMessage>();
    List<Event_Processing_Log__c> logs = new List<Event_Processing_Log__c>();
    
    for (Order_Event__e event : Trigger.new) {
        // Set resume checkpoint for retry handling
        
        // Process based on Priority
        
        // Create log record
    }
    
    // Perform DML operations
    
    // Send emails
}`,
    testCases: [
      {
        id: 1,
        input: '{"events": [{"Order_Id__c": "ORD-100", "Status__c": "Shipped", "Priority__c": "High", "Customer_Email__c": "test@example.com"}]}',
        expectedOutput: '{"taskCreated": true, "emailSent": true, "logCreated": true}',
        description: 'Should create task and send email for high priority',
      },
      {
        id: 2,
        input: '{"events": [{"Order_Id__c": "ORD-200", "Status__c": "Processing", "Priority__c": "Low", "Customer_Email__c": "test@example.com"}]}',
        expectedOutput: '{"taskCreated": false, "emailSent": false, "logCreated": true, "orderUpdated": true}',
        description: 'Should only update order for low priority',
      },
    ],
    acceptance: 35,
    submissions: 4300,
  },
  {
    id: 11,
    title: 'Trigger Handler Framework',
    slug: 'trigger-handler-framework',
    difficulty: 'Hard',
    category: 'Class',
    tags: ['Design Pattern', 'Framework', 'Best Practice'],
    description: `## Trigger Handler Framework

Implement a reusable Trigger Handler Framework following Salesforce best practices.

### Requirements:
- Create an abstract class \`TriggerHandler\` with:
  - Virtual methods for each trigger context: \`beforeInsert()\`, \`afterInsert()\`, \`beforeUpdate()\`, \`afterUpdate()\`, \`beforeDelete()\`, \`afterDelete()\`, \`afterUndelete()\`
  - A \`run()\` method that dispatches to the correct handler based on \`Trigger.operationType\`
  - Static recursion prevention using a \`Set<String>\`
  - A \`bypass()\` and \`clearBypass()\` mechanism
  - Max loop count protection
- Create a concrete implementation: \`AccountTriggerHandler extends TriggerHandler\`
  - \`beforeInsert\`: Validate required fields
  - \`afterInsert\`: Create default Contact for new Accounts

### Real-World Context:
A Trigger Handler Framework is the foundation of well-architected Salesforce development. It separates trigger logic from the trigger itself, prevents recursion, and makes code testable and maintainable.`,
    constraints: [
      'Abstract class with virtual methods',
      'Static recursion prevention',
      'Bypass mechanism for data migrations',
      'Max loop count to prevent infinite loops',
    ],
    examples: [
      {
        input: 'AccountTrigger fires on before insert',
        output: 'TriggerHandler.run() dispatches to AccountTriggerHandler.beforeInsert()',
      },
    ],
    starterCode: `public virtual class TriggerHandler {
    
    private static Set<String> bypassedHandlers = new Set<String>();
    private static Map<String, Integer> loopCountMap = new Map<String, Integer>();
    private Integer maxLoopCount = -1;
    
    public void run() {
        // Check bypass
        
        // Check loop count
        
        // Dispatch to correct context method
    }
    
    public void setMaxLoopCount(Integer max) {
        this.maxLoopCount = max;
    }
    
    public static void bypass(String handlerName) {
        bypassedHandlers.add(handlerName);
    }
    
    public static void clearBypass(String handlerName) {
        bypassedHandlers.remove(handlerName);
    }
    
    // Virtual methods for each context
    protected virtual void beforeInsert() {}
    protected virtual void afterInsert() {}
    protected virtual void beforeUpdate() {}
    protected virtual void afterUpdate() {}
    protected virtual void beforeDelete() {}
    protected virtual void afterDelete() {}
    protected virtual void afterUndelete() {}
}`,
    testCases: [
      {
        id: 1,
        input: '{"context": "BEFORE_INSERT", "handler": "AccountTriggerHandler"}',
        expectedOutput: '{"methodCalled": "beforeInsert", "bypassed": false}',
        description: 'Should dispatch to correct handler method',
      },
      {
        id: 2,
        input: '{"context": "BEFORE_INSERT", "handler": "AccountTriggerHandler", "bypass": true}',
        expectedOutput: '{"methodCalled": null, "bypassed": true}',
        description: 'Should skip execution when bypassed',
      },
    ],
    acceptance: 45,
    submissions: 7800,
  },
  {
    id: 12,
    title: 'Invocable Apex for Flow',
    slug: 'invocable-apex-for-flow',
    difficulty: 'Easy',
    category: 'Class',
    tags: ['Invocable', 'Flow', 'Declarative'],
    description: `## Invocable Apex for Flow Integration

Create an Invocable Apex class that can be called from Salesforce Flows to perform complex operations that aren't possible declaratively.

### Requirements:
- Class: \`LeadConversionAction\`
- Method decorated with \`@InvocableMethod\`
- Input wrapper class with \`@InvocableVariable\` annotations:
  - \`leadId\` (required)
  - \`convertToExistingAccount\` (optional, Boolean)
  - \`accountId\` (optional, for existing account conversion)
  - \`createOpportunity\` (optional, Boolean, default true)
  - \`opportunityName\` (optional)
- Perform Lead conversion using \`Database.LeadConvert\`
- Return a result wrapper with: \`convertedAccountId\`, \`convertedContactId\`, \`convertedOpportunityId\`, \`isSuccess\`, \`errorMessage\`

### Real-World Context:
Admins love Flows, but some operations (like Lead conversion) require Apex. Invocable Apex bridges the gap, letting admins use complex logic in their Flows without writing triggers.`,
    constraints: [
      'Must use @InvocableMethod and @InvocableVariable',
      'Handle both new and existing Account conversion',
      'Return meaningful error messages',
      'Support bulk operations from Flow',
    ],
    examples: [
      {
        input: 'Convert Lead "John Doe" to new Account',
        output: 'Account, Contact, and Opportunity created; IDs returned',
      },
    ],
    starterCode: `public class LeadConversionAction {
    
    public class ConversionRequest {
        @InvocableVariable(required=true label='Lead ID')
        public Id leadId;
        
        @InvocableVariable(label='Convert to Existing Account')
        public Boolean convertToExistingAccount;
        
        @InvocableVariable(label='Existing Account ID')
        public Id accountId;
        
        @InvocableVariable(label='Create Opportunity')
        public Boolean createOpportunity;
        
        @InvocableVariable(label='Opportunity Name')
        public String opportunityName;
    }
    
    public class ConversionResult {
        @InvocableVariable public Id convertedAccountId;
        @InvocableVariable public Id convertedContactId;
        @InvocableVariable public Id convertedOpportunityId;
        @InvocableVariable public Boolean isSuccess;
        @InvocableVariable public String errorMessage;
    }
    
    @InvocableMethod(label='Convert Lead' description='Converts a Lead to Account, Contact, and optionally Opportunity')
    public static List<ConversionResult> convertLeads(List<ConversionRequest> requests) {
        List<ConversionResult> results = new List<ConversionResult>();
        
        // Process each conversion request
        
        return results;
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"leadId": "00Qxx", "createOpportunity": true}',
        expectedOutput: '{"isSuccess": true, "convertedAccountId": "001xx", "convertedContactId": "003xx", "convertedOpportunityId": "006xx"}',
        description: 'Should convert lead with opportunity',
      },
      {
        id: 2,
        input: '{"leadId": "00Qxx", "createOpportunity": false}',
        expectedOutput: '{"isSuccess": true, "convertedAccountId": "001xx", "convertedContactId": "003xx", "convertedOpportunityId": null}',
        description: 'Should convert lead without opportunity',
      },
    ],
    acceptance: 78,
    submissions: 10200,
  },
  {
    id: 13,
    title: 'Scheduled Apex: Report Generator',
    slug: 'scheduled-report-generator',
    difficulty: 'Medium',
    category: 'Async Apex',
    tags: ['Schedulable', 'Reporting', 'Email'],
    description: `## Scheduled Apex: Weekly Sales Report Generator

Create a Scheduled Apex class that generates and emails a weekly sales report.

### Requirements:
- Class: \`WeeklySalesReportScheduler\` implementing \`Schedulable\`
- Generate report data:
  - Total Opportunities Closed Won this week
  - Total Revenue this week
  - Top 5 deals by Amount
  - Win rate (Closed Won / (Closed Won + Closed Lost))
  - Pipeline value (open Opportunities)
- Format as an HTML email with a professional table layout
- Send to all Users with the "Sales Manager" profile
- Schedule to run every Monday at 7:00 AM
- Handle edge cases: no data, no recipients

### Real-World Context:
Automated reporting saves managers hours of manual work and ensures consistent visibility into sales performance. Scheduled Apex is perfect for recurring, time-based processes.`,
    constraints: [
      'Must implement Schedulable interface',
      'HTML email with proper formatting',
      'Handle zero-data scenarios gracefully',
      'Efficient SOQL — minimize queries',
    ],
    examples: [
      {
        input: 'Monday 7 AM — 10 Closed Won Opps this week',
        output: 'HTML email sent to Sales Managers with metrics table',
      },
    ],
    starterCode: `global class WeeklySalesReportScheduler implements Schedulable {
    
    global void execute(SchedulableContext sc) {
        // Gather report data
        
        // Build HTML email body
        
        // Get recipients
        
        // Send email
    }
    
    private Map<String, Object> gatherReportData() {
        // Query Opportunities closed this week
        
        // Calculate metrics
        
        return null;
    }
    
    private String buildHtmlReport(Map<String, Object> data) {
        // Build professional HTML table
        
        return '';
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"closedWonThisWeek": 10, "totalRevenue": 500000, "closedLost": 5}',
        expectedOutput: '{"winRate": "66.67%", "emailSent": true}',
        description: 'Should calculate correct win rate and send email',
      },
      {
        id: 2,
        input: '{"closedWonThisWeek": 0, "totalRevenue": 0, "closedLost": 0}',
        expectedOutput: '{"winRate": "N/A", "emailSent": true, "message": "No closed opportunities this week"}',
        description: 'Should handle zero data gracefully',
      },
    ],
    acceptance: 59,
    submissions: 8700,
  },
  {
    id: 14,
    title: 'Custom REST API Endpoint',
    slug: 'custom-rest-api-endpoint',
    difficulty: 'Medium',
    category: 'Integration',
    tags: ['REST API', 'HttpGet', 'HttpPost', 'Integration'],
    description: `## Custom REST API Endpoint

Create a custom Apex REST API that exposes Account and Contact data to external systems.

### Requirements:
- Class: \`AccountAPIController\` annotated with \`@RestResource(urlMapping='/api/accounts/*')\`
- Implement the following HTTP methods:
  - **GET** \`/api/accounts/{accountId}\`: Return Account with related Contacts
  - **POST** \`/api/accounts\`: Create a new Account with optional Contacts
  - **PATCH** \`/api/accounts/{accountId}\`: Update Account fields
  - **DELETE** \`/api/accounts/{accountId}\`: Soft-delete (set \`IsDeleted__c = true\`)
- Response format: Standardized JSON with \`success\`, \`data\`, \`message\`, and \`errors\` fields.
- Implement proper error handling for:
  - Record not found (404)
  - Validation errors (400)
  - System errors (500)
- Add request validation and sanitization.

### Real-World Context:
Custom REST APIs allow external systems (portals, mobile apps, partner integrations) to interact with Salesforce data in a controlled, secure manner.`,
    constraints: [
      'Use @RestResource annotation',
      'Standardized JSON response format',
      'Proper HTTP status codes',
      'Input validation and sanitization',
    ],
    examples: [
      {
        input: 'GET /api/accounts/001xxxxxxxxxxxx',
        output: '{"success": true, "data": {"Name": "Acme", "Contacts": [...]}}',
      },
      {
        input: 'GET /api/accounts/invalid_id',
        output: '{"success": false, "message": "Account not found", "errors": ["Invalid Account ID"]}',
      },
    ],
    starterCode: `@RestResource(urlMapping='/api/accounts/*')
global class AccountAPIController {
    
    @HttpGet
    global static void getAccount() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        
        // Extract Account ID from URL
        
        // Query Account with Contacts
        
        // Return standardized response
    }
    
    @HttpPost
    global static void createAccount() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        
        // Parse request body
        
        // Validate input
        
        // Create Account and Contacts
        
        // Return response
    }
    
    @HttpPatch
    global static void updateAccount() {
        // Update Account fields
    }
    
    @HttpDelete
    global static void deleteAccount() {
        // Soft delete Account
    }
    
    private static String buildResponse(Boolean success, Object data, String message, List<String> errors) {
        // Build standardized JSON response
        return '';
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"method": "GET", "accountId": "001xx"}',
        expectedOutput: '{"success": true, "data": {"Name": "Acme Corp", "Contacts": []}, "statusCode": 200}',
        description: 'Should return Account data for valid GET',
      },
      {
        id: 2,
        input: '{"method": "POST", "body": {"Name": "New Corp", "Contacts": [{"LastName": "Smith"}]}}',
        expectedOutput: '{"success": true, "data": {"Id": "001xx"}, "statusCode": 201}',
        description: 'Should create Account with Contacts',
      },
      {
        id: 3,
        input: '{"method": "GET", "accountId": "invalid"}',
        expectedOutput: '{"success": false, "message": "Account not found", "statusCode": 404}',
        description: 'Should return 404 for invalid ID',
      },
    ],
    acceptance: 54,
    submissions: 9100,
  },
  {
    id: 15,
    title: 'Test Class: Comprehensive Coverage',
    slug: 'test-class-comprehensive',
    difficulty: 'Medium',
    category: 'Class',
    tags: ['Test Class', 'Test Data Factory', 'Assertions'],
    description: `## Test Class with Comprehensive Coverage

Write a comprehensive test class for the \`TerritoryAssignmentService\` (Problem #5).

### Requirements:
- Class: \`TerritoryAssignmentServiceTest\`
- Create a \`TestDataFactory\` utility class for reusable test data creation.
- Test scenarios:
  - Positive tests: Each territory assignment (West, Central, East, International)
  - Negative tests: Null state, blank state, unknown state
  - Bulk test: 200 Accounts with mixed territories
  - Edge cases: Null Account list, empty Account list
- Use \`@testSetup\` for shared test data.
- Assert with meaningful messages using \`System.assertEquals(expected, actual, 'message')\`.
- Achieve 100% code coverage.
- Use \`Test.startTest()\` / \`Test.stopTest()\` to reset governor limits.

### Real-World Context:
Salesforce requires 75% code coverage for production deployment, but professional teams aim for 90%+. Well-structured tests catch bugs early, document expected behavior, and enable confident refactoring.`,
    constraints: [
      'Use @testSetup for shared data',
      'Test positive, negative, and bulk scenarios',
      'Meaningful assertion messages',
      'Use TestDataFactory for data creation',
    ],
    examples: [
      {
        input: 'Run all tests for TerritoryAssignmentService',
        output: '100% coverage, all assertions pass',
      },
    ],
    starterCode: `@isTest
public class TerritoryAssignmentServiceTest {
    
    @testSetup
    static void setup() {
        // Create test data using TestDataFactory
    }
    
    @isTest
    static void testWestTerritory() {
        // Test CA, OR, WA, NV, AZ accounts
    }
    
    @isTest
    static void testCentralTerritory() {
        // Test TX, IL, OH, MI, MN accounts
    }
    
    @isTest
    static void testEastTerritory() {
        // Test NY, NJ, MA, PA, FL accounts
    }
    
    @isTest
    static void testInternationalTerritory() {
        // Test non-US accounts
    }
    
    @isTest
    static void testNullState() {
        // Test account with null BillingState
    }
    
    @isTest
    static void testBulkAssignment() {
        // Test 200 accounts
    }
}`,
    testCases: [
      {
        id: 1,
        input: '{"testMethod": "testWestTerritory", "accounts": [{"BillingState": "CA", "BillingCountry": "US"}]}',
        expectedOutput: '{"Territory__c": "West", "testPassed": true}',
        description: 'West territory test should pass',
      },
      {
        id: 2,
        input: '{"testMethod": "testBulkAssignment", "recordCount": 200}',
        expectedOutput: '{"allAssigned": true, "testPassed": true, "governorLimitsRespected": true}',
        description: 'Bulk test should pass within governor limits',
      },
    ],
    acceptance: 69,
    submissions: 11800,
  },
];

export const categories: Category[] = ['Trigger', 'Class', 'Async Apex', 'SOQL', 'Integration'];
export const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export function getProblemBySlug(slug: string): Problem | undefined {
  return problems.find(p => p.slug === slug);
}

export function filterProblems(
  category?: Category | 'All',
  difficulty?: Difficulty | 'All',
  search?: string
): Problem[] {
  return problems.filter(p => {
    if (category && category !== 'All' && p.category !== category) return false;
    if (difficulty && difficulty !== 'All' && p.difficulty !== difficulty) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });
}
