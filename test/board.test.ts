import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { Board } from '../src/board.js';
import { Player } from '../src/player.js';

function tmpfile(contents: string): string {
        const f = path.join(os.tmpdir(), `board-${Math.random().toString(36).slice(2)}.txt`);
        fs.writeFileSync(f, contents);
        return f;
    }

describe('Board Parsing Tests', function () {
    it('parses 3x3 board', async function () {
        const f = tmpfile('3x3\nA\nB\nC\nA\nB\nC\nD\nD\nF\n');
        const b = await Board.parseFromFile(f);
        assert.equal(b.numRows(), 3);
        assert.equal(b.numCols(), 3);
        assert.equal(b.pictureAt(0, 0), 'A');
        assert.equal(b.pictureAt(0, 1), 'B');
        assert.equal(b.pictureAt(0, 2), 'C');
        assert.equal(b.pictureAt(1, 0), 'A');
        assert.equal(b.pictureAt(1, 1), 'B');
        assert.equal(b.pictureAt(1, 2), 'C');
        assert.equal(b.pictureAt(2, 0), 'D');
        assert.equal(b.pictureAt(2, 1), 'D');
        assert.equal(b.pictureAt(2, 2), 'F');
        assert.match(b.picturesDump(), /^3x3\nA\nB\nC\nA\nB\nC\nD\nD\nF\n$/);
    });

    it('rejects bad headers', async function () {
        for (const txt of ['aa\nA\n', '3x\nA\n', 'x3\nA\n', '0x2\nA\nA\n', '-1x2\nA\nA\n']) {
        const f = tmpfile(txt);
        await assert.rejects(Board.parseFromFile(f));
        }
    });

    it('rejects wrong number of cards', async function () {
        const few = tmpfile('2x2\nA\nB\nC\n');
        const many = tmpfile('2x2\nA\nB\nC\nD\nE\n');
        await assert.rejects(Board.parseFromFile(few));
        await assert.rejects(Board.parseFromFile(many));
    });

    it('rejects whitespace/empty card tokens', async function () {
        const withSpace = tmpfile('1x3\nA\n\nB\n');
        const empty = tmpfile('1x1\n\n');
        await assert.rejects(Board.parseFromFile(withSpace));
        await assert.rejects(Board.parseFromFile(empty));
    });

    it('out-of-bounds guards', async function () {
        const f = tmpfile('1x1\nX\n');
        const b = await Board.parseFromFile(f);
        assert.throws(() => b.pictureAt(-1, 0));
        assert.throws(() => b.isFaceUp(0, 1));
        assert.throws(() => b.controllerAt(1, 0));
        assert.throws(() => b.flipUp('nope', 1, 0));
    });
});

describe('Board Parsing Tests', function () {
    it('rejects unknown player flip', async function () {
        const f = tmpfile('1x1\nX\n');
        const b = await Board.parseFromFile(f);
        assert.throws(() => b.flipUp('ghost', 0, 0));
    });

    it('flipUp marks cell face-up and sets controller', async () => {
        const b = await Board.parseFromFile(tmpfile('1x2\nA\nB\n'));
        b.registerPlayer('p', 'Alice');

        assert.equal(b.isFaceUp(0,0), false);
        b.flipUp('p', 0, 0);
        assert.equal(b.isFaceUp(0,0), true);
        assert.equal(b.controllerAt(0,0), 'p');
    });

    it('rejects flipping already face-up cell', async () => {
        const b = await Board.parseFromFile(tmpfile('1x2\nA\nB\n'));
        b.registerPlayer('p','Alice');
        b.flipUp('p',0,0);
        assert.throws(() => b.flipUp('p',0,0));
    });
    it('allows two sequential flips from one player', async () => {
        const b = await Board.parseFromFile(tmpfile('1x2\nA\nA\n'));
        b.registerPlayer('p','Alice');
        b.flipUp('p',0,0);
        b.flipUp('p',0,1);
        assert.equal(b.isFaceUp(0,0), true);
        assert.equal(b.isFaceUp(0,1), true);
    });

});

