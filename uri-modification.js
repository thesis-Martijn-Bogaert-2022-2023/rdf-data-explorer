// Returns orginal uri with optionally modified wikidata/getty/stadgent URIs if necessary
export function modifyUri(uri) {
	const uriArray = [];
	uriArray.push(uri);

	// Wikidata
	if (
		uri.startsWith('http://www.wikidata.org/entity/') ||
		uri.startsWith('https://www.wikidata.org/entity/')
	) {
		uriArray.push(uri.replace('/entity/', '/wiki/Special:EntityData/'));
		return uriArray;
	}

	// Getty Vocabularies
	const gettyUriRegex = /^https?:\/\/vocab\.getty\.edu\/.+$/u;
	const gettyExtensions = ['.json', '.jsonld', '.rdf', '.n3', '.ttl', '.nt'];
	if (
		gettyUriRegex.test(uri) &&
		!gettyExtensions.some((ext) => uri.endsWith(ext))
	) {
		uriArray.push(uri + '.jsonld');
		return uriArray;
	}

	// Stad Gent
	const stadGentUriRegex = /^https?:\/\/stad\.gent\/id\/.+$/u;
	if (stadGentUriRegex.test(uri)) {
		uriArray.push(uri.replace('/id/', '/data/'));
		return uriArray;
	}

	return uriArray;
}
