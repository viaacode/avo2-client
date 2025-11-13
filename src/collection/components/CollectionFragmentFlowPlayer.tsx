import { type FlowPlayerWrapperProps } from '@meemoo/admin-core-ui/admin'
import { type Avo } from '@viaa/avo2-types'
import React, { type FC } from 'react'

import { FlowPlayerWrapper } from '../../shared/components/FlowPlayerWrapper/FlowPlayerWrapper';
import { getFlowPlayerPoster } from '../../shared/helpers/get-poster';
import { type BlockItemComponent } from '../collection.types';

export type CollectionFragmentFlowPlayerProps = BlockItemComponent &
  FlowPlayerWrapperProps

export const CollectionFragmentFlowPlayer: FC<
  CollectionFragmentFlowPlayerProps
> = (props) => {
  const { block, ...rest } = props

  const meta = block?.item_meta as Avo.Item.Item | undefined

  return (
    <FlowPlayerWrapper
      item={meta}
      poster={getFlowPlayerPoster(block?.thumbnail_path, meta)}
      external_id={meta?.external_id}
      duration={meta?.duration}
      title={meta?.title}
      cuePointsVideo={
        block
          ? {
              start: block.start_oc || null,
              end: block.end_oc || null,
            }
          : undefined
      }
      cuePointsLabel={
        block
          ? {
              start: block.start_oc || null,
              end: block.end_oc || null,
            }
          : undefined
      }
      {...rest}
    />
  )
}
