import { formatDuration } from './duration';

describe('Formatters - duration', () => {
	it('Should format as a duration`', () => {
		expect(formatDuration(-5)).toEqual('0:05');
		expect(formatDuration(0)).toEqual('0:00');
		expect(formatDuration(20)).toEqual('0:20');
		expect(formatDuration(40)).toEqual('0:40');
		expect(formatDuration(59)).toEqual('0:59');
		expect(formatDuration(60)).toEqual('1:00');
		expect(formatDuration(61)).toEqual('1:01');
		expect(formatDuration(121)).toEqual('2:01');
		expect(formatDuration(3000)).toEqual('50:00');
		expect(formatDuration(30000)).toEqual('500:00');
	});
});
