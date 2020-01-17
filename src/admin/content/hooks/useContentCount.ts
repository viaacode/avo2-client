import { useEffect, useState } from 'react';

import { fetchContentCount } from '../content.services';

type UseContentCountTuple = [number];

export const useContentCount = (): UseContentCountTuple => {
	const [count, setCount] = useState<number>(0);

	useEffect(() => {
		fetchContentCount().then(contentCount => {
			if (contentCount !== null) {
				setCount(contentCount);
			}
		});
	});

	return [count];
};
