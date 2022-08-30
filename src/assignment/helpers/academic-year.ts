import { add, set, startOfYear, sub } from 'date-fns';

export function currentAcademicYear(): Date {
	const month = new Date().getMonth();
	const isPastAugust = month > 7; // 0-offset, 7 === August
	const currentYear = startOfYear(new Date());
	return isPastAugust ? currentYear : sub(currentYear, { years: 1 });
}

// Aug. 31
export function endOfAcademicYear(): Date {
	return set(add(currentAcademicYear(), { years: 1 }), {
		month: 7,
		date: 31,
		hours: 23,
		minutes: 59,
		seconds: 59,
	});
}

// Sept. 1
export function startOfAcademicYear(): Date {
	return set(currentAcademicYear(), {
		month: 8,
		date: 1,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
}
