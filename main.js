import './style.scss';
import {
	addNodeToQuery,
	addPredicateAndObjectToNetwork,
	initializeNetwork,
	removeNodeFromQuery,
	removeNodesAndEdges,
	renderNetwork,
} from './network';
import { fetchPredicatesAndObjects } from './querying';
import { iriIsValid } from './validation';
import { networkEvents } from './network';
import { predeterminedDatasources } from './datasources';
import LanguageList from 'language-list';

// Get div to display tapped node information
const nodeInfoDiv = document.getElementById('node_info');

// Instantiate factory for language names
const languageList = new LanguageList();

// START BUTTON PRESSED
document.getElementById('btn_start').addEventListener('click', function () {
	// Get entered starting resource value
	const startingResource = document.getElementById('txt_start_resource').value;

	// Only move on if entered value is valid IRI
	if (!startingResource || !iriIsValid(startingResource)) {
		alert('Enter a valid IRI!');
		return;
	}

	// Initialize and render network
	initializeNetwork(startingResource);
	renderNetwork();
});

// NODE SELECTED
networkEvents.on(
	'nodeSelected',
	(nodeId, nodeLabel, isResource, successingNodes) => {
		// Keep track of HTML elements to render in node information div
		const htmlElements = [];

		// Add title
		htmlElements.push(`<h2>${nodeLabel}</h2>`);

		// Add input for fetching predicates and objects
		if (isResource) {
			htmlElements.push(`
				<div class="input_row">
					<label for="txt_datasource">Datasource:</label>
					<input type="text" id="txt_datasource" list="lst_datasource">
					<datalist id="lst_datasource">
						${[...predeterminedDatasources]
							.map((datasource) => `<option value="${datasource}">`)
							.join('\n')}
					</datalist>
					<button id="btn_expand">Expand</button>
				</div>
			`);
		}

		htmlElements.push(`
			<div class="input_row">
				<label for="txt_filter_string">Filter (not required):</label>
				<input type="text" id="txt_filter_string" list="lst_filter">
				<datalist id="lst_filter">
					<option value="${nodeLabel}">
				</datalist>
				<select id="slct_filter_lang">
					${languageList
						.getLanguageCodes()
						.map(
							(code) =>
								`<option value="${code}">${languageList.getLanguageName(
									code
								)}</option>`
						)}
				</select>
				<button id="btn_add_query">Add to Query</button>
				<button id="btn_remove_query">Remove from Query</button>
			</div>
		`);

		// Set div's inner HTML
		nodeInfoDiv.innerHTML = htmlElements.join('\n');

		if (isResource) {
			// EXPAND BUTTON PRESSSED
			document
				.getElementById('btn_expand')
				.addEventListener('click', async function () {
					// Check if given datasource is valid
					const datasource = document.getElementById('txt_datasource').value;
					if (!datasource || !iriIsValid(datasource)) {
						alert('Enter a valid datasource!');
						return;
					}

					// Add datasource to predetermined datasources for future use
					predeterminedDatasources.add(datasource);

					// Fetch predicates and object of node's resource
					const results = await fetchPredicatesAndObjects(
						nodeLabel,
						datasource
					);

					// Remove node's successors (nodes and edges) in case they already existed
					if (successingNodes.length > 0) {
						removeNodesAndEdges(successingNodes);
					}

					// Add predicates and objects to network
					results.forEach((result) =>
						addPredicateAndObjectToNetwork(
							nodeId,
							result.predicate,
							result.object,
							result.objectIsResource
						)
					);

					// Rerender network
					renderNetwork();
				});
		}

		// ADD TO QUERY BUTTON PRESSED
		document
			.getElementById('btn_add_query')
			.addEventListener('click', function () {
				const stringFilter = document.getElementById('txt_filter_string').value;
				const languageFilter =
					document.getElementById('slct_filter_lang').value;
				addNodeToQuery(nodeId, stringFilter, languageFilter);
			});

		// REMOVE FROM QUERY BUTTON PRESSED
		document
			.getElementById('btn_remove_query')
			.addEventListener('click', function () {
				removeNodeFromQuery(nodeId);
			});

		// Show div displaying node info
		nodeInfoDiv.style.display = 'block';
	}
);

// NODE UNSELECTED
networkEvents.on('nodeUnselected', () => {
	nodeInfoDiv.style.display = 'none';
});
