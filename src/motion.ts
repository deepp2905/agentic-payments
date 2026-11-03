import { Easing } from 'react-native-reanimated';

// Shared "drawer" ease-out: fast start, long gentle settle, no overshoot.
export const EASE_OUT = Easing.bezier(0.32, 0.72, 0, 1);

export const SHEET_OPEN_MS = 420;
export const SHEET_CLOSE_MS = 260;

// Activity settles after resolution: behind the open sheet for payment,
// or alongside the sheet's exit when the request is declined.
export const LIST_DELAY_MS = 60;
export const LIST_MS = 420;
