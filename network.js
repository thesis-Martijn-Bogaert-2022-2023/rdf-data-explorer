import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import { EventEmitter } from 'events';
import {
	colorCoolGray,
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
					'font-weight': (ele) =>
						ele.data('addedToQuery') ? 'bold' : 'normal',
					color: colorRaisingBlack,
					'border-color': colorRaisingBlack,
					'border-width': (ele) => (ele.data('addedToQuery') ? '5px' : '1px'),
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

		// Check whether tap target isn't outside network element and is also node
		if (tapTarget !== network && tapTarget.isNode()) {
			// Get node's properties
			const nodeId = tapTarget.data('id');
			const nodeLabel = tapTarget.data('label');
			const isResource = tapTarget.data('isResource');
			const stringFilter = tapTarget.data('stringFilter');
			const languageFilter = tapTarget.data('languageFilter');

			// Get IDs of node's successing nodes
			const successingNodes = tapTarget.successors().nodes();

			// Let UI handler know node was selected
			networkEvents.emit(
				'nodeSelected',
				nodeId,
				nodeLabel,
				isResource,
				stringFilter,
				languageFilter,
				successingNodes
			);
		} else {
			// Let UI handler know node was unselected
			networkEvents.emit('nodeUnselected');
		}
	});
}

export function addPredicateAndObjectToNetwork(
	subjectNodeId,
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
			source: subjectNodeId,
			target: newNode.data.id,
			label: predicate,
		},
	};

	network.add([newNode, newEdge]);
}

export function renderNetwork() {
	network.layout(layoutOptions).run();
}

export function removeNodesAndEdges(nodes) {
	network.remove(nodes);
}

export function addNodeToQuery(nodeId, stringFilter, languageFilter) {
	const node = network.getElementById(nodeId);
	node.data('addedToQuery', true);
	node.data('stringFilter', stringFilter);
	node.data('languageFilter', languageFilter);
}

export function removeNodeFromQuery(nodeId) {
	const node = network.getElementById(nodeId);
	node.data('addedToQuery', false);
}
