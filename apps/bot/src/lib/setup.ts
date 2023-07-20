// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import {
	ApplicationCommandRegistries,
	RegisterBehavior
} from '@sapphire/framework';
import '@sapphire/plugin-api/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-subcommands/register';
import * as colorette from 'colorette';
import { inspect } from 'util';

// Set default behavior to bulk overwrite
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.BulkOverwrite
);

// Set default inspection depth
inspect.defaultOptions.depth = 1;

// Enable colorette
colorette.createColors({ useColor: true });
