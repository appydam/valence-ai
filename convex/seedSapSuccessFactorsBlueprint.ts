/**
 * Seed SAP SuccessFactors integration blueprint
 * Run this once to create the SAP SuccessFactors blueprint in the database
 *
 * Usage:
 * 1. Go to Convex dashboard
 * 2. Functions -> seedSapSuccessFactorsBlueprint -> Run
 *
 * Prerequisites:
 * 1. SAP SuccessFactors system with API access enabled
 * 2. API user with appropriate RBP (Role-Based Permissions) for OData entities
 * 3. Connect via the Integrations page using basic auth (username@companyId:password)
 *
 * IMPORTANT: SAP SuccessFactors uses OData v2 protocol. All API paths use {instanceUrl}
 * which is the datacenter-specific URL (e.g. https://api4.successfactors.com).
 * Query params use OData syntax: $format, $filter, $select, $top, $expand.
 */

import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "sap-successfactors"))
      .first();

    if (existing) {
      return {
        message: "SAP SuccessFactors blueprint already exists",
        blueprintId: existing._id,
        status: existing.status,
      };
    }

    const now = Date.now();

    const blueprintId = await ctx.db.insert("blueprints", {
      slug: "sap-successfactors",
      name: "SAP SuccessFactors",
      description:
        "Human capital management (HCM) platform. Access employee profiles, job information, compensation data, time-off records, and performance goals via SAP SuccessFactors OData APIs.",
      category: "HR",
      version: 1,
      status: "active",
      authType: "basic_auth",
      authConfig: JSON.stringify({
        usernameLabel: "Username (format: user@companyId)",
        passwordLabel: "Password",
        note: "Use the format username@companyId for the username. The instance URL is your datacenter URL (e.g. https://api4.successfactors.com).",
      }),
      baseUrl: "https://api4.successfactors.com/odata/v2",
      defaultHeaders: JSON.stringify({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      apiProtocol: "rest",
      sourceType: "manual",
      sourceUrl:
        "https://help.sap.com/docs/SAP_SUCCESSFACTORS_PLATFORM/28bc3c8e3f214ab487ec51b1b8709adc/",
      iconUrl: "https://cdn.worldvectorlogo.com/logos/sap-1.svg",
      createdAt: now,
      updatedAt: now,
      createdBy: "system",
    });

    const tools = [
      {
        name: "list_employees",
        displayName: "List Employees",
        description:
          "List employee records (User entities) from SAP SuccessFactors. Filter by name, department, status, or custom fields using OData $filter.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/User",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description:
              "SAP SuccessFactors API URL (e.g. https://api4.successfactors.com)",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Max records to return",
          },
          {
            name: "$skip",
            type: "number",
            default: 0,
            description: "Records to skip for pagination",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Examples: status eq 'active', department eq 'Engineering', substringof('John',firstName)",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Comma-separated fields. Example: userId,firstName,lastName,email,department,jobTitle,status",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "List employees. Use $filter for OData filtering. Common fields: userId, firstName, lastName, email, department, jobTitle, status, hireDate, location.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          $top: 25,
          $filter: "status eq 'active'",
          $select:
            "userId,firstName,lastName,email,department,jobTitle,hireDate",
          $format: "json",
        }),
      },
      {
        name: "get_employee",
        displayName: "Get Employee",
        description:
          "Get a specific employee's profile by userId. Returns personal info, job details, and custom fields.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/User('{userId}')",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP SuccessFactors API URL",
          },
          {
            name: "userId",
            type: "string",
            required: true,
            description: "Employee userId (e.g. 'john.doe')",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$format",
            type: "string",
            default: "json",
            description: "Response format",
          },
        ]),
        aiUsageHint:
          "Get employee profile by userId. Returns all User entity fields.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          userId: "john.doe",
          $format: "json",
        }),
      },
      {
        name: "list_job_info",
        displayName: "List Job Information",
        description:
          "Get job information records (EmpJob) for employees. Shows position, department, manager, job code, and employment history.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/EmpJob",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP SuccessFactors API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Max records",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: userId eq 'john.doe' to get a specific employee's job history",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields: userId,position,department,managerId,jobCode,employmentType,startDate",
          },
          {
            name: "$orderby",
            type: "string",
            description: "Sort order. Example: startDate desc",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
          },
        ]),
        aiUsageHint:
          "Get job history/details. Filter by userId for a specific employee. Records are time-sliced — latest record is current position.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          $filter: "userId eq 'john.doe'",
          $select:
            "userId,position,department,managerId,jobCode,employmentType,startDate",
          $orderby: "startDate desc",
          $top: 5,
          $format: "json",
        }),
      },
      {
        name: "list_compensation",
        displayName: "List Compensation Data",
        description:
          "Get employee compensation records (EmpCompensation). Shows salary, pay grade, currency, and compensation history.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/EmpCompensation",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP SuccessFactors API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Max records",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: userId eq 'john.doe'",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields: userId,payGrade,salary,currency,frequency,startDate",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
          },
        ]),
        aiUsageHint:
          "Get compensation data. Sensitive information — ensure proper RBP access. Filter by userId for individual records.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          $filter: "userId eq 'john.doe'",
          $select: "userId,payGrade,salary,currency,frequency,startDate",
          $format: "json",
        }),
      },
      {
        name: "list_time_off",
        displayName: "List Time Off Records",
        description:
          "Get employee time-off/leave records (EmployeeTime). Shows approved, pending, and rejected leave requests with dates and types.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/EmployeeTime",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP SuccessFactors API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Max records",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: userId eq 'john.doe' and startDate ge datetime'2026-01-01T00:00:00'",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields: userId,timeType,startDate,endDate,quantityInDays,approvalStatus",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
          },
        ]),
        aiUsageHint:
          "Get time-off records. Filter by userId and date range. approvalStatus values: PENDING, APPROVED, CANCELLED, REJECTED.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          $filter:
            "userId eq 'john.doe' and startDate ge datetime'2026-01-01T00:00:00'",
          $select:
            "userId,timeType,startDate,endDate,quantityInDays,approvalStatus",
          $format: "json",
        }),
      },
      {
        name: "list_goals",
        displayName: "List Performance Goals",
        description:
          "Get employee performance goals from the Goal Management module. Shows goal name, status, metric, and completion percentage.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/Goal_1",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP SuccessFactors API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 50,
            description: "Max records",
          },
          {
            name: "$filter",
            type: "string",
            description:
              "OData filter. Example: userId eq 'john.doe'",
          },
          {
            name: "$select",
            type: "string",
            description:
              "Fields: userId,name,metric,status,done,start,due",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
          },
        ]),
        aiUsageHint:
          "Get performance goals. Goal_1 is the default goal plan type — your instance may use Goal_2, Goal_3 etc. for different plan types.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          $filter: "userId eq 'john.doe'",
          $select: "userId,name,metric,status,done,start,due",
          $format: "json",
        }),
      },
      {
        name: "search_employees",
        displayName: "Search Employees",
        description:
          "Search for employees by name using OData substringof function. Searches across first and last name fields.",
        method: "GET" as const,
        path: "{instanceUrl}/odata/v2/User",
        pathParams: JSON.stringify([
          {
            name: "instanceUrl",
            type: "string",
            required: true,
            description: "SAP SuccessFactors API URL",
          },
        ]),
        queryParams: JSON.stringify([
          {
            name: "$top",
            type: "number",
            default: 25,
            description: "Max results",
          },
          {
            name: "$filter",
            type: "string",
            required: true,
            description:
              "OData search filter. Example: substringof('John',firstName) or substringof('Smith',lastName)",
          },
          {
            name: "$select",
            type: "string",
            default:
              "userId,firstName,lastName,email,department,jobTitle,status",
            description: "Fields to return",
          },
          {
            name: "$format",
            type: "string",
            default: "json",
          },
        ]),
        aiUsageHint:
          "Search employees by name. Use substringof('searchTerm',fieldName) for partial matching. Combine with 'or' for multi-field search.",
        exampleArgs: JSON.stringify({
          instanceUrl: "https://api4.successfactors.com",
          $filter:
            "substringof('Smith',lastName) and status eq 'active'",
          $select:
            "userId,firstName,lastName,email,department,jobTitle",
          $top: 25,
          $format: "json",
        }),
      },
    ];

    const toolIds = [];
    for (const tool of tools) {
      const toolId = await ctx.db.insert("blueprintTools", {
        ...tool,
        blueprintId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      toolIds.push(toolId);
    }

    return {
      message: "✅ SAP SuccessFactors blueprint created successfully!",
      blueprintId,
      toolsCreated: toolIds.length,
      toolIds,
      nextSteps: [
        "1. Ensure API access is enabled in your SuccessFactors instance",
        "2. Create an API user with RBP permissions for User, EmpJob, EmpCompensation, EmployeeTime, Goal entities",
        "3. Determine your datacenter API URL (e.g. https://api4.successfactors.com for DC4)",
        "4. Connect via the Integrations page using basic auth",
        "5. Username format: apiuser@companyId",
        "6. Note: Compensation data is sensitive — restrict RBP access carefully",
      ],
    };
  },
});
