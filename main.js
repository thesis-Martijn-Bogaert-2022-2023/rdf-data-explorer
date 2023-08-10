import './style.css';
import { DataSet, Network } from 'vis-network/standalone/esm/vis-network';

const nodes = new DataSet();
const edges = new DataSet();

const data = {
	nodes: nodes,
	edges: edges,
};

const options = {
	layout: {
		hierarchical: {
			direction: 'LR', // Left to right
		},
	},
	edges: {
		arrows: 'to',
	},
};

const container = document.getElementById('network');
const network = new Network(container, data, options);

// Add nodes
nodes.add([
	{ id: 1, label: 'Node 1' },
	{ id: 2, label: 'Node 2' },
	{ id: 3, label: 'Node 3' },
]);

// Add edges
edges.add([
	{ from: 1, to: 2, label: 'Edge 1' },
	{ from: 2, to: 3, label: 'Edge 2' },
]);
