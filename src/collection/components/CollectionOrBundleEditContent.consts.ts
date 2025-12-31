/**
 * https://meemoo.atlassian.net/browse/AVO-3370
 * Delay the save action by 100ms to ensure the  fragment properties are saved
 * We cannot update the fragment states live in the parent component, because that would also rerender the video players
 * and that would cause the video players to lose their current time setting
 */
export const FRAGMENT_EDIT_DELAY = 50;
export const COLLECTION_SAVE_DELAY = 100;
