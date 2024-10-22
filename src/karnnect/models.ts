import { z } from 'zod';

const CHANNEL_RE = /^[A-Za-z0-9-]{24}$/;

export const zChannels = z.record(z.string(), z.string().regex(CHANNEL_RE));
