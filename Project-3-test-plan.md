# Assignment 13 Test Plan

## Overview

This document is a manual test plan for the three applications in this directory:

1. Project 1: `cracked`
2. Project 2: `crackd-admin`
3. Project 3: `crackd-prompt-chain`

The goal is branch coverage. Each major user path, access condition, filter state, mutation flow, and error/empty state should be tested at least once.

Use this document as a checklist while manually testing. Fill in the `Status` column as you go.

Suggested status values:

- `Pass`
- `Fail`
- `Blocked`
- `Not Run`

## Test Environment

- Verify each app has a valid `.env.local`.
- Start each app from its own directory with `npm run dev`.
- Use a clean signed-out browser session for auth-gate tests.
- Use a signed-in account with the right permissions for protected-route tests.
- For admin and prompt-chain write flows, create clearly labeled test records and delete them after verification when possible.
- Capture screenshots for failures that you may need to fix later.

## Result Template

Use this format for each test case while executing:

| Status |
| --- |
|  |

---

## Project 1: `cracked`

### Feature Tree

- Authentication and entry routing
- Caption library browsing
- Sorting, filtering, and pagination
- Voting
- Caption generation from uploaded images

### Test Cases

| ID | Branch / Path | Preconditions | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- | --- |
| C-01 | Signed-out root landing | Browser is signed out | Open `/` | Sign-in modal is shown; user is not redirected to `/captions` | Pass |
| C-02 | Signed-in root redirect | Browser is signed in | Open `/` | User is redirected to `/captions` | Pass |
| C-03 | Signed-out protected captions route | Browser is signed out | Open `/captions` directly | User is redirected to `/` | Pass |
| C-04 | Signed-in captions route happy path | Browser is signed in and captions exist | Open `/captions` | Captions page loads with cards, images, text, and vote controls | Pass |
| C-05 | Default sort branch | Browser is signed in | Open `/captions` with no query params | Default sort order is applied and page loads consistently | Pass |
| C-06 | Alternate sort branch | Browser is signed in | Change the sort control to the non-default option | Cards reorder correctly and page resets to page 1 | Pass |
| C-07 | Invalid sort query fallback | Browser is signed in | Visit `/captions?sort=bad-value` | Page falls back to a valid sort mode and still loads | Pass |
| C-08 | Featured filter branch | Browser is signed in | Enable the featured filter | Only featured captions are shown; filter state stays visible in UI | Pass |
| C-09 | Public filter branch | Browser is signed in | Enable the public filter | Only public captions are shown | Pass |
| C-10 | Liked-by-me filter branch | Browser is signed in and has at least one liked caption | Enable the liked filter | Only captions liked by the current user are shown | Pass |
| C-11 | Combined filter branch | Browser is signed in | Combine two or more filters | Results reflect the intersection of all active filters | Pass |
| C-12 | No-results branch | Browser is signed in | Apply a filter combination that matches nothing | A readable empty-state message is shown | Pass |
| C-13 | Pagination next/previous | Browser is signed in and enough captions exist for multiple pages | Move between pages with pagination controls | Correct page loads and filters/sort stay preserved | Pass |
| C-14 | Jump-to-page branch | Browser is signed in and multiple pages exist | Use the jump-to-page control | Requested page loads; invalid numbers are handled safely | Pass |
| C-15 | Like from neutral | Browser is signed in | Click like on a caption with no current vote | User vote updates and count refreshes correctly | Pass |
| C-16 | Dislike from neutral | Browser is signed in | Click dislike on a caption with no current vote | User vote updates and count refreshes correctly | Pass |
| C-17 | Switch vote branch | Browser is signed in | Like a caption, then dislike it or reverse the order | Prior vote is replaced cleanly and total updates correctly | Pass |
| C-18 | Remove vote branch | Browser is signed in and has an active vote | Click the active vote again if supported | Vote clears or returns to neutral state correctly | Pass |
| C-19 | Signed-out generator access | Browser is signed out | Open `/caption-generator` directly | User is redirected to `/` | Pass |
| C-20 | Signed-in generator load | Browser is signed in | Open `/caption-generator` | Upload UI renders with supported file instructions | Pass |
| C-21 | Unsupported file type branch | Browser is signed in | Attempt to upload an unsupported file type | User sees a clear validation message and upload does not continue | Pass |
| C-22 | Successful upload and generation path | Browser is signed in with a supported test image | Upload a supported image | Status updates appear in sequence and generated captions render as cards | Pass |
| C-23 | Re-upload branch | Browser is signed in and one image has already been processed | Upload a second supported image | Prior captions are replaced and the new preview/captions appear | Pass |

