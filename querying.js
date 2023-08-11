import { QueryEngine } from '@comunica/query-sparql';

const queryEngine = new QueryEngine();

// TEMP: needs to be changed to query building app function
function buildQuery(subjectResource) {
	return `
SELECT ?p ?o
WHERE {
    <${subjectResource}> ?p ?o.
}
`;
}

export async function fetchPredicatesAndObjects(subjectResource) {
	const query = buildQuery(subjectResource);
	const bindingsStream = await queryEngine.queryBindings(query, {
		sources: ['https://stad.gent/sparql'],
	});
	const bindings = await bindingsStream.toArray();
	return bindings.map((binding) => {
		const predicate = binding.get('p').value;
		const object = binding.get('o').value;
		return { predicate: predicate, object: object };
	});
}
