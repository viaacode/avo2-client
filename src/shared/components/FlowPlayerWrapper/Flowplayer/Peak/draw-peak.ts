function add(accumulator: number, a: number) {
	return accumulator + a;
}

function sum(nums: number[]): number {
	return nums.reduce(add, 0); // with initial value to avoid when the array is empty
}

function average(nums: number[]) {
	return sum(nums) / nums.length;
}

export function drawPeak(
	canvas: HTMLCanvasElement,
	waveformData: number[],
	percentagePlayed: number
) {
	const ctx = canvas.getContext('2d');

	if (!ctx || !waveformData) {
		return;
	}

	const numOfBars = 100;
	const barWidth = canvas.width / 100 / 2;

	// Convert the waveform amplitude to bar height
	const scaleY = (amplitude: number, canvasHeight: number, minVal: number, maxVal: number) => {
		return ((amplitude - minVal + 0.1) / maxVal / 2) * canvasHeight;
	};

	// Reset the canvas
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, canvas.width || 0, canvas.height || 0);

	const half = (canvas.height || 0) / 2;

	const waveFormLength = waveformData.length;

	// Draw the peak bars
	const values = [];
	for (let barIndex = 0; barIndex < numOfBars; barIndex++) {
		const rawDataSegment = waveformData.slice(
			(waveFormLength / numOfBars) * barIndex,
			((barIndex + 1) / numOfBars) * waveFormLength
		);
		const val = average(rawDataSegment);
		values.push(val);
	}

	const minVal = Math.min(...values);
	const maxVal = Math.max(...values);
	for (let barIndex = 0; barIndex < numOfBars; barIndex++) {
		const h = scaleY(values[barIndex], half, minVal, maxVal);

		// Change color for already played audio
		const percentageDrawn = barIndex / numOfBars;
		if (percentageDrawn > percentagePlayed) {
			ctx.fillStyle = '#ADADAD';
		} else {
			ctx.fillStyle = '#00c8aa';
		}

		ctx.fillRect((canvas.width / numOfBars) * barIndex, half - h, barWidth, h * 2);
	}
}
