import { useCallback, useEffect, useState } from 'react';

export function useScrollToId(id: string | null): void {
	const [timerId, setTimerId] = useState<number | null>(null);
	const scrollDownToFocusedItem = useCallback(() => {
		console.log('checking id is present');
		if (id) {
			const item = document.getElementById(id);
			if (item && item.offsetTop) {
				window.scrollTo(0, item.offsetTop - 0.4 * window.innerHeight);
				setTimeout(() => {
					if (window.scrollY === 0) {
						scrollDownToFocusedItem();
					}
				}, 100);
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
	}, [id]);

	useEffect(() => {
		scrollDownToFocusedItem();
	}, [scrollDownToFocusedItem]);
}
