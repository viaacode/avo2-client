import { noop } from 'es-toolkit'
import React, { type FC } from 'react'

import { LoginOptions } from './LoginOptions.js'
import './LoginOptionsDropdown.scss'

interface LoginOptionsDropdownProps {
  closeDropdown?: () => void
}

export const LoginOptionsDropdown: FC<LoginOptionsDropdownProps> = ({
  closeDropdown = noop,
}) => {
  return (
    <div className="m-login-options-dropdown">
      <LoginOptions onOptionClicked={closeDropdown} />
    </div>
  )
}
