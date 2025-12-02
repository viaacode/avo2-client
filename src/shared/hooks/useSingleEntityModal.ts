import { type Dispatch, type SetStateAction, useState } from 'react';

export type SingleEntityModal<T> = {
  isOpen: boolean | undefined;
  setOpen: Dispatch<SetStateAction<boolean | undefined>>;
  entity: T | undefined;
  setEntity: Dispatch<SetStateAction<T | undefined>>;
};

export function useSingleEntityModal<T>(): SingleEntityModal<T> {
  const [entity, setEntity] = useState<T | undefined>(undefined);
  const [isOpen, setOpen] = useState<boolean>();

  return { isOpen, setOpen, entity, setEntity };
}
