import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

// Keep track of network, nodes, edges and counter for node IDs
let network, nodes, edges, idCounter;

export function initializeNetwork(startingResource) {
	// Destroy network in case it pre-existed
	if (network) {
		network.destroy();
	}

	// Reset counter for node IDs
	idCounter = 0;

	// Set starting resource as root node
	const rootNode = {
		id: idCounter++,
		label: startingResource,
	};

	// Make network dynamically "updatable" by using DataSet types
	nodes = new DataSet([rootNode]);
	edges = new DataSet();

	// Create network
	network = new Network(
		document.getElementById('network'),
		{
			nodes: nodes,
			edges: edges,
		},
		{
			layout: {
				hierarchical: {
					direction: 'LR', // Display tree from left to right
				},
			},
			nodes: {
				shape: 'box',
				widthConstraint: {
					maximum: 150,
				},
			},
			edges: {
				arrows: 'to', // Display edges as arrows
			},
		}
	);
}
