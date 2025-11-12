import { isString } from 'es-toolkit';

export function isDeadlineBeforeAvailableAt(
	availableAt: Date | string | null | undefined,
	deadline: Date | string | null | undefined
): boolean {
	if (!deadline || !availableAt) {
		return false;
	}
	const availableAtDate: Date = isString(availableAt) ? new Date(availableAt) : availableAt;
	const deadlineDate: Date = isString(deadline) ? new Date(deadline) : deadline;
	return deadlineDate.getTime() < availableAtDate.getTime();
}
