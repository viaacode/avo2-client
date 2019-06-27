import { formatDate } from './date';

describe('Formatters - date', () => {
	it('should format date as string`', () => {
		expect(formatDate('2000-01-30')).toEqual('30/01/2000');
		expect(formatDate('')).toEqual('');
		expect(formatDate('2000-02')).toEqual('02/2000');

		expect(formatDate('2000-01-30', '#')).toEqual('30#01#2000');
		expect(formatDate('', '#')).toEqual('');
		expect(formatDate('2000-02', '#')).toEqual('02#2000');
	});
});
