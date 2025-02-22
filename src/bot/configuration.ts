/**
 * List all supported Discord servers.
 * Each server should include a log channel and another channel for the video
 * posts.
 */
export const SERVERS =
  // prettier-ignore
  {
    DOOMSDAY: { logs: '421805356805652481',  videos: '1294230181027909654' },
    KORUMITE: { logs: '1294803194173456496', videos: '1294371636094701670' },
  } as const satisfies Record<string, { logs: string; videos: string }>;
