// 类实现
import { TarotCardType } from "../types/TarotCard";

export class TarotCard implements TarotCardType {
	/**
	 * Creates an instance of TarotCard.
	 * @param id - The unique identifier for the tarot card.
	 * @param name - The name of the tarot card.
	 * @param chineseName - The Chinese name of the tarot card.
	 * @param front - The image URL of the front side of the tarot card.
	 * @param meaningPositive - The positive meaning of the tarot card.
	 * @param meaningReversed - The reversed meaning of the tarot card.
	   @param astrologicalCorrespondence
	   @param elementalCorrespondence
	   @param keywords
	   @param summary
	 * @param flipped - Indicates if the card is flipped.
	 * @param isReversed - Indicates if the card is in a reversed position.
	 */
	constructor(
		public id: number | string,
		public name: string,
		public chineseName: string,
		public front: string,
		public meaningPositive: string,
		public meaningReversed: string,
		public astrologicalCorrespondence: string = "",
		public elementalCorrespondence: string = "",
		public keywords: string = "",
		public summary: string = "",
		public flipped: boolean = false,
		public isReversed: boolean = false,
	) {}

	/**
	 * Flips the tarot card to show its reverse side.
	 */
	flip(): void {
		this.flipped = !this.flipped;
		// Optionally, if flipping the card should also determine if it's reversed
		// this.isReversed = !this.isReversed;
	}
}
