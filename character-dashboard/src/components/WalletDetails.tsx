import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlgorand } from "@/components/evm-provider";
import algosdk from "algosdk";

const Wallet = ({ address, label }) => {
	const { algodClient } = useAlgorand();
	const [balance, setBalance] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchBalance = async () => {
			if (!algodClient || !address) return;

			try {
				// In a real app, you would fetch the actual balance
				// For this example, we'll use a mock balance
				const mockBalance = Math.random() * 100;
				setBalance(mockBalance.toFixed(6));
			} catch (error) {
				console.error("Error fetching balance:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBalance();
	}, [algodClient, address]);

	const shortenAddress = (addr) => {
		if (!addr) return "";
		return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-medium">{label}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					<Badge variant="outline" className="font-mono">
						{shortenAddress(address)}
					</Badge>
					<div className="text-sm">
						{isLoading ? (
							<Skeleton className="h-4 w-24" />
						) : balance ? (
							<span>
								{balance} ALGO
							</span>
						) : (
							"0 ALGO"
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
};

const CharacterWallet = ({ characterName }) => {
	const [wallet, setWallet] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchWallet = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/characters/${characterName}/wallet`,
				);
				if (!response.ok) throw new Error("Failed to fetch wallet");
				const data = await response.json();
				setWallet(data.data);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		if (characterName) {
			fetchWallet();
		}
	}, [characterName]);

	if (isLoading) {
		return <Skeleton className="h-[120px] w-full" />;
	}

	if (error) {
		return (
			<div className="text-sm text-destructive">
				Error loading wallet: {error}
			</div>
		);
	}

	return wallet ? (
		<Wallet address={wallet.algorandAddress} label={`${characterName}'s Wallet`} />
	) : null;
};

export { Wallet, CharacterWallet };