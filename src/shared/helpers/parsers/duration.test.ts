import { parseDuration } from './duration';

describe('Parsers - duration', () => {
  it('Should parse a duration as a number`', () => {
    expect(parseDuration('00:00:00')).toEqual(0)
    expect(parseDuration('00:00:05')).toEqual(5)
    expect(parseDuration('00:00:20')).toEqual(20)
    expect(parseDuration('00:00:40')).toEqual(40)
    expect(parseDuration('00:00:59')).toEqual(59)
    expect(parseDuration('00:01:00')).toEqual(60)
    expect(parseDuration('00:01:01')).toEqual(61)
    expect(parseDuration('00:02:01')).toEqual(121)
    expect(parseDuration('00:50:00')).toEqual(3000)
    expect(parseDuration('08:20:00')).toEqual(30000)
  })
})
