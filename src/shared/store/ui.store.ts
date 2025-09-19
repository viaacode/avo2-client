import { atom } from 'jotai';

export const showNudgingModalAtom = atom<boolean | null>(null);
export const lastVideoPlayedAtAtom = atom<Date | null>(null);
export const historyLocationsAtom = atom<string | null>(null);
export const embedFlowAtom = atom<string[]>([]);
