---
description: Deep research on a topic with structured comparison and recommendations
---

# 🔬 Research Workflow

Conduct deep, structured research on a topic and deliver actionable recommendations.

## Step 1: Define the Research Question
* Clarify what exactly needs to be researched.
* Identify the decision criteria (cost, performance, DX, community support, etc.).
* Set the scope — is this about libraries, APIs, architecture patterns, or design approaches?

## Step 2: Gather Information
* Search the web for current solutions, libraries, and best practices.
* Check GitHub repos for stars, maintenance activity, and open issues.
* Read official documentation and community discussions.
* Look for benchmark data or real-world case studies if applicable.
* Check for existing Knowledge Items (KIs) from previous conversations.

## Step 3: Evaluate Options
Create a structured comparison:

| Criteria | Option A | Option B | Option C |
|----------|----------|----------|----------|
| Criterion 1 | ... | ... | ... |
| Criterion 2 | ... | ... | ... |

For each option, document:
- **Pros** — What makes it good
- **Cons** — What are the downsides
- **Fit for DeenVerse** — How well it integrates with the existing stack
- **Community/Maintenance** — Is it actively maintained?

## Step 4: Recommend
* Provide a clear recommendation with justification.
* Explain trade-offs the user should be aware of.
* Suggest a proof-of-concept approach if the decision is high-stakes.

## Step 5: Document
* Save the research findings in the `docs/` directory.
* Include links to all sources for future reference.
* Format as a clean, scannable markdown document.

## Step 6: Update Feature Board
* If the research is for a new feature:
  - Add a row to the **Upcoming Features** table in `.agents/feature-board.md`.
  - Note the recommended approach in the Notes column.
* If a contract is warranted (multi-layer feature), create one from `.agents/contracts/_template.md` and populate it with the researched API design.
