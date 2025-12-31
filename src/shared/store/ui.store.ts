import { atom, createStore } from 'jotai';

/**
 * Modal to nudge the user to use the flemish government login (citizen login)
 * This login is preferred above other login methods like smartschool, klascement or meemoo's own login hetarchief
 */
export const showNudgingModalAtom = atom<boolean>(false);

/**
 * Atom to store the timestamp of the last played video
 * Used for detecting is the user is idle. if video is playing the user is not idle
 */
export const lastVideoPlayedAtAtom = atom<Date | null>(null);

/**
 * Atom to store history locations
 * Used for analytics to track where the user was coming from before they landed on this page
 */
export const historyLocationsAtom = atom<string[]>([]);

/**
 * Used to store if the user is logging in to see an embed of a video on another website (smartschool or bookwidgets)
 */
export const embedFlowAtom = atom<string>('');

export const store = createStore();
