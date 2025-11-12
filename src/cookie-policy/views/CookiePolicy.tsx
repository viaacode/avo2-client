import { Container } from '@viaa/avo2-components'
import React, { createRef } from 'react'

export class CookiePolicy extends React.Component<any, any> {
  private cookieBotWrapper = createRef<HTMLDivElement>()

  componentDidMount() {
    if (this.cookieBotWrapper.current) {
      const script = document.createElement('script')
      script.setAttribute('id', 'CookieDeclaration')
      script.src =
        'https://consent.cookiebot.com/8fb68e92-94b2-4334-bc47-7bcda08bc9c7/cd.js'
      this.cookieBotWrapper.current.innerHTML = ''
      this.cookieBotWrapper.current.append(script)
    }
  }

  componentWillUnmount() {
    if (this.cookieBotWrapper.current) {
      this.cookieBotWrapper.current.innerHTML = ''
    }
  }

  render() {
    return (
      <Container mode="vertical">
        <Container mode="horizontal">
          <div ref={this.cookieBotWrapper} />
        </Container>
      </Container>
    )
  }
}

export default CookiePolicy
