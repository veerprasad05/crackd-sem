# Assignment 11 Planning

## Overview
Assignment 11 focuses on reducing friction in navigation and making the captions library easier to browse. The main changes are removing the standalone Hello World page, routing authenticated users straight into the captions list, simplifying sort behavior, and adding a `Liked By Me` filter.

## Root Route / Entry Flow
1. Keep `/` as the sign-in gate for signed-out users.
2. Redirect authenticated users from `/` to `/captions`.
3. Remove the old Hello World page so the app no longer has an empty landing page after sign-in.

## Global Navigation / Sidebar
1. Remove the `Hello World` navigation item.
2. Make `Veer's Humor Project` clickable.
3. Route that brand link to `/` so signed-out users stay at sign-in and authenticated users land on `/captions`.

## Captions List Page
1. Remove `Oldest First` and `Newest First` from the sort options.
2. Make `Most Liked` the default sort.
3. Keep `Least Liked` as the only alternate sort so the control stays simple.
4. Sort captions with the same vote aggregate shown in each card's vote badge.
5. Add a `Liked By Me` filter that only shows captions the current user has upvoted.
6. Preserve `Featured Only` and `Public Only`, and make all filters work together.
7. Reset pagination to page 1 whenever sort or filters change.
8. Add clearer pagination context with a `Page X of Y` label.
9. Add a direct page-jump control.
10. Keep descriptive copy and filter labels in normal sentence case where readability matters more than styling.

## Caption Generator Page
1. Leave this page unchanged for Assignment 11.

## Testing Checklist
1. Signed-in visits to `/` redirect to `/captions`.
2. Signed-out visits to `/` still show the sign-in screen.
3. The sidebar no longer shows `Hello World`.
4. Clicking `Veer's Humor Project` behaves correctly for both signed-in and signed-out states.
5. The captions list defaults to `Most Liked`.
6. `Liked By Me`, `Featured Only`, and `Public Only` all work on their own and in combination.
7. Voting updates stay consistent with the active sort and filters after refresh.
8. Pagination links and the page-jump control preserve the active filters.
