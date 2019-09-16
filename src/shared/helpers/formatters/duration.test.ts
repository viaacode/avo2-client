import { formatDurationMinutesSeconds } from './duration';

describe('Formatters - duration', () => {
	it('Should format as a duration`', () => {
		expect(formatDurationMinutesSeconds(-5)).toEqual('0:05');
		expect(formatDurationMinutesSeconds(0)).toEqual('0:00');
		expect(formatDurationMinutesSeconds(20)).toEqual('0:20');
		expect(formatDurationMinutesSeconds(40)).toEqual('0:40');
		expect(formatDurationMinutesSeconds(59)).toEqual('0:59');
		expect(formatDurationMinutesSeconds(60)).toEqual('1:00');
		expect(formatDurationMinutesSeconds(61)).toEqual('1:01');
		expect(formatDurationMinutesSeconds(121)).toEqual('2:01');
		expect(formatDurationMinutesSeconds(3000)).toEqual('50:00');
		expect(formatDurationMinutesSeconds(30000)).toEqual('500:00');
	});
});
