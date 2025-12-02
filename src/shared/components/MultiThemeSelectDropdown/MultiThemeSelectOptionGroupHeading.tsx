import { Icon, IconName } from '@viaa/avo2-components'
import { type FC, useEffect, useState } from 'react'
import { components, type GroupHeadingProps } from 'react-select'

export const MultiThemeSelectOptionGroupHeading: FC<GroupHeadingProps> = (
  props,
) => {
  const { GroupHeading } = components
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [element, setElement] = useState<Element | null>()
  const handleHeaderClick = () => {
    if (!isOpen) {
      element?.classList?.remove(
        'c-multi-theme-select__group-heading--collapsed',
      )
    } else {
      element?.classList?.add('c-multi-theme-select__group-heading--collapsed')
    }

    setIsOpen(!isOpen)
  }

  useEffect(() => {
    const element = document.querySelector(`#${props.id}`)?.parentElement
      ?.nextElementSibling
    setElement(element)
    element?.classList.add('c-multi-theme-select__group-heading--collapsed')
  }, [props.id])

  return (
    <div
      className="c-multi-theme-select__group-heading-wrapper"
      onClick={() => handleHeaderClick()}
    >
      <GroupHeading {...props} className="c-multi-theme-select__group-heading">
        <Icon name={isOpen ? IconName.chevronUp : IconName.chevronDown} />
        <p>{props.data.label}</p>
      </GroupHeading>
    </div>
  )
}
