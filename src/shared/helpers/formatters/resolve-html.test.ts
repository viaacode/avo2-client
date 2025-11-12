/**
 * @jest-environment jsdom
 */

import { stripHtml } from './strip-html.js'

describe('Formatters - duration', () => {
  it('Should strip html tags and resolve html entities`', () => {
    const resolvedHtml = stripHtml(`<p>
<strong>
<em>
Some text 'with quotes?’.&nbsp;
</em>
</strong>
<strong>
<em>
test some text with Capitals`)
    expect(resolvedHtml).toEqual(
      "Some text 'with quotes?’. test some text with Capitals",
    )
  })
})
