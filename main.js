import './style.scss';
import {
	addPredicateAndObjectToNetwork,
	initializeNetwork,
	renderNetwork,
} from './network';
import { fetchPredicatesAndObjects } from './querying';
import { iriIsValid } from './validation';
import { networkEvents } from './network';

// Get div to display tapped node information
const nodeInfoDiv = document.getElementById('node_info');

// START BUTTON PRESSED
document
	.getElementById('btn_start')
	.addEventListener('click', async function () {
		// Get entered starting resource value
		const startingResource =
			document.getElementById('txt_start_resource').value;

		// Only move on if entered value is valid IRI
		if (!startingResource || !iriIsValid(startingResource)) {
			alert('Enter a valid IRI!');
			return;
		}

		// Initialize and render network
		const rootNode = initializeNetwork(startingResource);
		renderNetwork();

		// Fetch and display predicates and object of root resource
		const results = await fetchPredicatesAndObjects(startingResource);
		results.forEach((result) =>
			addPredicateAndObjectToNetwork(
				rootNode,
				result.predicate,
				result.object,
				result.objectIsResource
			)
		);
		renderNetwork();
	});

// NODE SELECTED
networkEvents.on('nodeSelected', (label, isResource) => {
	// Keep track of HTML elements to render in node information div
	const htmlElements = [];

	// Add title
	htmlElements.push(`<h2>${label}</h2>`);

	// Add input for fetching predicates and objects
	if (isResource) {
		htmlElements.push(`
				<div class="input_form">
					<div class="input_row">
						<label for="txt_datasource">Datasource:</label>
						<input type="text" id="txt_datasource">
						<button id="btn_expand">Expand</button>
					</div>
				</div>
			`);
	}

	// Set div's inner HTML
	nodeInfoDiv.innerHTML = htmlElements.join('\n');

	// Show div displaying node info
	nodeInfoDiv.style.display = 'block';
});

// NODE UNSELECTED
networkEvents.on('nodeUnselected', () => {
	nodeInfoDiv.style.display = 'none';
});
