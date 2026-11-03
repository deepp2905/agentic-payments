# Agentic Payments

A mobile interaction study of the moment an AI shopping agent asks for permission to spend. Scout has found a pair of headphones; you review the amount and the checks behind its recommendation, then approve with a slide or decline the request.

Built with Expo and React Native. The focus is the handoff between a notification, a decision, and a transaction appearing in Activity. Requests, checks, and payments are fixture data. No money moves.

## Walk through the interaction

1. Open the app and tap **Review** on the pending request.
2. Read the amount, product, and shopping checks in the bottom sheet.
3. Drag the yellow control to the right. An incomplete slide returns to the start; a completed slide starts a simulated processing state lasting 2–3.5 seconds.
4. **Done** confirms completion. At this point the paid row enters Activity behind the sheet, the pending card collapses, and **Decline request** fades and collapses out of the sheet.
5. After a one-second hold, Done becomes **Close**. Close or the top-right ✕ dismisses the sheet. Neither creates another transaction.

Declining adds a **Declined by you** row and closes the sheet in one step. Closing before payment leaves the request pending. The close control is disabled during processing so the flow stays in view until it resolves.

To try the notification entry point, long-press the **Filter** icon for half a second. Allow notifications, then lock your phone: a local request notification is scheduled for five seconds later. Tap it to open a fresh request. This also resets the demo after a payment or decline.

## Design decisions

**A deliberate approval gesture.** The slider adds a physical commitment to approval. Its fill follows the finger directly, and release uses both distance and velocity to decide whether to finish or return. Light haptics mark contact, a medium tap marks the end stop, and a success notification marks completion.

**One control carries the payment state.** Slide, processing, Done, and Close share the same track. The user can follow the outcome where they acted. Completion stays visible until they choose to leave, and the sheet gives back the space previously occupied by Decline.

**Activity reflects the decision immediately.** The paid row is added at Done, while the sheet remains open. Decline updates Activity as the sheet closes. The pending card and incoming row share an animation progress value so the list reorganizes as one transition. The card's content stays at full size inside its collapsing wrapper to avoid measuring and retaining a clipped height.

**A restrained visual system.** Near-black surfaces separate the screen, sheet, and controls. Yellow identifies approval and the newest payment's “just now” marker. Manrope carries interface text; Geist Mono gives amounts and small labels a distinct rhythm. Color and font choices live in `src/theme.ts`.

**Motion explains the change.** The sheet uses a fast-starting ease-out curve without overshoot. Shared timing values live in `src/motion.ts`; slider feedback is timed locally in `SlideToPay.tsx`. The Decline area collapses over 240ms, including its gap, while the bottom of the sheet stays anchored to the safe area. This collapse respects the system reduced-motion setting.

## Run locally

Use Node.js and npm, then install the locked dependencies and start Metro:

```sh
npm ci
npm start
```

Open the project in an Expo Go version compatible with SDK 58, or use a compatible development build. A physical phone is the useful place to judge the drag, haptics, safe areas, and lock-screen notification flow. The phone and development machine should be on the same network for a LAN connection.

```sh
npm run android    # Open on a connected Android device or emulator
npm run ios        # Open in the iOS simulator (macOS)
npm run lint
npx tsc --noEmit
```

The demo uses local notifications; it does not require a push token or notification server. Notification permissions and device settings affect delivery. See Expo's [SDK 58 notification documentation](https://docs.expo.dev/versions/v58.0.0/sdk/notifications/) for platform support. Browser behavior is not the target of this study, and the web runtime dependencies are not included.

## Where to work

| File | Responsibility |
| --- | --- |
| `App.tsx` | Fonts, shared flow state, notification entry, and resolving requests |
| `src/screens/ActivityScreen.tsx` | Pending card, grouped transactions, and list transitions |
| `src/components/RequestSheet.tsx` | Sheet presentation, payment phases, and completion timing |
| `src/components/SlideToPay.tsx` | Pan gesture, release threshold, processing feedback, and Close transition |
| `src/components/TransactionRow.tsx` | Transaction status, amount, and metadata styling |
| `src/notifications.ts` | Permission requests, local scheduling, and notification taps |
| `src/data.ts` | Request and transaction fixtures |
| `src/theme.ts` / `src/motion.ts` | Visual tokens and shared motion values |

The gesture uses React Native Gesture Handler; animation uses Reanimated and Worklets. Expo provides fonts, notifications, and haptics. Icons are drawn with React Native SVG. There is one implemented screen, with the request sheet layered over it.

## Prototype boundaries and checks

State lives in memory and resets on reload. There is no payment service, authentication, persistence, or real agent integration. Agents and Cards are visual tab placeholders, and Filter's long press is a demo trigger. Fixture details are illustrative and are not a validated price breakdown.

Lint and TypeScript checks verify code consistency; they do not verify device behavior. When reviewing changes on a phone, check a short slide returning, a full slide and fling completing once, the processing lockout, Done shrinking the sheet, Close preserving a single paid row, decline, and notification-driven reset. Repeat the reset flow to check that the pending card's amount and merchant remain visible. Check the collapse with Reduce Motion enabled as well.

The pending-card measurement fix and the latest sheet changes still need physical-device validation. Screen-reader approval, large text, and behavior across device sizes also need a dedicated accessibility pass before this could become a production payment flow.
