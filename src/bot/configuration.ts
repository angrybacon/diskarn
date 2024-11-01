export const SERVERS =
  // prettier-ignore
  {
    KORUMITE:  { logs: '1294803194173456496', videos: '1294371636094701670' },
    KORUMITE2: { logs: '1301259145877651528', videos: '1301259200441225216' },
  } as const satisfies Record<string, { logs: string; videos: string }>;
