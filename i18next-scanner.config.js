const fs = require('fs');
const path = require("path");
const typescript = require("typescript");
const _ = require('lodash');
const eol = require('eol');
const VirtualFile = require('vinyl');
const flattenObjectKeys = require('i18next-scanner/lib/flatten-object-keys').default;
const omitEmptyObject = require('i18next-scanner/lib/omit-empty-object').default;

const mainConfig = {
	input: [
		'src/**/*.{ts,tsx}',
	],
	output: 'src/shared/translations',
	options: {
		debug: true,
		lngs: ['nl'],
		removeUnusedKeys: true,
		defaultLng: 'nl',
		defaultNs: 'resource',
		defaultValue: function(lng, ns, key) {
			return key.split(' -- ')[0];
		},
		resource: {
			loadPath: '{{lng}}.json',
			savePath: '{{lng}}.json',
			jsonIndent: 2,
			lineEnding: '\n'
		},
		nsSeparator: false, // namespace separator
		keySeparator: false, // key separator
		contextSeparator: ' -- ',
	},
};

function getFileJSON(resPath) {
	try {
		return JSON.parse(
			fs
				.readFileSync(fs.realpathSync(path.join('src', resPath)))
				.toString('utf-8'),
		);
	} catch (e) {
		return {};
	}
}

function flush(done) {
	const { parser } = this;
	const { options } = parser;

	// Flush to resource store
	const resStore = parser.get({ sort: options.sort });
	const { jsonIndent } = options.resource;
	const lineEnding = String(options.resource.lineEnding).toLowerCase();

	Object.keys(resStore).forEach(lng => {
		const namespaces = resStore[lng];

		Object.keys(namespaces).forEach(ns => {
			let obj = namespaces[ns];

			const resPath = parser.formatResourceSavePath(lng, ns);

			// if not defaultLng then Get, Merge & removeUnusedKeys of old JSON content
			if (lng !== options.defaultLng) {
				let resContent = getFileJSON(resPath);

				if (options.removeUnusedKeys) {
					const namespaceKeys = flattenObjectKeys(obj);
					const resContentKeys = flattenObjectKeys(resContent);
					const unusedKeys = _.differenceWith(
						resContentKeys,
						namespaceKeys,
						_.isEqual,
					);

					for (let i = 0; i < unusedKeys.length; ++i) {
						_.unset(resContent, unusedKeys[i]);
					}

					resContent = omitEmptyObject(resContent);
				}

				obj = { ...obj, ...resContent };
			}

			let text = `${JSON.stringify(obj, null, jsonIndent)}\n`;

			if (lineEnding === 'auto') {
				text = eol.auto(text);
			} else if (lineEnding === '\r\n' || lineEnding === 'crlf') {
				text = eol.crlf(text);
			} else if (lineEnding === '\n' || lineEnding === 'lf') {
				text = eol.lf(text);
			} else if (lineEnding === '\r' || lineEnding === 'cr') {
				text = eol.cr(text);
			} else {
				// Defaults to LF
				text = eol.lf(text);
			}

			this.push(
				new VirtualFile({
					path: resPath,
					contents: Buffer.from(text),
				}),
			);
		});
	});

	done();
}

function getFormattedKey(filePath, key) {
	const fileKey = filePath
		.substring((__dirname + '/src').length)
		.replace(/[\\\/]+/g, '/')
		.split('.')[0]
		.split(/[\\\/]/g).map(part => _.kebabCase(part)).join('/')
		.toLowerCase()
		.replace(/(^\/+|\/+$)/g, '')
		.trim();
	const formattedKey = _.kebabCase(key);
	return fileKey + '___' + formattedKey;
}

function transform(file, enc, done) {
	if (file.path.endsWith('.d.ts') ||
		file.path.endsWith('test.ts') ||
		file.path.endsWith('test.tsx')) {
		done();
		return;
	}
	const content = fs.readFileSync(file.path, enc);

	console.log('file: ', file.path);
	const { outputText } = typescript.transpileModule(content, {
		compilerOptions: {
			target: 'es2018',
		},
		fileName: path.basename(file.path),
	});

	if (file.path.endsWith('.tsx')) {
		this.parser.parseTransFromString(outputText, { component: 'Trans' }, (key, options) => {
			this.parser.set(getFormattedKey(file.path, (key || options.defaultValue)), (key || options.defaultValue));
		});
	}
	this.parser.parseFuncFromString(outputText, { list: ['t', 'i18n.t'] }, (key, options) => {
		this.parser.set(getFormattedKey(file.path, (key || options.defaultValue)), (key || options.defaultValue));
	});

	done();
}

module.exports = {
	...mainConfig,
	transform,
	flush,
};
