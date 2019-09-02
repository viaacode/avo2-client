import { ReactElement, ReactNode, ReactNodeArray } from 'react';

export function useSlot<T>(
	type: T,
	children: ReactNode | ReactNodeArray
): ReactNode | ReactNodeArray | null {
	const slots: ReactNodeArray = Array.isArray(children) ? children : [children];
	const element: ReactElement = slots.find((c: any) => c.type === type) as ReactElement;

	if (element && element.props.children) {
		return element.props.children;
	}

	return null;
}
