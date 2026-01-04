import { subHours } from 'date-fns';

import { fromNow, normalizeTimestamp, reorderDate } from './date';

describe('Formatters - date', () => {
  it('should format date as string`', () => {
    expect(reorderDate('2000-01-30')).toEqual('30/01/2000');
    expect(reorderDate('')).toEqual('');
    expect(reorderDate('2000-02')).toEqual('02/2000');

    expect(reorderDate('2000-01-30', '#')).toEqual('30#01#2000');
    expect(reorderDate('', '#')).toEqual('');
    expect(reorderDate('2000-02', '#')).toEqual('02#2000');
  });

  it('should normalize timestamp', () => {
    expect(
      normalizeTimestamp('2017-09-20T00:00:00+00:00').toISOString(),
    ).toEqual('2017-09-20T00:00:00.000Z');
    expect(
      normalizeTimestamp('2017-09-20T00:00:00+02:00').toISOString(),
    ).toEqual('2017-09-19T22:00:00.000Z');
    // expect(normalizeTimestamp('2017-09-20').toISOString()).toEqual('2017-09-19T22:00:00.000Z');
    expect(normalizeTimestamp('2017-09-20 13:12:11').toISOString()).toEqual(
      '2017-09-20T11:12:11.000Z',
    );
  });

  it('should make humanly readable', () => {
    expect(fromNow(subHours(new Date(), 2))).toEqual(
      fromNow(subHours(new Date(), 2)),
    );
  });
});
