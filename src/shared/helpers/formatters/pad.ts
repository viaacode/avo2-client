export function pad(num: number, size: number) {
	let output = String(num);
	while (output.length < size) {
		output = `0${output}`;
	}
	return output;
}
