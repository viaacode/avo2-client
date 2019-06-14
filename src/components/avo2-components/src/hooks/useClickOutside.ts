import { useEffect } from 'react';

export function useClickOutside(
	isPartOfElement: (elem: Element | null) => boolean,
	onClickOutside: () => void
) {
	useEffect(() => {
		function clickOutsideHandler(event: MouseEvent) {
			if (!isPartOfElement(event.target as Element | null)) {
				if (onClickOutside) {
					onClickOutside();
				}
			}
		}

		// Add event listeners
		document.addEventListener('mouseup', clickOutsideHandler);

		// Remove event listeners on cleanup
		return () => {
			document.removeEventListener('mouseup', clickOutsideHandler);
		};
	});
}
