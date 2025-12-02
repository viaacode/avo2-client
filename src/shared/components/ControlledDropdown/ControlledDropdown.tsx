import { Dropdown, type DropdownProps } from '@viaa/avo2-components'
import { useState } from 'react'

export const ControlledDropdown = (props: DropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <Dropdown
      {...props}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onOpen={() => setIsOpen(true)}
    />
  )
}
