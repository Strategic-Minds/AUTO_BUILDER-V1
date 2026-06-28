# Master Client Discovery Questionnaire

Use this in the first serious consultation. Do not rush it.

## A. Business and outcome
1. What business are you in?
2. What does the business sell?
3. Who is the primary buyer?
4. What is the current bottleneck?
5. What outcome do you actually want this AI system to produce?
6. What would success look like in 30 days?
7. What would success look like in 90 days?
8. What would failure look like?
9. What is the highest-value workflow to automate first?
10. What should never be automated?

## B. Scope and system boundary
11. What part of the business should the system touch?
12. What part of the business should the system not touch?
13. Should the system advise, act, write, or decide?
14. What final actions is the system allowed to perform?
15. What actions must require human approval?
16. Is this a one-team system or a company-wide system?
17. Are there multiple business units, brands, or pipelines?
18. What is the smallest useful version of the system?
19. What future expansion do you already expect?
20. Are there legacy systems that must stay in place?

## C. Users and operators
21. Who will operate the system day to day?
22. Who owns the budget?
23. Who owns the final go or no-go decision?
24. Who should receive alerts, summaries, and blockers?
25. Who needs read access?
26. Who needs write access?
27. What technical skill level do the operators have?
28. What kind of UI do they actually need?
29. Is mobile use required?
30. Is desktop use required?

## D. Workflow mapping
31. Walk me through the current workflow step by step.
32. Where does work start?
33. Where does work end?
34. What data is created along the way?
35. What approvals happen today?
36. What duplicate work happens today?
37. Where do errors or delays usually happen?
38. What information is often missing?
39. What handoffs fail most often?
40. What decisions are currently based on instinct rather than data?

## E. Objects and data
41. What are the main objects in the system? Examples: lead, job, account, quote, document, ticket, asset, product.
42. What fields must exist for each object?
43. Which fields are optional?
44. Which fields must never be guessed?
45. What unique keys exist today?
46. How are duplicates currently identified?
47. What evidence or source links must be preserved?
48. What data is internal only?
49. What data is customer-facing?
50. What data is regulated or sensitive?

## F. Connectors and accounts
51. Which systems are already in use?
52. Which systems are required in phase one?
53. Which systems are optional later?
54. Which Google Workspace assets exist?
55. Which CRM exists?
56. Which database exists?
57. Which frontend host exists?
58. Which repos exist?
59. Which email and calendar accounts should be used?
60. Which connectors are already live and tested?

## G. Automation and scheduling
61. What should run on a schedule?
62. How often should it run?
63. What should happen every pass?
64. What should happen only after approval?
65. What counts as a blocker?
66. What should the system do when blocked?
67. What should be retried automatically?
68. What should go to quarantine?
69. What should happen if a connector fails?
70. What should happen if the scheduler fails?

## H. Writing, risk, and control
71. What destinations can the system write to?
72. What destinations are read-only?
73. What records can be auto-created?
74. What records can be auto-updated?
75. What records must never be deleted automatically?
76. What approval gates are required before final writes?
77. What confidence threshold is acceptable?
78. What evidence threshold is acceptable?
79. What is the rollback path for a bad write?
80. What audit trail is required?

## I. Metrics and acceptance
81. What are the top five metrics?
82. What throughput matters most?
83. What error rate is acceptable?
84. What uptime expectation matters in practice?
85. What response time matters in practice?
86. What operator burden should decrease?
87. What manual work should disappear?
88. What reports or dashboards are required?
89. What would make you say the project is complete?
90. What would make you expand phase two?

## J. Build approach
91. Do you want MVP, Scaffold, Production, or Enterprise first?
92. What is the delivery deadline?
93. What documentation do you expect?
94. Do you want GPT to build prompts only, docs only, code only, or the full stack?
95. Should the system be modular by default?
96. Should the system be scheduler-first?
97. Should the system be admin-control-plane-first?
98. Should the system use a central memory ledger?
99. What existing assets should be preserved?
100. What must not be changed during production?
