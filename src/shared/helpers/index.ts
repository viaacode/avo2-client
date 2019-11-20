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
	buildLink,
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
	navigate,
} from './link';
import { parseDuration, toSeconds } from './parsers/duration';
import { createReducer } from './redux/create-reducer';

export {
	buildLink,
	copyToClipboard,
	createDropdownMenuItem,
	createReducer,
	formatDate,
	formatDurationHoursMinutesSeconds,
	formatDurationMinutesSeconds,
	formatTimestamp,
	fromNow,
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLink,
	generateSearchLinks,
	generateSearchLinkString,
	getAbbreviatedFullName,
	getAvatarProps,
	getEnv,
	getFullName,
	getInitialChar,
	getInitials,
	getRole,
	navigate,
	normalizeTimestamp,
	pad,
	parseDuration,
	renderAvatar,
	renderAvatars,
	reorderDate,
	stripHtml,
	toSeconds,
	useDebounce,
};
