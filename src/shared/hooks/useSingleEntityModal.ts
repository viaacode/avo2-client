import { useEffect, useState } from 'react';

export type SingleEntityModal<T> = {
	isOpen: boolean | undefined;
	setOpen: React.Dispatch<React.SetStateAction<boolean | undefined>>;
	entity: T | undefined;
	setEntity: React.Dispatch<React.SetStateAction<T | undefined>>;
};

export function useSingleEntityModal<T>(): SingleEntityModal<T> {
	const [entity, setEntity] = useState<T | undefined>(undefined);
	const [isOpen, setOpen] = useState<boolean>();

	useEffect(() => {
		if (!isOpen && entity !== undefined) {
			setEntity(undefined);
		}
	}, [isOpen, entity]);

	return { isOpen, setOpen, entity, setEntity };
}
