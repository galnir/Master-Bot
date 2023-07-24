import { container } from '@sapphire/framework';

export function errorListeners() {
	const client = container.client;

	/* Info:
      Winston adds "Error:" to the message so
    
        Logger.error('Command ' + err) 
    
      will output "Command Error: ....." in the log
  */

	// Sapphire Client Errors
	client.on('chatInputCommandError', err => {
		console.log('Command Chat Input ' + err);
	});
	client.on('contextMenuCommandError', err => {
		console.log('Command Context Menu ' + err);
	});
	client.on('commandAutocompleteInteractionError', err => {
		console.log('Command Autocomplete ' + err);
	});
	client.on('commandApplicationCommandRegistryError', err => {
		console.log('Command Registry ' + err);
	});
	client.on('messageCommandError', err => {
		console.log('Command ' + err);
	});
	client.on('interactionHandlerError', err => {
		console.log('Interaction ' + err);
	});
	client.on('interactionHandlerParseError', err => {
		console.log('Interaction Parse ' + err);
	});

	client.on('listenerError', err => {
		console.log('Client Listener ' + err);
	});

	// LavaLink
	client.music.on('error', err => {
		console.log('LavaLink ' + err);
	});
}
