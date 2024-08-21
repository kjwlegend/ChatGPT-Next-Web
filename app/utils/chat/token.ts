/**
 * Estimate the number of tokens in a given input string based on a more precise tokenization logic.
 * @param input The input string to estimate token length for.
 * @returns The estimated token length.
 */
export function estimateTokenLength(input: string): number {
	let tokenLength = 0;
	let i = 0;

	while (i < input.length) {
		const charCode = input.charCodeAt(i);

		if (charCode < 128) {
			// ASCII character
			tokenLength += 1;
			i += 1;
		} else if (charCode < 2048) {
			// Characters from U+0080 to U+07FF
			tokenLength += 2;
			i += 1;
		} else if (charCode >= 0xd800 && charCode <= 0xdbff) {
			// Surrogate pair (for characters outside BMP)
			tokenLength += 4;
			i += 2;
		} else {
			// Characters from U+0800 to U+FFFF
			tokenLength += 3;
			i += 1;
		}
	}

	return tokenLength;
}
