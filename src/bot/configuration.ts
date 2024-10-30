export const SERVERS = {
  DOOMSDAY: { logs: '1301259145877651528', videos: '1301259200441225216' },
  KORUMITE: { logs: '1294803194173456496', videos: '1294371636094701670' },
} as const satisfies Record<string, { logs: string; videos: string }>;
