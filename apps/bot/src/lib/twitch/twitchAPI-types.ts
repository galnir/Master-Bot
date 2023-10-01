import type { TwitchAPI } from './twitchAPI';

export interface TwitchToken {
	access_token: string;
	refresh_token?: string;
	expires_in: number;
	scope: string[];
	token_type: string;
}

export interface ClientTwitchExtension {
	api: TwitchAPI;
	auth: TwitchToken;
	notifyList: {
		[key: string]: {
			sendTo: string[];
			logo: string;
			live: boolean;
			messageSent: boolean;
			messageHandler: { [key: string]: string[] };
			userName?: string;
			gameName?: string;
			title?: string;
			boxArt?: string;
			viewers?: number;
		};
	};
}

export interface TwitchUser {
	id: string;
	login: string;
	display_name: string;
	type: string;
	broadcaster_type: string;
	description: string;
	profile_image_url: string;
	offline_image_url: string;
	view_count: number;
	email: string;
	created_at: string;
}

export interface TwitchUsersResponse {
	data: TwitchUser[];
}

export interface TwitchStream {
	id: string;
	user_id: string;
	user_login: string;
	user_name: string;
	game_id: string;
	game_name: string;
	type: string;
	title: string;
	viewer_count: number;
	started_at: string;
	language: string;
	thumbnail_url: string;
	tag_ids: string[];
	is_mature: boolean;
}

export interface TwitchStreamsResponse {
	data: TwitchStream[];
	pagination: {
		cursor?: string;
	};
}

export interface TwitchGame {
	box_art_url: string;
	id: string;
	name: string;
}

export interface TwitchGamesResponse {
	data: TwitchGame[];
	pagination: {
		cursor?: string;
	};
}
