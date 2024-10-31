import { z } from 'zod';

const toDiscordTimestamp = (timestamp: string) =>
  `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:f>`;

const zDate = z
  .object({ _text: z.string().datetime({ offset: true }) })
  .transform((it) => toDiscordTimestamp(it._text.trim()));

const zLink = z
  .object({ _attributes: z.object({ href: z.string() }) })
  .transform((it) => it._attributes.href);

const zText = z
  .object({ _text: z.string() })
  .transform((it) => it._text.trim());

export const zNotification = z
  .object({
    feed: z.object({
      entry: z
        .object({
          author: z.object({ name: zText }).transform((it) => it.name),
          id: zText,
          link: z.union([
            zLink,
            // NOTE Sometimes the notification contains localized links, let's
            //      test it out and see whether returning the first one always
            //      is good enough.
            zLink
              .array()
              .nonempty()
              .transform(([it]) => it),
          ]),
          published: zDate,
          title: zText,
          updated: zDate,
          'yt:channelId': zText,
          'yt:videoId': zText,
        })
        .catchall(zText)
        .transform(
          ({ 'yt:channelId': channelId, 'yt:videoId': videoId, ...it }) => ({
            ...it,
            channelId,
            videoId,
          }),
        ),
    }),
  })
  .transform((it) => it.feed.entry);

export type Notification = z.infer<typeof zNotification>;

const CHANNEL_RE = /^[A-Za-z0-9_-]{24}$/;

export const zSubscriptions = z.record(
  z.string(),
  z.string().regex(CHANNEL_RE),
);
