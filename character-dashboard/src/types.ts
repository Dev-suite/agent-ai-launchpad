// types.ts
export type VoiceModel =
	| "en_US-male-medium"
	| "en_US-female-medium"
	| "en_US-neutral-medium";
export type ModelProvider = "openai" | "anthropic" | "llama_local";
export type ResponseStyle = "balanced" | "concise" | "detailed";

export interface Voice {
	model: VoiceModel;
	speed: number;
	pitch: number;
}

export interface Settings {
	allowMultimodal: boolean;
	memoryEnabled: boolean;
	responseStyle: ResponseStyle;
}

export interface CharacterData {
	name: string;
	description: string;
	background?: string;
	modelProvider?: string;
	twitter_handle?: string;
	traits?: string[];
	voice?: {
		model: string;
		speed?: number;
		pitch?: number;
	};
	settings?: {
		allowMultimodal?: boolean;
		memoryEnabled?: boolean;
		responseStyle?: string;
	};
	asset?: AssetData;
}

export interface Message {
	role: "user" | "assistant";
	content: string;
}

export interface BuildStage {
	stage: string;
	status: "pending" | "running" | "success" | "error";
	logs?: string[];
}

export interface TerminalLog {
	type: "error" | "success" | "input" | "info" | "system";
	content: string;
}
export type CharacterType = "ai_companion" | "influencer" | "game_character";

export interface AssetData {
	assetId: number;
	name: string;
	unitName: string;
	total?: number;
	url?: string;
	txId?: string;
	description?: string;
}

export interface TypeInfo {
	title: string;
	description: string;
	icon: any;
	defaultTraits: string[];
	tokenPrefix: string;
	suggestedFields: {
		name: string;
		label: string;
		type: string;
		options?: string[];
		placeholder?: string;
	}[];
}