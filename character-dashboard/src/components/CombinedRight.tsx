import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwapWidget from "./SwapWidget";
import CharacterFlow from "./CharacterFlow";

interface CharacterFlowProps {
	character: {
		name: string;
		description: string;
		algorandAddress: string;
		asset?: {
			assetId: number;
			name: string;
			unitName: string;
		};
		modelProvider?: string;
		settings?: { voice?: { model: string } };
		clients?: string[];
		topics?: string[];
		knowledge?: string[];
		adjectives?: string[];
	};
}

const CombinedRightPanel = ({ character }: CharacterFlowProps) => {
	return (
		<div className="relative h-full rounded-xl bg-transparent">
			{/* Enhanced backdrop blur container */}
			<div className="absolute inset-0 bg-background/10 backdrop-blur-sm" />

			{/* Content with glass effect */}
			<Card className="relative h-full border-0 bg-transparent">
				<CardContent className="p-4 h-full">
					<Tabs defaultValue="swap" className="h-full">
						{/* Enhanced tabs styling */}
						<TabsList className="grid w-full grid-cols-2 bg-background/20 backdrop-blur-sm rounded-lg border border-white/10">
							<TabsTrigger
								value="swap"
								className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-lg transition-all duration-200"
							>
								Swap
							</TabsTrigger>
							<TabsTrigger
								value="flow"
								className="data-[state=active]:bg-primary/20 data-[state=active]:backdrop-blur-lg transition-all duration-200"
							>
								Character View
							</TabsTrigger>
						</TabsList>

						{/* Swap content with adjusted positioning */}
						<TabsContent
							value="swap"
							className="h-[calc(100%-48px)] mt-4 rounded-lg bg-background/10 backdrop-blur-sm border border-white/10"
						>
							<div className="flex items-start justify-center h-full pt-8">
								<div className="w-full max-w-md px-4">
									<SwapWidget
										defaultTokenInfo={character?.asset ? {
											assetId: character.asset.assetId,
											name: character.asset.name,
											unitName: character.asset.unitName
										} : undefined}
									/>
								</div>
							</div>
						</TabsContent>

						{/* Character flow content */}
						<TabsContent
							value="flow"
							className="h-[calc(100%-48px)] mt-4 relative z-10 rounded-lg bg-background/10 backdrop-blur-sm border border-white/10"
						>
							{character && (
								<div className="h-full overflow-hidden rounded-lg">
									<CharacterFlow character={character} />
								</div>
							)}
						</TabsContent>
					</Tabs>
				</CardContent>
			</Card>
		</div>
	);
};

export default CombinedRightPanel;