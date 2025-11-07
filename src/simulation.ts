import assert from 'node:assert';
import { Board } from './board.js';

const TIMESTAMP_START = 11;
const TIMESTAMP_END = 23;
const SEPARATOR_WIDTH = 60;
const CELL_PADDING = 20;
const BOARD_CHECK_INTERVAL = 5;
const BOARD_CHECK_OFFSET = 4;

/**
 * Execute a simulation of Memory Scramble with automated players.
 * This demonstrates the game mechanics with players making random moves.
 * 
 * @throws Error if the board file cannot be loaded or parsed
 */
async function simulationMain(): Promise<void> {
    const filename = 'boards/ab.txt';
    const board: Board = await Board.parseFromFile(filename);
    const players = 3;                 // simulate multi-player
    const triesPerPlayer = 20;         // each player will attempt this many flips
    const maxDelayMs = 5;              // tiny delays to force interleavings
    // Utility to yield control briefly 
    const timeout = (ms: number): Promise<void> => new Promise<void>(res => setTimeout(res, ms));
    // register players
    const ids: string[] = [];
    for (let i = 0; i < players; i++) {
        const id = `playerP${i + 1}`;
        ids.push(id);
        board.registerPlayer(id, `Player ${i + 1}`);
    }
    const rows = board.numRows();
    const cols = board.numCols();
    const rand = (n: number): number => Math.floor(Math.random() * n);
    const randCell = (): { r: number; c: number } => ({ r: rand(rows), c: rand(cols) });
    const delay = (): Promise<void> => timeout(rand(maxDelayMs + 1));
    const colors = {
        reset: '\x1b[0m',
        bright: '\x1b[1m',
        dim: '\x1b[2m',
        cyan: '\x1b[36m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m'
    };
    const playerColors: Record<string, string> = {
        'playerP1': colors.cyan,
        'playerP2': colors.green,
        'playerP3': colors.yellow
    };
    const log = (pid: string, message: string, details?: string): void => {
        const color = playerColors[pid] ?? colors.reset;
        const timestamp = new Date().toISOString().slice(TIMESTAMP_START, TIMESTAMP_END);
        const detailsStr = details ?? '';
        const detailsFormatted = detailsStr.length > 0 ? ` ${colors.dim}${detailsStr}${colors.reset}` : '';
        console.log(`${colors.dim}[${timestamp}]${colors.reset} ${color}${pid}${colors.reset} ${message}${detailsFormatted}`);
    };
    const showBoard = (): void => {
        console.log('\n' + colors.bright + '━'.repeat(SEPARATOR_WIDTH) + colors.reset);
        console.log(colors.bright + 'BOARD STATE:' + colors.reset);
        console.log(colors.bright + '━'.repeat(SEPARATOR_WIDTH) + colors.reset);    
        for (let r = 0; r < rows; r++) {
            let rowStr = '';
            for (let c = 0; c < cols; c++) {
                const pic = board.pictureAt(r, c);
                const isFaceUp = board.isFaceUp(r, c);
                const ctrl = board.controllerAt(r, c);
                
                let cellDisplay = '';
                const picValue = pic ?? null;
                const ctrlValue = ctrl ?? null;
                
                if (picValue === null) {
                    cellDisplay = colors.dim + '[empty]' + colors.reset;
                } else if (!isFaceUp) {
                    cellDisplay = colors.blue + '[down]' + colors.reset;
                } else if (ctrlValue !== null) {
                    const ctrlColor = playerColors[ctrlValue] ?? colors.reset;
                    cellDisplay = ctrlColor + `[${picValue}:${ctrlValue}]` + colors.reset;
                } else {
                    cellDisplay = colors.magenta + `[${picValue}]` + colors.reset;
                }
                
                rowStr += cellDisplay.padEnd(CELL_PADDING);
            }
            console.log(`  ${rowStr}`);
        }
        console.log(colors.bright + '━'.repeat(SEPARATOR_WIDTH) + colors.reset + '\n');
    };
    /**
     * Perform a random first card flip for a player.
     * @param pid - Player ID
     */
    async function doRandomFirstFlip(pid: string): Promise<void> {
        const { r, c } = randCell();
        const pic = board.pictureAt(r, c);
        const picStr = pic ?? 'empty';
        try {
            log(pid, ` Flipping FIRST card at (${r},${c})`, `[${picStr}]`);
            await board.flipUp(pid, r, c);
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            log(pid, ` FIRST card${colors.red} failed${colors.reset} at (${r},${c})`, `[${error}]`);
        }
    }
    /**
     * Perform a random second card flip for a player.
     * @param pid - Player ID
     */
    async function doRandomSecondFlip(pid: string): Promise<void> {
        const { r, c } = randCell();
        const pic = board.pictureAt(r, c);
        const picStr = pic ?? 'empty';
        try {
            log(pid, ` Flipping SECOND card at (${r},${c})`, `[${picStr}]`);
            await board.flipUp(pid, r, c);
        } catch (e) {
            const error = e instanceof Error ? e.message : String(e);
            log(pid, ` SECOND card${colors.red} failed${colors.reset} at (${r},${c})`, `[${error}]`);
        }
    }
    /**
     * Run a player's game loop.
     * @param pid - Player ID
     */
    async function playerTask(pid: string): Promise<void> {
        log(pid, ` Started playing`, `(${triesPerPlayer} rounds)`);
        for (let t = 0; t < triesPerPlayer; t++) {
            await delay();
            await doRandomFirstFlip(pid);
            await delay();
            await doRandomSecondFlip(pid);
            if (t % BOARD_CHECK_INTERVAL === BOARD_CHECK_OFFSET) {
                showBoard();
            }
            await delay();
        }
        // Ensure 3-A/3-B cleanup runs even if the last move ended in a match
        await doRandomFirstFlip(pid);
        log(pid, ` Finished playing`, '');
    }
    console.log('\n' + colors.bright + colors.cyan + '╔═══════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.bright + colors.cyan + '║         MEMORY SCRAMBLE SIMULATION START              ║' + colors.reset);
    console.log(colors.bright + colors.cyan + '╚═══════════════════════════════════════════════════════╝' + colors.reset + '\n');
    console.log(`${colors.bright}Configuration:${colors.reset}`);
    console.log(`  Players: ${players}`);
    console.log(`  Rounds per player: ${triesPerPlayer}`);
    console.log(`  Board: ${filename} (${rows}×${cols})`);
    console.log('');
    showBoard();
    // Run everyone concurrently
    await Promise.all(ids.map(playerTask));
    // Final board for inspection
    console.log('\n' + colors.bright + colors.cyan + '╔═══════════════════════════════════════════════════════╗' + colors.reset);
    console.log(colors.bright + colors.cyan + '║         SIMULATION COMPLETE - FINAL BOARD             ║' + colors.reset);
    console.log(colors.bright + colors.cyan + '╚═══════════════════════════════════════════════════════╝' + colors.reset);
    showBoard();
    // Show player statistics
    console.log(colors.bright + 'Player Statistics:' + colors.reset);
    for (const id of ids) {
        console.log(`  ${playerColors[id]}${id}${colors.reset}: Game completed`);
    }
}


void simulationMain();