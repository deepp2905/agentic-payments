import { Easing } from 'react-native-reanimated';

// Shared "drawer" ease-out: fast start, long gentle settle, no overshoot.
export const EASE_OUT = Easing.bezier(0.32, 0.72, 0, 1);

export const SHEET_OPEN_MS = 420;
export const SHEET_CLOSE_MS = 260;

// The Activity list starts updating just after the sheet starts to leave and
// finishes LIST_DELAY_MS + LIST_MS - SHEET_CLOSE_MS (220ms) after it is gone.
export const LIST_DELAY_MS = 60;
export const LIST_MS = 420;
