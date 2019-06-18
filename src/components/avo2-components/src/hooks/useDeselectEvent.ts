import { useEffect } from 'react';

// this hook dispatches a custom "deselect" event on all radiobuttons
// with a shared `name`-attribute to ensure that their state is kept in sync (except the selected radiobutton)
export function useDeselectEvent(name: string, value: string, onDeselect: () => void) {
	useEffect(() => {
		const element = document.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);

		if (element) {
			element.addEventListener('deselect', onDeselect);

			// Remove event listeners on cleanup
			return () => {
				element.removeEventListener('deselect', onDeselect);
			};
		}
	});

	return [
		() => {
			document
				.querySelectorAll(`input[type="radio"][name="${name}"]:not([value="${value}"])`)
				.forEach((element: Element) => element.dispatchEvent(new Event('deselect')));
		},
	];
}
