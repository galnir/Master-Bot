import { container } from '@sapphire/framework';
import Logger from '../lib/utils/logger';

export function ErrorListeners() {
  const client = container.client;

  /* Info:
      Winston adds "Error:" to the message so
    
        Logger.error('Command ' + err) 
    
      will output "Command Error: ....." in the log
  */

  // Sapphire Client Errors
  client.on('chatInputCommandError', err => {
    Logger.error('Command Chat Input ' + err);
  });
  client.on('contextMenuCommandError', err => {
    Logger.error('Command Context Menu ' + err);
  });
  client.on('commandAutocompleteInteractionError', err => {
    Logger.error('Command Autocomplete ' + err);
  });
  client.on('commandApplicationCommandRegistryError', err => {
    Logger.error('Command Registry ' + err);
  });
  client.on('messageCommandError', err => {
    Logger.error('Command ' + err);
  });
  client.on('interactionHandlerError', err => {
    Logger.error('Interaction ' + err);
  });
  client.on('interactionHandlerParseError', err => {
    Logger.error('Interaction Parse ' + err);
  });

  client.on('listenerError', err => {
    Logger.error('Client Listener ' + err);
  });

  // LavaLink
  client.music.on('error', err => {
    Logger.error('LavaLink ' + err);
  });
}
