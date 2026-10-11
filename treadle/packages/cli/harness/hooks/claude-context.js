#!/usr/bin/env node
/** Claude uses the same documented stdin and additionalContext envelope. */
import { runEvent } from './codex-context.js';
const event = process.argv[process.argv.indexOf('--event') + 1];
await runEvent('claude', event);