### Project 1 Notes

- Test with at least one signed-out session and one signed-in session.
- If enough caption data does not exist for pagination or filter combinations, mark the blocked cases explicitly.

---

## Project 2: `crackd-admin`

### Feature Tree

- Access control and middleware redirects
- Admin landing behavior
- Read-only list and stats pages
- Generic CRUD management
- Image upload/edit/delete flows
- LLM response and configuration management

### Test Cases

| ID | Branch / Path | Preconditions | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- | --- |
| A-01 | Signed-out root access | Browser is signed out | Open `/` | Sign-in modal is shown | Pass |
| A-02 | Signed-in non-admin root access | Browser is signed in with no superadmin access | Open `/` | Access denied panel is shown | Pass |
| A-03 | Signed-in superadmin root access | Browser is signed in as superadmin | Open `/` | User is redirected to `/stats` | Pass |
| A-04 | Middleware protection for protected routes | Browser is signed out | Open `/stats`, `/images`, and `/users` directly | Each route redirects to `/` | Pass |
| A-05 | Non-admin protected route access | Browser is signed in without superadmin access | Open `/stats` directly | User is redirected to `/` or denied access consistently | Pass |
| A-06 | Sidebar navigation coverage | Browser is signed in as superadmin | Click through each sidebar destination | Every route loads and active navigation state updates correctly | Pass |
| A-07 | Stats page happy path | Browser is signed in as superadmin | Open `/stats` | All summary sections load without layout or runtime errors | Pass |
| A-08 | Stats page missing-data branch | Browser is signed in as superadmin | Inspect cards/sections where backing data may be null | Page handles missing aggregates or missing image URLs gracefully | Pass |
| A-09 | Generic CRUD create flow | Browser is signed in as superadmin on a CRUD-backed page such as `/allowed-signup-domains` | Open create modal, submit a valid test record | New record is created and visible after refresh | Pass |
| A-10 | Generic CRUD edit flow | Browser is signed in as superadmin and a test row exists | Edit the test record and save | Updated values persist and are visible after refresh | Pass |
| A-11 | Generic CRUD delete cancel branch | Browser is signed in as superadmin and a test row exists | Click delete and cancel the browser confirm dialog | Record is not deleted | Pass |
| A-12 | Generic CRUD delete confirm branch | Browser is signed in as superadmin and a disposable test row exists | Confirm deletion | Record is removed and page refreshes correctly | Pass |
| A-13 | Generic CRUD validation/error branch | Browser is signed in as superadmin | Submit invalid, incomplete, or duplicate data where applicable | UI shows a readable error instead of failing silently | Pass |
| A-14 | Caption examples page | Browser is signed in as superadmin | Open `/caption-examples` | Existing examples load; linked image data renders correctly if present | Pass |
| A-15 | Captions page | Browser is signed in as superadmin | Open `/captions` | Caption records render correctly and empty/error states are handled | Pass |
| A-16 | Caption requests page | Browser is signed in as superadmin | Open `/caption-requests` | Request data loads correctly and page does not crash on null fields | Pass |
| A-17 | Humor flavors page | Browser is signed in as superadmin | Open `/humor-flavors` | Flavor records load and admin controls behave correctly | Pass |
| A-18 | Humor mix page | Browser is signed in as superadmin | Open `/humor-mix` | Mix records load and CRUD actions work if enabled | Pass |
| A-19 | LLM providers page | Browser is signed in as superadmin | Open `/llm-providers` | Provider records load and CRUD controls behave correctly | Pass |
| A-20 | LLM models page | Browser is signed in as superadmin | Open `/llm-models` | Model records load and CRUD controls behave correctly | Pass |
| A-21 | LLM prompt chains page | Browser is signed in as superadmin | Open `/llm-prompt-chains` | Prompt-chain records load and page handles long text safely | Pass |
| A-22 | LLM responses page happy path | Browser is signed in as superadmin | Open `/llm-responses` | Response list renders correctly with filter controls | Pass |
| A-23 | LLM responses filtering branch | Browser is signed in as superadmin | Apply available filters on `/llm-responses` | Results update correctly and no runtime error occurs | Pass |
| A-24 | Users page | Browser is signed in as superadmin | Open `/users` | Profile data renders correctly and admin status fields look accurate | Pass |
| A-25 | Profiles page | Browser is signed in as superadmin | Open `/profiles` | Profile list loads and handles empty or null fields safely | Pass |
| A-26 | Allowed signup domains page | Browser is signed in as superadmin | Open `/allowed-signup-domains` | Records load and create/edit/delete flows work | Pass |
| A-27 | Whitelisted email addresses page | Browser is signed in as superadmin | Open `/whitelisted-email-addresses` | Records load and create/edit/delete flows work | Pass |
| A-28 | Terms page | Browser is signed in as superadmin | Open `/terms` | Terms records load and long text renders correctly | Pass |
| A-29 | Images page load | Browser is signed in as superadmin | Open `/images` | Image cards render; missing URLs show placeholder content | Pass |
| A-30 | Image upload flow | Browser is signed in as superadmin | Use the upload modal with a supported image | Upload succeeds and new image appears in the grid | Pass |
| A-31 | Image edit flow | Browser is signed in as superadmin and a test image exists | Toggle editable fields in the image edit modal and save | Updated flags persist and badges update correctly | Pass |
| A-32 | Image delete cancel branch | Browser is signed in as superadmin and a disposable test image exists | Click delete and cancel confirmation | Image record remains intact | Pass |
| A-33 | Image delete confirm branch | Browser is signed in as superadmin and a disposable test image exists | Confirm deletion | Image record is removed and grid refreshes correctly | Pass |
| A-34 | Legacy hello-world route | Browser is signed in as superadmin | Open `/hello-world` | Page loads without crashing and matches intended admin behavior | Pass |
| A-35 | Sign-out flow | Browser is signed in | Use the sign-out control from the UI | Session ends and protected routes redirect back to `/` | Pass |

