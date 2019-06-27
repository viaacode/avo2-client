import { formatDate, formatDuration, parseDuration } from './formatting';

describe('formatting helpers', () => {
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

	it('Should parse a duration as a number`', () => {
		expect(parseDuration('00:00:00')).toEqual(0);
		expect(parseDuration('00:00:05')).toEqual(5);
		expect(parseDuration('00:00:20')).toEqual(20);
		expect(parseDuration('00:00:40')).toEqual(40);
		expect(parseDuration('00:00:59')).toEqual(59);
		expect(parseDuration('00:01:00')).toEqual(60);
		expect(parseDuration('00:01:01')).toEqual(61);
		expect(parseDuration('00:02:01')).toEqual(121);
		expect(parseDuration('00:50:00')).toEqual(3000);
		expect(parseDuration('08:20:00')).toEqual(30000);
	});

	it('should format date as string`', () => {
		expect(formatDate('2000-01-30')).toEqual('30/01/2000');
		expect(formatDate('')).toEqual('');
		expect(formatDate('2000-02')).toEqual('02/2000');

		expect(formatDate('2000-01-30', '#')).toEqual('30#01#2000');
		expect(formatDate('', '#')).toEqual('');
		expect(formatDate('2000-02', '#')).toEqual('02#2000');
	});
});
