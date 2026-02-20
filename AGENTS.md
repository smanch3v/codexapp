# Lane Shooter (ad-style) - Codex Instructions

Goal: Build ONLY the ad-style minigame loop:
- Player moves left/right (or drag) along the bottom.
- Auto-shoots forward.
- Enemies approach from the top.
- Pickups/gates spawn that upgrade weapon (damage, fire rate, projectile count) or add companion shooters.
- Short levels (30–90s), restartable, satisfying feedback.

Hard constraints:
- NO base building, NO idle timers, NO gacha, NO energy systems, NO microtransactions, NO long meta progression.
- Keep code simple and readable. Prefer plain TypeScript.
- Use placeholder art (shapes) and simple audio beeps if needed.
- Provide a single command to run locally (dev server) and a build command.

Definition of done:
- Playable MVP in browser.
- Clear win/lose condition + restart.
- Upgrade pickups work and are visible in UI.
- Difficulty ramps each level.
- No console errors.