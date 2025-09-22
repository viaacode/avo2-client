import { atom, createStore } from 'jotai';

export const showNudgingModalAtom = atom<boolean>(false);
export const lastVideoPlayedAtAtom = atom<Date | null>(null);
export const historyLocationsAtom = atom<string[]>([]);
export const embedFlowAtom = atom<string>('');

export const store = createStore();
