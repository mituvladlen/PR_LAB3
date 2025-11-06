import { Board } from './board.js';

/**
 * Render the current board state as a textual representation from a player's perspective.
 * 
 * @param board the game board to render
 * @param playerId identifier of the player viewing the board
 * @returns string representation of the board state, with newline-separated rows
 */
function render(board: Board, playerId: string): string {
    const rows = board.numRows(), cols = board.numCols();
    const lines: string[] = [`${rows}x${cols}`];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const pic = board.pictureAt(r, c);
            if (pic === null) {
            lines.push('none');
            } else if (!board.isFaceUp(r, c)) {
                lines.push('down');
            } else {
                const ctrl = board.controllerAt(r, c); // playerId or null
                lines.push(`${ctrl === playerId ? 'my' : 'up'} ${pic}`);
            }
        }
    }
    return lines.join('\n') + '\n';
}

/**
 * Retrieve the current board state as seen by a player.
 * Shows face-up cards with their pictures, face-down cards as 'down', 
 * and empty spaces as 'none'.
 * 
 * @param board the game board to observe
 * @param playerId identifier of the player viewing the board
 * @returns textual representation of the current board state
 * @throws Error when not yet implemented
 */
export async function look(board: Board, playerId: string): Promise<string> {
    board.registerPlayer(playerId);      
    return render(board, playerId);
}

/**
 * Attempt to flip a card face-up for the specified player.
 * May block if another player has control of this card.
 * Card stays face-up under player control until flipped down.
 * 
 * @param board the game board
 * @param playerId identifier of the player attempting the flip
 * @param row the row position of the card (0-indexed)
 * @param column the column position of the card (0-indexed)
 * @returns board state after the flip operation
 * @throws Error if the position is invalid, card already face-up, or cell is empty
 */
export async function flip(board: Board, playerId: string, row: number, column: number): Promise<string> {
    board.registerPlayer(playerId);     
    await board.flipUp(playerId, row, column); 
    return render(board, playerId);
}


/**
 * Transform all card pictures on the board using a mapping function.
 * Empty cells remain unchanged.
 * 
 * @param board the game board
 * @param playerId identifier of the player performing the transformation
 * @param f asynchronous transformation function from old picture to new picture
 * @returns board state after applying the transformation
 * @throws Error when not yet implemented
 */
export async function map(board: Board, playerId: string, f: (card: string) => Promise<string>): Promise<string> {
    throw new Error('map function not implemented');
    // implement with glue code only, at most three lines
}

/**
 * Monitor the board until a change occurs.
 * Blocks until another player modifies the board state, then returns the updated state.
 * 
 * @param board the game board to monitor
 * @param playerId identifier of the player watching
 * @returns the updated board state when a change is detected
 * @throws Error when not yet implemented
 */
export async function watch(board: Board, playerId: string): Promise<string> {
    throw new Error('watch function not implemented');
    // implement with glue code only, at most three lines
}
