import { BlockHeading } from '@meemoo/admin-core-ui/client'
import { ContentInput, Flex, Icon, IconName } from '@viaa/avo2-components'
import { type FC, useMemo, useState } from 'react'

import { tText } from '../../shared/helpers/translate-text';

type CollectionOrBundleTitleProps = {
  initialTitle: string | undefined
  title: string | undefined
  onChange: (title: string) => void
  maxLength?: number
  onFocus?: () => void
}

export const CollectionOrBundleTitle: FC<CollectionOrBundleTitleProps> = ({
  initialTitle,
  title,
  onChange,
  maxLength,
  onFocus,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false)

  const handleTitleChange = (title: string) => {
    // AVO-2827: add max title length
    if (maxLength && title.length > maxLength) {
      return
    } else {
      onChange(title)
    }
  }

  return useMemo(
    () => (
      <Flex center className="c-inline-title-edit">
        <BlockHeading type="h2">
          <Flex align="start">
            <ContentInput
              value={title ?? undefined}
              placeholder={tText(
                'Collection/views/Collection-create___placeholder',
              )}
              nodeCancel={<Icon name={IconName.x} size="small" />}
              nodeSubmit={<Icon name={IconName.check} size="small" />}
              onChange={handleTitleChange}
              onCancel={() => onChange(initialTitle as string)}
              onOpen={() => setIsActive(true)}
              onClose={() => setIsActive(false)}
              iconEnd={() =>
                !isActive && <Icon name={IconName.edit4} size="small" subtle />
              }
              onFocus={onFocus}
            />
          </Flex>
        </BlockHeading>
      </Flex>
    ),
    [title, onChange, isActive],
  )
}
