import React, { FunctionComponent } from 'react';

import { toIsoDate } from '../../helpers/formatters';

export interface JsonLdProps {
	url: string;
	title?: string;
	description?: string | null;
	image?: string | null;
	isOrganisation?: boolean;
	author?: string | null;
	publishedAt?: string | null;
	updatedAt?: string | null;
}

const JsonLd: FunctionComponent<JsonLdProps> = ({
	url,
	title,
	description,
	image,
	isOrganisation,
	author,
	publishedAt,
	updatedAt,
}) => {
	return (
		<script type="application/ld+json">
			{`
{
	"@context": "https://schema.org",
	"@type": "Article",
	"mainEntityOfPage": {
	"@type": "WebPage",
	"@id": "${url}"
},
	"headline": "${title}",
	"description": "${description}",
	"image": [
	"${image}"
	],
	"author": {
	"@type": "${isOrganisation ? 'Organization' : 'Person'}",
	"name": "${author}"
},
	"publisher": {
	"@type": "Organization",
	"name": "Meemoo",
	"logo": {
	"@type": "ImageObject",
	"url": "https://meemoo.be/img/logo-mobile.svg"
}
},
	"datePublished": "${toIsoDate(publishedAt)}",
	"dateModified": "${toIsoDate(updatedAt)}"
}
				`}
		</script>
	);
};

export default JsonLd;
