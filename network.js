import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { EventEmitter } from 'events';
import {
	colorCoralPink,
	colorFlax,
	colorRaisingBlack,
	colorSeasalt,
} from './style';
cytoscape.use(dagre);

// Allow events regarding the network to be handled elsewhere
export const networkEvents = new EventEmitter();

// Keep track of network and counter for node IDs
let network, idCounter;

// Initialize layout for hierarchical graph going from left to write
const layoutOptions = {
	name: 'dagre',
	rankDir: 'LR',
	nodeSep: 10,
	rankSep: 400,
};

export function initializeNetwork(startingResource) {
	// Destroy network in case it pre-existed
	if (network) {
		network.destroy();
	}

	// Reset counter for node IDs
	idCounter = 0;

	// Set starting resource as root node
	const rootNode = {
		group: 'nodes',
		data: {
			id: idCounter++,
			label: startingResource,
			isResource: true,
		},
	};

	// Initialize network
	network = cytoscape({
		container: document.getElementById('network'),
		layout: layoutOptions,
		style: [
			{
				selector: 'node',
				style: {
					label: 'data(label)', // Show node's label
					shape: 'round-rectangle',
					width: 'label', // Base width on label
					height: 'label', // Base height on label
					padding: '10px',
					'text-max-width': '200px',
					'text-wrap': 'wrap',
					'text-overflow-wrap': 'anywhere', // Allow text to wrap at any character
					'text-valign': 'center', // Center text vertically
					'text-halign': 'center', // Center text horizontally
					color: colorRaisingBlack,
					'border-color': colorRaisingBlack,
					'border-width': '1px',
					'background-color': (ele) =>
						ele.data('isResource') ? colorCoralPink : colorFlax, // Color resource nodes differently
				},
			},
			{
				selector: 'edge',
				style: {
					'target-label': 'data(label)', // Show edge's label at end of edge
					'curve-style': 'taxi', // Use only vertical and horizontal edges
					'taxi-direction': 'rightward', // Start edge horizontally
					'taxi-turn': '20px', // Take first turn after 20px
					'text-max-width': '300px',
					'text-wrap': 'wrap',
					'text-overflow-wrap': 'anywhere', // Allow text to wrap at any character
					'target-text-offset': 180, // Move text back from edge end
					color: colorRaisingBlack,
					'line-color': colorRaisingBlack,
					'text-background-color': colorSeasalt,
					'text-background-opacity': 0.8,
					'text-background-padding': '10px',
				},
			},
		],
		elements: [rootNode],
	});

	// Add tap event listener to network
	network.on('tap', function (evt) {
		// Get target that was tapped
		const tapTarget = evt.target;
		if (!tapTarget) return;

		// Hide node info in case no node was tapped
		if (tapTarget !== network && tapTarget.isNode()) {
			// Get node's properties
			const label = tapTarget.data('label');
			const isResource = tapTarget.data('isResource');
			networkEvents.emit('nodeSelected', label, isResource);
		} else {
			networkEvents.emit('nodeUnselected');
		}
	});

	return rootNode;
}

export function addPredicateAndObjectToNetwork(
	subjectNode,
	predicate,
	object,
	objectIsResource
) {
	const newNode = {
		group: 'nodes',
		data: { id: idCounter++, label: object, isResource: objectIsResource },
	};

	const newEdge = {
		group: 'edges',
		data: {
			source: subjectNode.data.id,
			target: newNode.data.id,
			label: predicate,
		},
	};

	network.add([newNode, newEdge]);
}

export function renderNetwork() {
	network.layout(layoutOptions).run();
}
