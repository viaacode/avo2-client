"use strict";
exports.__esModule = true;
exports.toDutchContentType = exports.toEnglishContentType = exports.ContentTypeString = exports.ContentTypeNumber = void 0;
var lodash_es_1 = require("lodash-es");
var ContentTypeNumber;
(function (ContentTypeNumber) {
    ContentTypeNumber[ContentTypeNumber["audio"] = 1] = "audio";
    ContentTypeNumber[ContentTypeNumber["video"] = 2] = "video";
    ContentTypeNumber[ContentTypeNumber["collection"] = 3] = "collection";
    ContentTypeNumber[ContentTypeNumber["bundle"] = 4] = "bundle";
})(ContentTypeNumber = exports.ContentTypeNumber || (exports.ContentTypeNumber = {}));
var ContentTypeString;
(function (ContentTypeString) {
    ContentTypeString["item"] = "item";
    ContentTypeString["audio"] = "audio";
    ContentTypeString["video"] = "video";
    ContentTypeString["collection"] = "collectie";
    ContentTypeString["bundle"] = "bundel";
    ContentTypeString["searchquery"] = "zoekopdracht";
})(ContentTypeString = exports.ContentTypeString || (exports.ContentTypeString = {}));
var CONTENT_TYPE_TRANSLATIONS = {
    item: 'item',
    audio: 'audio',
    video: 'video',
    collectie: 'collection',
    map: 'bundle',
    bundel: 'bundle',
    zoek: 'search',
    zoekopdracht: 'searchquery'
};
function toEnglishContentType(label) {
    return CONTENT_TYPE_TRANSLATIONS[label];
}
exports.toEnglishContentType = toEnglishContentType;
function toDutchContentType(label) {
    return lodash_es_1.invert(CONTENT_TYPE_TRANSLATIONS)[label];
}
exports.toDutchContentType = toDutchContentType;
//# sourceMappingURL=collection.types.js.map