import { useLayoutEffect, useRef } from 'react';

function useResizeObserver<T extends HTMLElement>(
	callback: (target: T, entry: ResizeObserverEntry, disconnect: () => void) => void
) {
	const ref = useRef<T>(null);

	useLayoutEffect(() => {
		const element = ref?.current;

		if (!element) {
			return;
		}

		const observer = new ResizeObserver((entries) => {
			callback(element, entries[0], observer.disconnect);
		});

		observer.observe(element);
		return () => {
			observer.disconnect();
		};
	}, [callback, ref]);

	return ref;
}

export default useResizeObserver;
