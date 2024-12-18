import { type SERVERS } from '../bot/configuration';

export const SUBSCRIPTIONS =
  // prettier-ignore
  {
    // Magic: the Gathering
    BOSH_N_ROLL:     'UCbp891F6oKl7YOwi5D2IdzQ',
    DDFT_GUY:        'UCD0Os6qvXicEZl6gJ_xPXGw',
    DOISHY:          'UC_sW93YGx7piZSIRakTnkrA',
    JAMES_KISAU:     'UC9RHzw4K7cJkZMvh8VHOcJw',
    JUDGING_FTW:     'UCXSRAZVZjPSVx5OKLPEeS-Q',
    NEVILSHUTE:      'UC96xkSiGHqjAa_dfnf46NtQ',
    REVENANTKIOKU:   'UCpPzTkbfd1LMdnWihwz2TVA',
    SAWATARIX:       'UCd9ApEL1lSWpgjDqdlpSYlg',
    // Other
    PIRATE_SOFTWARE: 'UCMnULQ6F6kLDAHxofDWIbrw',
    PROTESILAOS:     'UC0uTPqBCFIpZxlz_Lv1tk_g',
    T3DOTGG:         'UCbRP3c757lWg9M-U7TyEkXA',
  } as const satisfies Record<string, string>;

export const CONFIGURATION: {
  filter?: RegExp;
  server: keyof typeof SERVERS;
  subscriptions: string[];
}[] = [
  {
    filter: /[\w-]day|ddft|tainted/i,
    server: 'DOOMSDAY',
    subscriptions: [
      SUBSCRIPTIONS.DDFT_GUY,
      SUBSCRIPTIONS.DOISHY,
      SUBSCRIPTIONS.JAMES_KISAU,
      SUBSCRIPTIONS.NEVILSHUTE,
      SUBSCRIPTIONS.REVENANTKIOKU,
      SUBSCRIPTIONS.SAWATARIX,
    ],
  },
  {
    server: 'KORUMITE',
    subscriptions: Object.values(SUBSCRIPTIONS),
  },
];
