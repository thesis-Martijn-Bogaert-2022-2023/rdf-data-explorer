import './style.scss';
import {
	toggleNodeAddedToQuery,
	addPredicateAndObjectToNetwork,
	getPropertiesWithPredicateSequences,
	initializeNetwork,
	removeNodesAndEdges,
	renderNetwork,
	addFilters,
	storeDatasource,
} from './network';
import { fetchPredicatesAndObjects } from './querying';
import { iriIsValid } from './validation';
import { networkEvents } from './network';
import { predeterminedDatasources } from './datasources';
import { languages } from './language-names-codes';
import { modifyUri } from './uri-modification';
import { buildQuery } from 'sparql-query-builder';

// Get div to display tapped node information
const nodeInfoDiv = document.getElementById('node_info');

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
	(
		nodeId,
		nodeLabel,
		isResource,
		stringFilter,
		languageFilter,
		addedToQuery,
		propertyName,
		isOptional,
		isRoot,
		datasource,
		successingNodes
	) => {
		// Keep track of HTML elements to render in node information div
		const htmlElements = [];

		// Add title
		htmlElements.push(`<h2>${nodeLabel}</h2>`);

		// Add input row for fetching predicates and objects
		if (isResource) {
			htmlElements.push(`
				<div class="input_row">
					<label for="txt_datasource">Datasource:</label>
					<input type="text" id="txt_datasource" value="${
						datasource ?? ''
					}" list="lst_datasource">
					<datalist id="lst_datasource">
						${[...predeterminedDatasources, ...modifyUri(nodeLabel)]
							.map((datasource) => `<option value="${datasource}">`)
							.join('\n')}
					</datalist>
					<button id="btn_expand">Expand</button>
				</div>
			`);
		}

		if (!isRoot) {
			// Add input row for adding to query
			htmlElements.push(`
				<div class="input_row">
					<label for="txt_property">Property Name:</label>
					<input type="text" id="txt_property" value="${propertyName ?? ''}">
					<button ${
						addedToQuery ? 'disabled' : ''
					} id="btn_add_query">Add to Query</button>
					<button ${
						addedToQuery ? '' : 'disabled'
					} id="btn_remove_query">Remove from Query</button>
				</div>
			`);

			// Add input row for filtering
			htmlElements.push(`
				<div class="input_row" id="input_row_filter" ${
					addedToQuery ? '' : `style="display:none;"`
				}>
					<label for="txt_filter_string">Filter (not required):</label>
					<input type="text" id="txt_filter_string" value="${
						stringFilter ?? ''
					}" list="lst_filter">
					<datalist id="lst_filter">
						<option value="${nodeLabel}">
					</datalist>
					<select id="slct_filter_lang">
						<option value ${languageFilter ? 'selected' : ''}>Any Language</option>
						${Object.entries(languages).map(
							([languageName, languageCode]) =>
								`<option value="${languageCode}" ${
									languageFilter === languageCode ? 'selected' : ''
								}>${languageName}</option>`
						)}
					</select>
					<select id="slct_optional">
						<option value ${isOptional ? '' : 'selected'}>Required Property</option>
						<option value="isOptional" ${
							isOptional ? 'selected' : ''
						}>Optional Property</option>
					</select>
					<button id="btn_filters_save">Save</button>
				</div>
			`);
		}

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

					// Fetch predicates and object of node's resource
					document.getElementById('btn_expand').textContent = 'Loading ...';
					let results = [];
					try {
						results = await fetchPredicatesAndObjects(nodeLabel, datasource);
					} catch (error) {
						document.getElementById('btn_expand').textContent =
							'Error, try again';
						return;
					}
					document.getElementById('btn_expand').textContent = 'Expand';

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

					// Store datasource
					storeDatasource(nodeId, datasource);
				});
		}

		if (!isRoot) {
			// Get add and remove query buttons
			const btnAddQuery = document.getElementById('btn_add_query');
			const btnRemoveQuery = document.getElementById('btn_remove_query');

			// ADD TO QUERY BUTTON PRESSED
			btnAddQuery.addEventListener('click', function () {
				// Get entered property name
				const propertyName = document.getElementById('txt_property').value;

				// Make sure property name is given
				if (!propertyName) {
					alert('Enter a property name!');
					return;
				}

				toggleNodeAddedToQuery(nodeId, propertyName);

				// Enable and disable correct query buttons
				btnAddQuery.disabled = true;
				btnRemoveQuery.disabled = false;

				// Show filters row
				document
					.getElementById('input_row_filter')
					.style.removeProperty('display');
			});

			// REMOVE FROM QUERY BUTTON PRESSED
			btnRemoveQuery.addEventListener('click', function () {
				toggleNodeAddedToQuery(nodeId);

				// Enable and disable correct query buttons
				btnAddQuery.disabled = false;
				btnRemoveQuery.disabled = true;

				// Hide filters row
				document.getElementById('input_row_filter').style.display = 'none';
			});

			// SAVE FILTERS BUTTON PRESSSED
			document
				.getElementById('btn_filters_save')
				.addEventListener('click', function () {
					const stringFilter =
						document.getElementById('txt_filter_string').value;
					const languageFilter =
						document.getElementById('slct_filter_lang').value;
					const isOptional = Boolean(
						document.getElementById('slct_optional').value
					);
					addFilters(nodeId, stringFilter, languageFilter, isOptional);
				});
		}

		// Show div displaying node info
		nodeInfoDiv.style.display = 'block';
	}
);

// NODE UNSELECTED
networkEvents.on('nodeUnselected', () => {
	nodeInfoDiv.style.display = 'none';
});

// GENERATE QUERY BUTTON PRESSED
document.getElementById('btn_query').addEventListener('click', function () {
	const properties = getPropertiesWithPredicateSequences();
	if (!properties) return;
	const limit = document.getElementById('txt_limit').value;
	const offset = document.getElementById('txt_offset').value;
	const query = buildQuery(
		properties,
		undefined,
		undefined,
		limit && limit > 0 ? limit : undefined,
		offset && offset > 0 ? offset : undefined
	);
	console.log(query);
});
