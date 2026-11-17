# Berat Dere - 2023502168
## Bonus 1: Undo
To support undo functionality, I extended the reducer state shape to `{ tasks: Task[]; filter: Filter; past: Task[][] }`. Whenever an action modifies the task list (`add`, `advance`, `remove`, or `clearDone`), the reducer pushes the previous `tasks` array onto `past` before applying the change, while `setFilter` leaves `past` untouched. Dispatching `{ type: 'undo' }` pops the most recent snapshot from `past` and restores it to `tasks`, and the Undo button is disabled whenever `past` is empty.

## Bonus 2: Tests
```text
BURAYA_TERMINALDEKI_NPM_TEST_CIKTISINI_YAPISTIR