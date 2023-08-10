import { initializeNetwork } from './network';
import './style.css';
import { iriIsValid } from './validation';

// (Re)draw network on start button press
document.getElementById('btn_start').addEventListener('click', function () {
	// Get entered value
	const startingResource = document.getElementById('txt_start_resource').value;

	// Initialize network only if given value is valid IRI
	if (iriIsValid(startingResource)) {
		initializeNetwork(startingResource);
	} else {
		alert('Enter a valid IRI!');
	}
});
