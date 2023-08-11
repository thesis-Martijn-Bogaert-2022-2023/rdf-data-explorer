import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
cytoscape.use(dagre);

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
				},
			},
			{
				selector: 'edge',
				style: {
					'target-label': 'data(label)', // Show edge's label at end of edge
					'curve-style': 'taxi', // Use only vertical and horizontal edges
					'taxi-direction': 'rightward', // Start edge horizontally
					'taxi-turn': '5%', // Take first turn at 5% of edge's length
					'text-max-width': '300px',
					'text-wrap': 'wrap',
					'text-overflow-wrap': 'anywhere', // Allow text to wrap at any character
					'target-text-offset': 180, // Move text back from edge end
				},
			},
		],
		elements: [rootNode],
	});

	return rootNode;
}

export function addPredicateAndObjectToNetwork(subjectNode, predicate, object) {
	const newNode = {
		group: 'nodes',
		data: { id: idCounter++, label: object },
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
