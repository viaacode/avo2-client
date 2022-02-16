import useResizeObserver from '@react-hook/resize-observer';
import { RefObject, useLayoutEffect, useState } from 'react';

export type UseElementSize = (target: RefObject<HTMLElement>) => DOMRect | undefined;

export const useElementSize: UseElementSize = (target) => {
	const [size, setSize] = useState<DOMRect>();

	useLayoutEffect(() => {
		setSize(target.current?.getBoundingClientRect());
	}, [target]);

	useResizeObserver(target, (entry) => setSize(entry.contentRect));
	return size;
};
