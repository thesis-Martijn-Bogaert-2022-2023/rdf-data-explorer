import { validateIri } from 'validate-iri';

export function iriIsValid(iri) {
	// validateIri return undefined in case valid
	if (validateIri(iri) === undefined) return true;
	return false;
}
