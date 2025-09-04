// A counter to see how many times a user did login before we nudge them
const LOGIN_COUNTER = 'AVO.login_counter_before_nudging';
export const LOGIN_COUNTER_BEFORE_NUDGING = 5;

export function getLoginCounter(): number {
	return Number.parseInt(localStorage?.getItem(LOGIN_COUNTER) || '1');
}

export function setLoginCounter() {
	const counterValue = getLoginCounter() + 1;
	if (counterValue <= LOGIN_COUNTER_BEFORE_NUDGING) {
		localStorage.setItem(LOGIN_COUNTER, counterValue.toString());
	}
}
