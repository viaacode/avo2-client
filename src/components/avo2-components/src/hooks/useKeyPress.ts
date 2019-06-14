import { useEffect } from 'react';

export function useKeyPress(
	targetKey: string,
	onPressDown?: (() => void) | null,
	onPressUp?: (() => void) | null
) {
	useEffect(() => {
		// If pressed key is our target key then call onPressDown-handler
		function downHandler({ key }: KeyboardEvent) {
			if (key === targetKey) {
				if (onPressDown) {
					onPressDown();
				}
			}
		}

		// If pressed key is our target key then call onPressUp-handler
		const upHandler = ({ key }: KeyboardEvent) => {
			if (key === targetKey) {
				if (onPressUp) {
					onPressUp();
				}
			}
		};

		// Add event listeners
		window.addEventListener('keydown', downHandler);
		window.addEventListener('keyup', upHandler);

		// Remove event listeners on cleanup
		return () => {
			window.removeEventListener('keydown', downHandler);
			window.removeEventListener('keyup', upHandler);
		};
	});
}
