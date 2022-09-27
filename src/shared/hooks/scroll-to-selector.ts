import { useCallback, useEffect, useState } from 'react';

export function useScrollToSelector(selector: string | null): void {
	const [timerId, setTimerId] = useState<number | null>(null);
	const scrollDownToFocusedItem = useCallback(() => {
		if (selector) {
			const item = document.querySelector(selector) as HTMLElement | null;
			if (item && item.offsetTop) {
				item.scrollIntoView();
			} else {
				if (timerId) {
					clearTimeout(timerId);
				}
				setTimerId(
					window.setTimeout(() => {
						scrollDownToFocusedItem();
					}, 100)
				);
			}
		}
	}, [selector]);

	useEffect(() => {
		scrollDownToFocusedItem();
	}, [scrollDownToFocusedItem]);
}
