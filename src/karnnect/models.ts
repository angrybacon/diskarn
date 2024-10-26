import { z } from 'zod';

const CHANNEL_RE = /^[A-Za-z0-9-]{24}$/;

export const zSubscriptions = z.record(
  z.string(),
  z.string().regex(CHANNEL_RE),
);
