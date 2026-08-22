# Scenarios

## Purpose

View and drive WireMock **scenarios** — named state machines that let a
sequence of requests to the same endpoint return different responses
depending on prior state, without any custom code.

## Prerequisites

An active server with at least one mapping that sets a `scenarioName` (see
[Mappings](/features/mappings) — the "Scenario name", "Required scenario
state", and "New scenario state" fields).

## How to access it

Sidebar → **Scenarios**, route `/scenarios`.

## Typical workflow

1. Open **Scenarios**. Each scenario defined by your mappings appears as a
   card showing its current state and all possible states.
2. Use the **Set state** dropdown on a card to jump directly to any
   possible state — useful for testing a specific step in a flow without
   replaying every request that would normally lead there.
3. Use **Reset** on a card to reset that one scenario to its initial
   state, or **Reset all** (top of the page) to reset every scenario.

## Transition graph

Each card also shows a **Transitions** list, derived entirely from your
mappings: for every mapping tied to that scenario with a `newScenarioState`
set, MockOps shows _from state → to state_, linked to the mapping that
causes the transition. This is computed client-side from the mapping list
— it is not a feature of WireMock's Admin API.

## Available operations

- View current state and possible states.
- Set a scenario directly to any possible state.
- Reset one scenario, or all scenarios.

## Important behavior

- The scenario list polls every 10 seconds.
- "Possible states" are WireMock's own reported list; the transition graph
  is inferred by MockOps from mapping data and may be incomplete if
  mappings use scenario states without ever setting them as a
  `newScenarioState` anywhere.
- Empty state: if no mapping sets a `scenarioName`, this page shows "No
  scenarios defined. Add a scenarioName to a mapping's request to create
  one" — scenarios aren't configured independently of mappings.

## Common problems

- **A scenario I expect to see is missing** — scenarios only exist once at
  least one mapping references that `scenarioName`; check the mapping's
  scenario fields.
- **Transition graph looks incomplete** — it only shows transitions your
  mappings actually define via `newScenarioState`; states reachable only
  through manual **Set state** actions won't appear as transitions.

## Related

[Mappings](/features/mappings) — where scenario fields live on each stub.
