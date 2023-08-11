import {
	addPredicateAndObjectToNetwork,
	initializeNetwork,
	stabilizeNetwork,
} from './network';
import { fetchPredicatesAndObjects } from './querying';
import './style.css';
import { iriIsValid } from './validation';

// (Re)draw network on start button press
document
	.getElementById('btn_start')
	.addEventListener('click', async function () {
		// Get entered value
		const startingResource =
			document.getElementById('txt_start_resource').value;

		// Only move on if entered value is valid IRI
		if (!iriIsValid(startingResource)) {
			alert('Enter a valid IRI!');
			return;
		}

		const rootNode = initializeNetwork(startingResource);

		const results = await fetchPredicatesAndObjects(startingResource);
		results.forEach((result) =>
			addPredicateAndObjectToNetwork(rootNode, result.predicate, result.object)
		);
		stabilizeNetwork();
	});