### Project 2 Notes

- Reuse one or two safe CRUD pages for full create/edit/delete validation if every page is backed by the same shared admin manager.
- Still open every route at least once, even if full mutation coverage is sampled on representative pages.

---

## Project 3: `crackd-prompt-chain`

### Feature Tree

- Authentication and prompt-chain access control
- Humor flavor browsing
- Humor flavor CRUD and step management
- Prompt-chain caption browsing
- Caption tester upload and generation flow

### Test Cases

| ID | Branch / Path | Preconditions | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- | --- |
| P-01 | Signed-out root landing | Browser is signed out | Open `/` | Sign-in modal is shown | Pass |
| P-02 | Signed-in unauthorized root access | Browser is signed in without matrix-admin or superadmin access | Open `/` | Access denied panel is shown | Pass |
| P-03 | Signed-in authorized root redirect | Browser is signed in with matrix-admin or superadmin access | Open `/` | User is redirected to `/humor-flavors` | Pass |
| P-04 | Humor flavors page happy path | Browser is signed in with access | Open `/humor-flavors` | Flavor list loads with pagination and controls visible | Pass |
| P-05 | Humor flavors mine-only filter | Browser is signed in with access and has at least one owned flavor | Toggle the mine-only filter | Only current-user flavors are shown | Pass |
| P-06 | Humor flavors sort branch | Browser is signed in with access | Change the sort order | Results reorder correctly and page still loads | Pass |
| P-07 | Humor flavors pagination branch | Browser is signed in with access and enough data exists | Navigate between pages | Page changes correctly and filter/sort state is preserved | Pass |
| P-08 | Humor flavors empty-state branch | Browser is signed in with access | Use a state with no matching results, such as mine-only with no owned data | A readable empty-state message is shown | Pass |
| P-09 | Create humor flavor | Browser is signed in with access | Open the create modal, submit a valid disposable test flavor | New flavor appears in the list | Pass |
| P-10 | Edit humor flavor metadata | Browser is signed in with access and a test flavor exists | Edit slug or description and save | Updated values persist after refresh | Pass |
| P-11 | Delete humor flavor cancel branch | Browser is signed in with access and a test flavor exists | Click delete and cancel | Flavor remains unchanged | Pass |
| P-12 | Delete humor flavor confirm branch | Browser is signed in with access and a disposable test flavor exists | Confirm deletion | Flavor is removed cleanly | Pass |
| P-13 | Duplicate humor flavor branch | Browser is signed in with access and at least one existing flavor exists | Use the duplicate flow | A new flavor copy is created with expected copied content | Pass |
| P-14 | Expand/collapse flavor accordion | Browser is signed in with access | Expand and collapse one or more flavor cards | Step details show and hide correctly | Pass |
| P-15 | Create flavor step | Browser is signed in with access and a disposable test flavor exists | Add a new step with valid model/input/output selections | New step is saved with the correct order and metadata | Pass |
| P-16 | Edit flavor step | Browser is signed in with access and a test step exists | Edit step fields and save | Changes persist and display correctly | Pass |
| P-17 | Delete flavor step | Browser is signed in with access and a disposable test step exists | Delete the step | Step is removed and order display remains stable | Pass |
| P-18 | Step-form reference data branch | Browser is signed in with access | Open create/edit step UI | Step types, models, input types, and output types populate correctly | Pass |
| P-19 | Captions page happy path | Browser is signed in with access | Open `/captions` | Caption cards load with image, caption text, and like count badge | Pass |
| P-20 | Captions humor flavor filter | Browser is signed in with access | Apply a humor flavor filter | Results update to the selected flavor only | Pass |
| P-21 | Captions sort branch | Browser is signed in with access | Change sort mode | Results reorder correctly and no runtime error occurs | Pass |
| P-22 | Invalid captions query fallback | Browser is signed in with access | Visit `/captions?sort=bad&humorFlavorId=bad` | Page still loads with safe fallback values | Pass |
| P-23 | Captions pagination branch | Browser is signed in with access and enough records exist | Move through multiple pages | Pagination works and query params stay preserved | Pass |
| P-24 | Missing-image branch | Browser is signed in with access and at least one caption references no image URL | Open `/captions` | Placeholder block is shown instead of a broken layout | Pass |
| P-25 | No-results captions branch | Browser is signed in with access | Filter to a flavor with no captions | Page shows a readable no-results message | Pass |
| P-26 | Caption tester page load | Browser is signed in with access | Open `/caption-tester` | Upload workspace renders and humor flavor options load | Pass |
| P-27 | Caption tester unsupported file branch | Browser is signed in with access | Upload an unsupported file type | UI blocks the request and shows a clear error | Pass |
| P-28 | Caption tester successful run | Browser is signed in with access and has a supported image batch | Upload images and run the tester | Captions are generated and displayed for the selected flavor | Pass |
| P-29 | Caption tester failure branch | Browser is signed in with access | Force an auth, upload, registration, or generation failure | User sees a clear error and can continue using the page | Pass |
| P-30 | Caption tester rerun branch | Browser is signed in with access and has already run one batch | Run a second test batch | Prior output is replaced or refreshed correctly | Pass |
| P-31 | Legacy hello-world route | Browser is signed in with access | Open `/hello-world` | Page loads without crashing and matches intended behavior | Pass |
| P-32 | Sign-out flow | Browser is signed in | Use the sign-out control from the UI | Session ends and protected routes return to the gated root experience | Pass |

