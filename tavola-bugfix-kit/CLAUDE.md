# Tavola

A shared household recipe, menu and grocery app for two people. One HTML file of vanilla JS, hosted on GitHub Pages, data in Firebase Realtime Database (REST) with Google sign-in. Both users share the same database, so a change must never break or lose existing data.

## Files
- `index.template.html` is the ONLY file to edit. It holds all the app code.
- `index.html` is built from it by `python3 build.py` (fills in the logo and the version). Never edit `index.html` by hand.
- `version.txt` is the version shown in the app. The workflow bumps it; do not change it yourself.
- Check your work with `python3 build.py` then `node tools/check.js`.

## House rules
- Australian spelling and terms (zucchini, capsicum, coriander, spring onion). Liquids are stored in ml.
- No icons on buttons (the calendar is the only exception). Square corners (2px radius). Olive green is `--herb`, primary buttons are solid tomato, secondary buttons are outlined. Two buttons per row where there are two.
- Keep the app fast on a phone. No new libraries or outside requests.
- Do not touch the Firebase config, sign-in, or the database rules.
- Database paths in use: `recipes`, `photos`, `plans`, `activePlanId`, `checks`, `bugs`, `customCuisines`, `storePrefs`. Never rename or remove a field. Old data must keep loading; add a migration if the shape changes.
- The Menu tab shows only the built plan. The Planner tab holds the draft and edits. Do not change that flow unless the issue asks.
- Keep changes small and in the style of the surrounding code. Fix the cause, not the symptom. Do not refactor unrelated code.
