import { copyToClipboard } from './clipboard';
import { useDebounce } from './debounce';
import { createDropdownMenuItem } from './dropdown';
import { getEnv } from './env';
import {
	getAbbreviatedFullName,
	getAvatarProps,
	getFullName,
	getInitialChar,
	getInitials,
	getRole,
	renderAvatar,
	renderAvatars,
} from './formatters/avatar';
import {
	formatDate,
	formatTimestamp,
	fromNow,
	normalizeTimestamp,
	reorderDate,
} from './formatters/date';
import {
	formatDurationHoursMinutesSeconds,
	formatDurationMinutesSeconds,
} from './formatters/duration';
import { pad } from './formatters/pad';
import { stripHtml } from './formatters/strip-html';
import {
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
} from './link';
import { parseDuration, toSeconds } from './parsers/duration';
import { createReducer } from './redux/create-reducer';

export {
	useDebounce,
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLink,
	parseDuration,
	toSeconds,
	generateSearchLinks,
	generateSearchLinkString,
	createDropdownMenuItem,
	getEnv,
	copyToClipboard,
	createReducer,
	getRole,
	getAvatarProps,
	getInitialChar,
	getInitials,
	getFullName,
	getAbbreviatedFullName,
	renderAvatar,
	renderAvatars,
	reorderDate,
	normalizeTimestamp,
	fromNow,
	formatTimestamp,
	formatDate,
	formatDurationMinutesSeconds,
	formatDurationHoursMinutesSeconds,
	pad,
	stripHtml,
};