### Project 3 Notes

- Use one disposable humor flavor and one disposable step for all write-path testing when possible.
- If the caption tester supports batch images, test both a single-image run and a multi-image run.

---

## Cross-Project Regression Checklist

Run this after any fixes you make during testing:

| ID | Regression Check | Steps | Expected Result | Status |
| --- | --- | --- | --- | --- |
| R-01 | Auth callback routes | Sign in and return through `/auth/callback` in each app | Session is established and redirect target is correct | Pass |
| R-02 | Shared Supabase connectivity | Open at least one data-backed page in each app | Data loads without runtime crashes | Pass |
| R-03 | Shared styling/layout | Open main routes on desktop and a narrow mobile viewport | Sidebar, cards, forms, and modal layouts remain usable | Pass |
| R-04 | Console/runtime errors | Repeat core flows while watching browser console | No new uncaught errors appear | Pass |
| R-05 | Cleanup verification | Revisit pages used for write testing | Temporary test data has been removed or intentionally documented | Pass |

---

## After-Testing Summary Template

After you finish testing, replace the placeholders below with 5-8 bullets:

- Tested:
- Tested:
- Tested:
- Issue found:
- Issue found:
- Fixed:
- Fixed:
- Remaining blocker or follow-up:

## Completion Criteria

This test plan is complete when:

- Every discovered route in all three apps has been opened at least once.
- Every protected route has been tested signed out and signed in with the relevant role.
- Every major list page has a happy-path check and an empty/error-state check where possible.
- Every major mutation flow has create/edit/delete coverage or a documented reason it was blocked.
- Every upload/generation flow has both a success-path test and a failure-path test.
- The final 5-8 summary bullets are filled with observed results from manual execution.
