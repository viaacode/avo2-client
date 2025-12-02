import { BlockHeading } from '@meemoo/admin-core-ui/client'
import {
  Button,
  type ButtonAction,
  type ButtonType,
  Column,
  type DefaultProps,
  defaultRenderLinkFunction,
  Grid,
  type HeadingType,
  Icon,
  type IconName,
  MediaCard,
  MediaCardMetaData,
  MediaCardThumbnail,
  MetaData,
  MetaDataItem,
  type MetaDataItemProps,
  type Orientation,
  type RenderLinkFunction,
  Spacer,
  Thumbnail,
  Toolbar,
  ToolbarLeft,
  ToolbarRight,
} from '@viaa/avo2-components'
import { Avo } from '@viaa/avo2-types'
import clsx from 'clsx'
import {
  type FC,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'

import './BlockMediaGrid.scss'

const FONT_TYPE_TO_VW: Record<HeadingType, number> = {
  h4: 1.8,
  h3: 2.1,
  h2: 2.4,
  h1: 2.7,
}

export type MediaListItem = {
  category: Avo.ContentType.English
  subCategory: Avo.ContentPage.Type
  metadata?: MetaDataItemProps[]
  thumbnail?: {
    label: string
    meta?: string
    src?: string
    topRight?: ReactNode
  }
  src?: string
  title: string
  itemAction: ButtonAction
  buttonLabel?: string
  buttonAltTitle?: string
  buttonIcon?: IconName
  buttonType?: ButtonType
  buttonAction?: ButtonAction
}

interface BlockMediaGridProps extends DefaultProps {
  title?: string
  titleType?: HeadingType
  buttonLabel?: string
  buttonAltTitle?: string
  buttonAction?: ButtonAction
  ctaTitle?: string
  ctaTitleColor?: string
  ctaTitleBackgroundColor?: string
  ctaTitleSize?: HeadingType
  ctaContent?: string
  ctaContentColor?: string
  ctaButtonLabel?: string
  ctaButtonAltTitle?: string
  ctaButtonType?: ButtonType
  ctaButtonIcon?: IconName
  ctaBackgroundColor?: string
  ctaBackgroundImage?: string
  ctaWidth?: string
  ctaButtonAction?: ButtonAction
  fullWidth?: boolean
  elements: MediaListItem[]
  orientation?: Orientation
  renderLink?: RenderLinkFunction
  renderMediaCardWrapper: (
    mediaCard: ReactNode,
    item: MediaListItem,
  ) => ReactNode
}

export const BlockMediaGrid: FC<BlockMediaGridProps> = ({
  title,
  titleType = 'h2',
  buttonLabel,
  buttonAltTitle,
  buttonAction,
  ctaTitle = '',
  ctaTitleColor,
  ctaTitleBackgroundColor,
  ctaTitleSize = 'h4',
  ctaContent = '',
  ctaContentColor,
  ctaButtonLabel = '',
  ctaButtonAltTitle = '',
  ctaBackgroundColor,
  ctaBackgroundImage,
  ctaButtonType = 'secondary',
  ctaButtonIcon,
  ctaButtonAction,
  fullWidth = false,
  className,
  elements = [],
  orientation,
  renderLink = defaultRenderLinkFunction,
  renderMediaCardWrapper,
}) => {
  const ref = React.createRef<HTMLDivElement>()
  const hasCTA = ctaTitle || ctaButtonLabel || ctaContent

  const [blockWidth, setBlockWidth] = useState<number | null>(null) // pixels
  const [windowWidth, setWindowWidth] = useState<number>(0) // pixels

  useEffect(() => {
    if (ref.current) {
      setBlockWidth(ref.current.clientWidth)
    }
  }, [ref])

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sizing = useMemo(() => {
    if (!fullWidth) {
      const fontSize =
        (FONT_TYPE_TO_VW[ctaTitleSize] * (blockWidth || windowWidth)) /
        windowWidth
      const lineHeightTitle = fontSize * 1.2
      const fontWeight = ctaTitleSize === 'h4' ? 'normal' : 'inherit'
      return {
        fontSize: `${fontSize * 3.5}vw`,
        lineHeight: `${lineHeightTitle}vw`,
        fontWeight,
      }
    }
    return {}
  }, [blockWidth, ctaTitleSize, fullWidth, windowWidth])

  const renderCTA = () => {
    return (
      <>
        <div className="c-media-card-thumb">
          <div
            className="c-thumbnail"
            style={{
              backgroundImage: ctaBackgroundImage
                ? `url('${ctaBackgroundImage}')`
                : 'none',
              backgroundColor: ctaBackgroundColor,
            }}
          >
            <div className="c-thumbnail__content">
              {ctaTitle && (
                <BlockHeading type={ctaTitleSize}>
                  <mark
                    style={{
                      ...sizing,
                      backgroundColor: ctaTitleBackgroundColor || 'transparent',
                      color: ctaTitleColor,
                    }}
                  >
                    {ctaTitle}
                  </mark>
                </BlockHeading>
              )}
              {ctaContent && (
                <div style={{ color: ctaContentColor }}>{ctaContent}</div>
              )}
            </div>
          </div>
        </div>
        <div className="c-media-card-content">
          {!!elements.at(-1)?.buttonLabel && !fullWidth && (
            <div>
              <h4 className="c-media-card__title">titel</h4>
              <MetaData category={Avo.ContentType.English.ITEM}>
                <MetaDataItem key={'block-media-list-meta-cta'} label="meta" />
              </MetaData>
            </div>
          )}
          <Spacer margin="top-small">
            <Button
              label={ctaButtonLabel}
              type={ctaButtonType}
              renderIcon={
                ctaButtonIcon ? () => <Icon name={ctaButtonIcon} /> : undefined
              }
            />
          </Spacer>
        </div>
      </>
    )
  }

  const renderMediaCard = (mediaListItem: MediaListItem) => {
    const {
      category,
      subCategory,
      metadata,
      thumbnail,
      title,
      buttonLabel,
      buttonIcon,
      buttonType,
    } = mediaListItem

    return (
      <MediaCard
        category={category}
        subCategory={subCategory}
        orientation={orientation}
        title={title}
      >
        {thumbnail && (
          <MediaCardThumbnail>
            <Thumbnail
              alt={title}
              category={category}
              subCategory={subCategory}
              {...thumbnail}
            />
          </MediaCardThumbnail>
        )}
        <MediaCardMetaData>
          <div>
            {metadata && metadata.length > 0 && (
              <MetaData category={category}>
                {metadata.map((props, i) => (
                  <MetaDataItem key={`block-media-list-meta-${i}`} {...props} />
                ))}
              </MetaData>
            )}
            {(!!buttonIcon || !!buttonLabel) && (
              <Spacer margin="top-small">
                <div
                  onClick={(evt) => {
                    evt.stopPropagation() // Avoid triggering the click on the media card
                  }}
                >
                  {renderLink(
                    mediaListItem.buttonAction || mediaListItem.itemAction,
                    <Button
                      label={buttonLabel}
                      type={buttonType}
                      renderIcon={
                        buttonIcon
                          ? () => <Icon name={buttonIcon} />
                          : undefined
                      }
                    />,
                    mediaListItem.buttonLabel || mediaListItem.title,
                    mediaListItem.buttonAltTitle ||
                      mediaListItem.buttonLabel ||
                      mediaListItem.title,
                  )}
                </div>
              </Spacer>
            )}
          </div>
        </MediaCardMetaData>
      </MediaCard>
    )
  }

  return (
    <div className={clsx(className, 'c-block-media-list c-media-card-list')}>
      {(!!title || !!buttonLabel) && (
        <Toolbar>
          <ToolbarLeft>
            {title && <BlockHeading type={titleType}>{title}</BlockHeading>}
          </ToolbarLeft>
          <ToolbarRight>
            {buttonLabel &&
              renderLink(
                buttonAction,
                <Button label={buttonLabel} type="secondary" />,
                buttonLabel,
                buttonAltTitle || buttonLabel,
              )}
          </ToolbarRight>
        </Toolbar>
      )}
      <Grid>
        {elements.map((mediaListItem, i) => {
          return (
            <Column
              key={`block-media-list-${i}`}
              size={fullWidth ? '3-12' : '3-3'}
            >
              {renderMediaCardWrapper(
                renderMediaCard(mediaListItem),
                mediaListItem,
              )}
            </Column>
          )
        })}
        {hasCTA && (
          <Column size={fullWidth ? '3-12' : '3-3'}>
            <div
              className={clsx(className, 'c-media-card', 'c-media-card__cta')}
              ref={ref}
            >
              {renderLink(
                ctaButtonAction,
                renderCTA(),
                ctaButtonLabel || ctaTitle,
                ctaButtonAltTitle || ctaButtonLabel || ctaTitle,
              )}
            </div>
          </Column>
        )}
      </Grid>
    </div>
  )
}
