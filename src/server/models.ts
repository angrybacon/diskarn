import { z } from 'zod';

const toDiscordTimestamp = (timestamp: string) =>
  `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:f>`;

const zDate = z
  .object({ _text: z.string().datetime({ offset: true }) })
  .transform((it) => toDiscordTimestamp(it._text));

const zText = z.object({ _text: z.string() }).transform((it) => it._text);

export const zNotification = z.object({
  feed: z.object({
    entry: z
      .object({
        author: z.object({ name: zText }).transform((it) => it.name),
        link: z
          .object({ _attributes: z.object({ href: z.string() }) })
          .transform((it) => it._attributes.href),
        published: zDate,
        title: zText,
        updated: zDate,
        'yt:channelId': zText,
        'yt:videoId': zText,
      })
      .transform(
        ({ 'yt:channelId': channelId, 'yt:videoId': videoId, ...it }) => ({
          ...it,
          channelId,
          videoId,
        }),
      ),
    title: zText,
  }),
});
