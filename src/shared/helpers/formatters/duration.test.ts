import { formatDurationMinutesSeconds } from './duration.js'

describe('Formatters - duration', () => {
  it('Should format as a duration`', () => {
    expect(formatDurationMinutesSeconds(-5)).toEqual('00:05')
    expect(formatDurationMinutesSeconds(0)).toEqual('00:00')
    expect(formatDurationMinutesSeconds(20)).toEqual('00:20')
    expect(formatDurationMinutesSeconds(40)).toEqual('00:40')
    expect(formatDurationMinutesSeconds(59)).toEqual('00:59')
    expect(formatDurationMinutesSeconds(60)).toEqual('01:00')
    expect(formatDurationMinutesSeconds(61)).toEqual('01:01')
    expect(formatDurationMinutesSeconds(121)).toEqual('02:01')
    expect(formatDurationMinutesSeconds(3000)).toEqual('50:00')
    expect(formatDurationMinutesSeconds(30000)).toEqual('500:00')
  })
})
