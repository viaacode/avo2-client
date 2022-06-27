import { useEffect, useState } from 'react';

type SingleEntityModalTuple<T> = [
	boolean | undefined,
	React.Dispatch<React.SetStateAction<boolean | undefined>>,
	T | undefined,
	React.Dispatch<React.SetStateAction<T | undefined>>
];

export function useSingleEntityModal<T>(): SingleEntityModalTuple<T> {
	const [entity, setEntity] = useState<T | undefined>(undefined);
	const [isOpen, setOpen] = useState<boolean>();

	useEffect(() => {
		if (!isOpen && entity !== undefined) {
			setEntity(undefined);
		}
	}, [isOpen]);

	return [isOpen, setOpen, entity, setEntity];
}
