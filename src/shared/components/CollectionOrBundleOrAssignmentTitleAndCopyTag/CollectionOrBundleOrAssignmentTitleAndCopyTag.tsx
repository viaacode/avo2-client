import { TagList } from '@viaa/avo2-components'
import React, { type FC } from 'react'
import { Link } from 'react-router-dom'

interface CollectionOrBundleOrAssignmentTitleAndCopyTagProps {
  title: string | undefined | null
  editLink: string
  editLinkOriginal: string | null
}

export const CollectionOrBundleOrAssignmentTitleAndCopyTag: FC<
  CollectionOrBundleOrAssignmentTitleAndCopyTagProps
> = ({ title, editLink, editLinkOriginal }) => {
  const titleTruncated = (title || '-').slice(0, 50)
  return (
    <>
      <Link to={editLink}>
        <span>{titleTruncated}</span>
      </Link>{' '}
      {editLinkOriginal && (
        <Link to={editLinkOriginal}>
          <TagList
            tags={[{ id: editLinkOriginal, label: 'Kopie' }]}
            swatches={false}
          />
        </Link>
      )}
    </>
  )
}
