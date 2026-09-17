import * as z from 'zod';

const DateSchema = z
  .object({ _text: z.iso.datetime({ offset: true }) })
  .transform(
    ({ _text }) =>
      `<t:${Math.floor(new Date(_text.trim()).getTime() / 1000)}:f>`,
  );

const LinkSchema = z
  .object({ _attributes: z.object({ href: z.string() }) })
  .transform(({ _attributes }) => _attributes.href);

const TextSchema = z
  .object({ _text: z.string() })
  .transform(({ _text }) => _text.trim());

export const NotificationSchema = z
  .object({
    feed: z.object({
      entry: z
        .object({
          author: z.object({ name: TextSchema }).transform((it) => it.name),
          id: TextSchema,
          link: z.union([
            LinkSchema,
            // NOTE Sometimes the notification contains localized links, let's
            //      test it out and see whether always returning the first one
            //      is good enough.
            z.tuple([LinkSchema], LinkSchema).transform(([it]) => it),
          ]),
          published: DateSchema,
          title: TextSchema,
          updated: DateSchema,
          'yt:channelId': TextSchema,
          'yt:videoId': TextSchema,
        })
        .catchall(TextSchema)
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

export type Notification = z.infer<typeof NotificationSchema>;

const CHANNEL_RE = /^[A-Za-z0-9_-]{24}$/u;

export const SubscriptionsSchema = z.record(
  z.string(),
  z.string().regex(CHANNEL_RE),
);
