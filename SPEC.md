# Dice Betting Game Spec List

## Summary

- Build a one-page React 19 + Vite + TypeScript fun-play dice betting game.
- Add Tailwind 4 for styling and React Three Fiber/Three.js for the animated dice TV screen.
- Keep all state client-side and session-only: nickname, balance, bets, history, and round state reset on refresh.
- Use a dark broadcast-casino visual style: emerald felt, dark glass, brass accents, countdown tension, and gold win effects.

## Core Experience

- Show a required nickname modal on first load; it cannot be dismissed until a nickname is entered.
- Start each player with `5000` credits.
- Display an app bar with nickname, balance, round number, current phase, countdown, and session history.
- Main screen has a large 16:9 TV-style dice stage showing three animated 3D dice.
- Dice continuously roll/shuffle during betting and lockdown, then settle into the result during reveal.
- Game auto-advances through rounds without user action.

## Round Flow

- Each round lasts `60s` before reveal.
- `60s-11s`: betting phase, bets are accepted.
- `10s-1s`: lockdown phase, bets are no longer accepted.
- `0s`: reveal dice result.
- After reveal: settle bets, show win/loss summary, animate winnings, update balance, then start next round after about `5s`.
- Stake is deducted when a bet is placed.
- Winning payout adds stake plus profit back to balance.

## Betting Options

- `Small`: total `4-10`, pays `1:1`, loses if result is any triple.
- `Big`: total `11-17`, pays `1:1`, loses if result is any triple.
- `Odd`: total is odd, pays `1:1`.
- `Even`: total is even, pays `1:1`.
- `Single number 1-6`: pays based on match count, `1:1`, `2:1`, or `3:1`.
- `Any double`: any pair appears, pays `3:1`.
- `Specific double`: chosen pair appears, pays `8:1`.
- `Any triple`: any three of a kind, pays `24:1`.
- `Specific triple`: chosen triple appears, pays `150:1`.
- `Exact total`: choose total `4-17`; payout varies by rarity.

## UI Requirements

- Visual direction: late-night broadcast casino table, dark glass, emerald felt, brass accents, sharp timer states, and celebratory gold win effects.
- Betting board includes chip selector: `10`, `50`, `100`, `500`, `1000`.
- Betting board groups: Quick Bets, Totals, Singles, Doubles, Triples.
- Current bet slip shows placed bets, total staked, and removable bets before lockdown.
- Disabled states for lockdown and insufficient balance.
- Result summary shows dice values, total, winning bets, losing bets, payout, and new balance.
- History is per-session only and shows recent round results.

## 3D Dice Requirements

- Use React Three Fiber with Three.js.
- Render three rounded dice with visible pips, glossy material, table lighting, and subtle camera depth.
- Dice animation states:
  - Rolling/shuffling during betting.
  - Faster/tenser motion during lockdown.
  - Settle/snap to final values during reveal.
  - Small celebratory pulse or particles if player wins.
- Keep DOM HUD and betting UI outside the canvas.

## Implementation Shape

- Add dependencies: `tailwindcss`, `@tailwindcss/vite`, `three`, `@react-three/fiber`, `@react-three/drei`, and `lucide-react`.
- Replace current starter UI in `src/App.tsx` and app styles.
- Suggested core types:
  - `GamePhase = 'betting' | 'lockdown' | 'reveal' | 'settling'`
  - `DieValue = 1 | 2 | 3 | 4 | 5 | 6`
  - `DiceResult = [DieValue, DieValue, DieValue]`
  - `BetOption`, `PlacedBet`, `RoundRecord`, `PayoutSummary`
- Keep game rules in pure helper functions so payout tests or manual verification are simple.
- Keep high-frequency dice animation inside the 3D scene, not broad React state.

## Responsive Requirements

- Desktop: app bar on top, TV screen as the main visual anchor, betting board/slip arranged beside or below depending width.
- Mobile: TV screen first, compact top bar, betting groups in scrollable sections, slip/history collapsible.
- Text must not overlap, overflow buttons, or hide controls on small screens.

## Test Plan

- Run `npm run build`.
- Run `npm run lint`.
- Browser-check desktop and mobile layouts.
- Verify nickname gate.
- Verify balance deduction and payout addition.
- Verify all bet categories against known dice results.
- Verify bets cannot be placed during lockdown.
- Verify insufficient-balance options are disabled.
- Verify round loop auto-continues and history remains session-only.
- Verify dice canvas is nonblank, animates, and settles into visible results.

## Assumptions

- Fun-play only; no legal gambling, real wallet, account, backend, or long-term tracking.
- Refresh reset is acceptable and expected.
- React Three Fiber is the chosen React-native Three.js implementation path.
- The initial version can use procedural 3D dice and CSS/Tailwind UI, without generated image assets.
