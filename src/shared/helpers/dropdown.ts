import { type IconName } from '@viaa/avo2-components'

export const createDropdownMenuItem = (
  menuId: string,
  id: string,
  label: string,
  icon: string = id,
  enabled: boolean,
) => {
  if (!enabled) {
    return []
  }
  return [
    {
      id,
      key: menuId + '--' + id,
      label,
      icon: icon as IconName,
    },
  ]
}
