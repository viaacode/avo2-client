import React, { Fragment, FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import {
	Avatar,
	BlockImage,
	BlockImageProps,
	BlockImageTitleTextButton,
	BlockImageTitleTextButtonProps,
	BlockIntro,
	BlockIntroProps,
	BlockLinks,
	BlockLinksProps,
	BlockQuote,
	BlockQuoteProps,
	BlockSubtitle,
	BlockSubtitleProps,
	BlockText,
	BlockTextProps,
	BlockTitle,
	BlockTitleImageText,
	BlockTitleImageTextProps,
	BlockTitleProps,
	BlockVideo,
	BlockVideoProps,
	BlockVideoTitleTextButton,
	BlockVideoTitleTextButtonProps,
	Button,
	Container,
	Icon,
	MetaData,
	MetaDataItem,
	Spacer,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get, isEmpty } from 'lodash-es';
import { getCollection } from '../store/actions';
import { selectCollection } from '../store/selectors';

interface CollectionProps extends RouteComponentProps {
	collection: Avo.Collection.Response;
	getCollection: (id: string) => Dispatch;
}

export type BlockType =
	| 'Image'
	| 'ImageTitleTextButton'
	| 'Intro'
	| 'Links'
	| 'Quote'
	| 'RichText'
	| 'Subtitle'
	| 'Title'
	| 'TitleImageText'
	| 'Video'
	| 'VideoTitleTextButton';

export type BlockInfo =
	| BlockImageProps
	| BlockImageTitleTextButtonProps
	| BlockIntroProps
	| BlockLinksProps
	| BlockQuoteProps
	| BlockTextProps
	| BlockSubtitleProps
	| BlockTitleProps
	| BlockTitleImageTextProps
	| BlockVideoProps
	| BlockVideoTitleTextButtonProps;

interface ContentBlockInfo {
	blockType: BlockType;
	content: BlockInfo;
}

// TODO get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

const Collection: FunctionComponent<CollectionProps> = ({
	collection,
	getCollection,
	history,
	location,
	match,
}: CollectionProps) => {
	const [id] = useState((match.params as any)['id'] as string);

	/**
	 * Get collection from api when id changes
	 */
	useEffect(() => {
		getCollection(id);
	}, [id, getCollection]);

	const renderContentBlocks = (contentBlocks: ContentBlockInfo[]) => {
		return contentBlocks.map((contentBlock: ContentBlockInfo, index: number) => {
			return <div key={`content-block-${index}`}>{renderContentBlock(contentBlock)}</div>;
		});
	};

	const renderContentBlock = (contentBlock: ContentBlockInfo) => {
		switch (contentBlock.blockType) {
			case 'Image':
				return <BlockImage {...contentBlock.content as BlockImageProps} />;
			case 'ImageTitleTextButton':
				return (
					<BlockImageTitleTextButton {...contentBlock.content as BlockImageTitleTextButtonProps} />
				);
			case 'Intro':
				return <BlockIntro {...contentBlock.content as BlockIntroProps} />;
			case 'Links':
				return <BlockLinks {...contentBlock.content as BlockLinksProps} />;
			case 'Quote':
				return <BlockQuote {...contentBlock.content as BlockQuoteProps} />;
			case 'RichText':
				return <BlockText {...contentBlock.content as BlockTextProps} />;
			case 'Subtitle':
				return <BlockSubtitle {...contentBlock.content as BlockSubtitleProps} />;
			case 'Title':
				return <BlockTitle {...contentBlock.content as BlockTitleProps} />;
			case 'TitleImageText':
				return <BlockTitleImageText {...contentBlock.content as BlockTitleImageTextProps} />;
			case 'Video':
				return <BlockVideo {...contentBlock.content as BlockVideoProps} />;
			case 'VideoTitleTextButton':
				return (
					<BlockVideoTitleTextButton {...contentBlock.content as BlockVideoTitleTextButtonProps} />
				);
			default:
				console.error('Failed to find contentBlock type: contentBlock.blockType');
				return null;
		}
	};

	const contentBlockInfos: ContentBlockInfo[] = [];
	if (collection) {
		contentBlockInfos.push({
			blockType: 'Intro',
			content: {
				subtitle: 'Introductie',
				text: collection.description,
			} as BlockIntroProps,
		});
		(collection.fragments || []).forEach((collectionFragment: Avo.Collection.Fragment) => {
			contentBlockInfos.push({
				blockType: 'VideoTitleTextButton',
				content: {
					title: collectionFragment.custom_title,
					text: collectionFragment.custom_description,
					videoSource: '',
					buttonLabel: 'Meer lezen',
				} as BlockVideoTitleTextButtonProps,
			});
		});
	}

	return collection ? (
		<Fragment>
			<Container mode="vertical" size="small" background="alt">
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<ToolbarItem>
								<Spacer margin="bottom">
									<MetaData spaced={true} category="collection">
										<MetaDataItem>
											<div className="c-content-type c-content-type--collection">
												<Icon name="collection" />
												<p>COLLECTION</p>
											</div>
										</MetaDataItem>
										<MetaDataItem icon="eye" label={String(188) /* TODO collection.view_count */} />
										<MetaDataItem
											icon="bookmark"
											label={String(12) /* TODO collection.bookmark_count */}
										/>
									</MetaData>
								</Spacer>
								<h1 className="c-h2 u-m-b-0">{collection.title}</h1>
								{collection.owner && (
									<div className="o-flex o-flex--spaced">
										{!isEmpty(collection.owner) && (
											<Avatar
												image={collection.owner.avatar || undefined}
												name={`${collection.owner.fn} ${collection.owner.sn} (${
													USER_GROUPS[collection.owner.group_id]
												})`}
												initials={
													get(collection, 'owner.fn[0]', '') + get(collection, 'owner.sn[0]', '')
												}
											/>
										)}
									</div>
								)}
							</ToolbarItem>
						</ToolbarLeft>
						<ToolbarRight>
							<ToolbarItem>
								<div className="c-button-toolbar">
									{/* TODO add aria label once merged in components repo */}
									<Button type="secondary" icon="bookmark" />
									<Button type="secondary" icon="share-2" />
									<Button type="secondary" icon="file-plus" />
									<Button type="secondary" label="Alle items afspelen" />
									<Button
										type="secondary"
										icon="edit"
										onClick={() => history.push(`/collection/${collection.id}/edit`)}
									/>
								</div>
							</ToolbarItem>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Container>
			<Container mode="vertical">
				<Container mode="horizontal">{renderContentBlocks(contentBlockInfos)}</Container>
			</Container>
		</Fragment>
	) : null;
};

const mapStateToProps = (state: any, { match }: CollectionProps) => ({
	collection: selectCollection(state, (match.params as any).id),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getCollection: (id: string) => dispatch(getCollection(id) as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Collection);
