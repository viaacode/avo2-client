import { useCallback, useState } from 'react';

export function useCallbackRef<HTMLElement>(
	element?: HTMLElement
): [HTMLElement | null, (ref: HTMLElement | null) => void] {
	const [node, setNode] = useState(element || null);

	const ref = useCallback(node => {
		if (node !== null) {
			setNode(node);
		}
	}, []);

	return [node, ref];
}
