// services/storage.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import axios from "axios";
import FormData from "form-data";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import algosdk from "algosdk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CharacterStorage {
	constructor() {
		this.db = null;
		this.initialized = false;
		this.initialize();
	}

	async initialize() {
		if (this.initialized) return;

		try {
			// Initialize SQLite database
			this.db = await open({
				filename: path.join(__dirname, "../data/character_storage.db"),
				driver: sqlite3.Database,
			});

			// Create tables if they don't exist
			await this.db.exec(`
                CREATE TABLE IF NOT EXISTS character_storage (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    description TEXT,
                    type TEXT DEFAULT 'ai_character',
                    theme TEXT,
                    goal TEXT,
                    antagonist TEXT,
                    ipfs_hash TEXT,
                    ipfs_url TEXT,
                    algorand_address TEXT,
                    algorand_mnemonic TEXT,
                    local_file_path TEXT,
                    asset_id INTEGER,
                    asset_name TEXT,
                    asset_unit_name TEXT,
                    asset_url TEXT,
                    asset_description TEXT,
                    asset_tx_hash TEXT,
                    twitter_handle TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX IF NOT EXISTS idx_character_name ON character_storage(name);
                CREATE INDEX IF NOT EXISTS idx_asset_id ON character_storage(asset_id);
                CREATE INDEX IF NOT EXISTS idx_character_type ON character_storage(type);
            `);

			this.initialized = true;
		} catch (error) {
			console.error("Storage initialization error:", error);
			throw error;
		}
	}

	async uploadToPinata(characterData) {
		try {
			const formData = new FormData();
			const jsonContent = JSON.stringify(characterData);
			const fileName = `${characterData.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}.json`;

			formData.append("file", Buffer.from(jsonContent), {
				filename: fileName,
				contentType: "application/json",
			});

			const response = await axios.post(
				"https://api.pinata.cloud/pinning/pinFileToIPFS",
				formData,
				{
					headers: {
						"Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
						pinata_api_key: process.env.PINATA_API_KEY,
						pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
					},
				},
			);

			return {
				ipfsHash: response.data.IpfsHash,
				ipfsUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
			};
		} catch (error) {
			console.error("Pinata upload error:", error);
			throw new Error("Failed to upload to Pinata: " + error.message);
		}
	}

	async saveToLocalFile(characterData) {
		try {
			const generatedDir = path.join(process.cwd(), "generated");
			await fs.mkdir(generatedDir, { recursive: true });

			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const sanitizedName = characterData.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "_");
			const filename = `${sanitizedName}_${timestamp}.json`;
			const filePath = path.join(generatedDir, filename);

			await fs.writeFile(
				filePath,
				JSON.stringify(characterData, null, 2),
				"utf8",
			);

			return {
				filename,
				path: filePath,
			};
		} catch (error) {
			console.error("Local file save error:", error);
			throw new Error("Failed to save local file: " + error.message);
		}
	}

	generateAlgorandAccount() {
		const account = algosdk.generateAccount();
		const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
		return {
			address: account.addr,
			mnemonic: mnemonic,
		};
	}

	async storeCharacter(characterData) {
		try {
			await this.initialize();

			// Generate Algorand account
			const account = this.generateAlgorandAccount();

			// Upload to IPFS via Pinata
			const pinataResult = await this.uploadToPinata({
				...characterData,
				algorandAddress: account.address,
			});

			// Save to local file system
			const localFile = await this.saveToLocalFile({
				...characterData,
				algorandAddress: account.address,
				ipfsHash: pinataResult.ipfsHash,
				ipfsUrl: pinataResult.ipfsUrl,
			});

			// Store in SQLite database
			const result = await this.db.run(
				`
                INSERT INTO character_storage (
                    name,
                    description,
                    type,
                    theme,
                    goal,
                    antagonist,
                    ipfs_hash,
                    ipfs_url,
                    algorand_address,
                    algorand_mnemonic,
                    local_file_path,
                    asset_id,
                    asset_name,
                    asset_unit_name,
                    asset_url,
                    asset_description,
                    asset_tx_hash,
                    twitter_handle
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
				[
					characterData.name,
					characterData.description,
					characterData.type || 'ai_character',
					characterData.theme || null,
					characterData.goal || null,
					characterData.antagonist || null,
					pinataResult.ipfsHash,
					pinataResult.ipfsUrl,
					account.address,
					account.mnemonic,
					localFile.path,
					characterData.asset?.assetId || null,
					characterData.asset?.name || null,
					characterData.asset?.unitName || null,
					characterData.asset?.url || null,
					characterData.asset?.description || null,
					characterData.asset?.txId || null,
					characterData.twitter_handle || null,
				],
			);

			return {
				id: result.lastID,
				name: characterData.name,
				description: characterData.description,
				type: characterData.type || 'ai_character',
				theme: characterData.theme,
				goal: characterData.goal,
				antagonist: characterData.antagonist,
				ipfsHash: pinataResult.ipfsHash,
				ipfs_url: pinataResult.ipfsUrl,
				algorand_address: account.address,
				asset_id: characterData.asset?.assetId || null,
				asset_name: characterData.asset?.name || null,
				asset_unit_name: characterData.asset?.unitName || null,
				asset_url: characterData.asset?.url || null,
				twitter_handle: characterData.twitter_handle || null
			};
		} catch (error) {
			console.error("Error storing character:", error);
			throw error;
		}
	}

	async getCharacterByName(name) {
		try {
			await this.initialize();

			console.log("Getting character from database:", name);
			const character = await this.db.get(
				"SELECT * FROM character_storage WHERE name = ?",
				[name],
			);

			if (!character) {
				console.log("No character found with name:", name);
				return null;
			}

			console.log("Found character in database:", {
				id: character.id,
				name: character.name,
				type: character.type
			});

			// Read the local file for full character data
			try {
				const localData = await fs.readFile(character.local_file_path, "utf8");
				const characterData = JSON.parse(localData);

				// Merge database and local file data
				const mergedData = {
					...characterData,
					id: character.id,
					name: character.name,
					type: character.type || 'ai_character',
					description: character.description,
					theme: character.theme,
					goal: character.goal,
					antagonist: character.antagonist,
					ipfsHash: character.ipfs_hash,
					ipfsUrl: character.ipfs_url,
					algorandAddress: character.algorand_address,
					asset: character.asset_id ? {
						assetId: character.asset_id,
						name: character.asset_name,
						unitName: character.asset_unit_name,
						url: character.asset_url,
						description: character.asset_description,
						txId: character.asset_tx_hash,
					} : null,
				};

				console.log("Returning merged character data");
				return mergedData;
			} catch (fileError) {
				console.warn("Could not read local file, returning database data:", fileError);
				// If local file is not available, return database data
				return {
					id: character.id,
					name: character.name,
					type: character.type || 'ai_character',
					description: character.description,
					theme: character.theme,
					goal: character.goal,
					antagonist: character.antagonist,
					ipfsHash: character.ipfs_hash,
					ipfsUrl: character.ipfs_url,
					algorandAddress: character.algorand_address,
					asset: character.asset_id ? {
						assetId: character.asset_id,
						name: character.asset_name,
						unitName: character.asset_unit_name,
						url: character.asset_url,
						description: character.asset_description,
						txId: character.asset_tx_hash,
					} : null,
				};
			}
		} catch (error) {
			console.error("Error getting character:", error);
			throw error;
		}
	}

	async getAllCharacters() {
		try {
			await this.initialize();
			const characters = await this.db.all(`
				SELECT 
					id,
					name,
					description,
					type,
					theme,
					goal,
					antagonist,
					ipfs_url,
					algorand_address,
					asset_id,
					asset_name,
					asset_unit_name,
					asset_url,
					twitter_handle,
					created_at,
					updated_at
				FROM character_storage
				ORDER BY created_at DESC
			`);
			return characters;
		} catch (error) {
			console.error("Error getting all characters:", error);
			throw error;
		}
	}

	async updateCharacter(id, updateData) {
		try {
			await this.initialize();

			// Get existing character
			const existing = await this.db.get(
				"SELECT * FROM character_storage WHERE id = ?",
				[id],
			);

			if (!existing) {
				throw new Error("Character not found");
			}

			// Upload updated data to IPFS
			const pinataResult = await this.uploadToPinata({
				...updateData,
				algorandAddress: existing.algorand_address,
			});

			// Save updated file locally
			const localFile = await this.saveToLocalFile({
				...updateData,
				algorandAddress: existing.algorand_address,
				ipfsHash: pinataResult.ipfsHash,
				ipfsUrl: pinataResult.ipfsUrl,
			});

			// Update database with all fields including asset information
			await this.db.run(
				`
				UPDATE character_storage 
				SET 
					description = ?,
					ipfs_hash = ?,
					ipfs_url = ?,
					local_file_path = ?,
					asset_id = ?,
					asset_name = ?,
					asset_unit_name = ?,
					asset_url = ?,
					asset_description = ?,
					asset_tx_hash = ?,
					twitter_handle = ?,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
				`,
				[
					updateData.description,
					pinataResult.ipfsHash,
					pinataResult.ipfsUrl,
					localFile.path,
					updateData.asset?.assetId || existing.asset_id,
					updateData.asset?.name || existing.asset_name,
					updateData.asset?.unitName || existing.asset_unit_name,
					updateData.asset?.url || existing.asset_url,
					updateData.asset?.description || existing.asset_description,
					updateData.asset?.txId || existing.asset_tx_hash,
					updateData.twitter_handle || existing.twitter_handle,
					id,
				],
			);

			return await this.getCharacterByName(existing.name);
		} catch (error) {
			console.error("Error updating character:", error);
			throw error;
		}
	}

	async deleteCharacter(id) {
		try {
			await this.initialize();

			const character = await this.db.get(
				"SELECT local_file_path FROM character_storage WHERE id = ?",
				[id],
			);

			if (character) {
				// Delete local file
				try {
					await fs.unlink(character.local_file_path);
				} catch (error) {
					console.warn("Error deleting local file:", error);
				}

				// Delete from database
				await this.db.run("DELETE FROM character_storage WHERE id = ?", [id]);
			}

			return { success: true };
		} catch (error) {
			console.error("Error deleting character:", error);
			throw error;
		}
	}

	async close() {
		if (this.db) {
			await this.db.close();
			this.initialized = false;
		}
	}
}

export default CharacterStorage;