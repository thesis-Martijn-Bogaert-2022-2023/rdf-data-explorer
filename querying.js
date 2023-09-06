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

export async function fetchPredicatesAndObjects(subjectResource, datasource) {
	let predicatesAndObjects;

	const query = buildQuery(subjectResource);
	try {
		const bindingsStream = await queryEngine.queryBindings(query, {
			sources: [datasource],
		});
		const bindings = await bindingsStream.toArray();
		predicatesAndObjects = bindings.map((binding) => {
			const predicate = binding.get('p').value;
			const object = binding.get('o').value;
			const objectIsResource = binding.get('o').termType === 'NamedNode';
			return { predicate, object, objectIsResource };
		});
	} catch (error) {
		console.error(error);
		throw error;
	}

	return predicatesAndObjects;
}
