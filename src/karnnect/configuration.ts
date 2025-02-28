import { type SERVERS } from '../bot/configuration';

/** List the channels available for subscription */
export const SUBSCRIPTIONS =
  // prettier-ignore
  {
    // Magic: the Gathering
    DDFT_GUY:        'UCD0Os6qvXicEZl6gJ_xPXGw',
    DOISHY:          'UC_sW93YGx7piZSIRakTnkrA',
    JAMES_KISAU:     'UC9RHzw4K7cJkZMvh8VHOcJw',
    JUDGING_FTW:     'UCXSRAZVZjPSVx5OKLPEeS-Q',
    NEVILSHUTE:      'UC96xkSiGHqjAa_dfnf46NtQ',
    REVENANTKIOKU:   'UCpPzTkbfd1LMdnWihwz2TVA',
    SAWATARIX:       'UCd9ApEL1lSWpgjDqdlpSYlg',
    SEMIOTICIAN:     'UCZ0ERvBNUhBJ_yx3ewcRGFQ',
    THE_EPIC_STORM:  'UCajJn-d7ngRJwVh1YBmHzzw',
    // Other
    DELBA:           'UCfDr-ppda0G5apw_zxG2ClQ',
    GOPARISM:        'UCCRdRbI93UGW0AZttVH3SbA',
    MATT_POCOCK:     'UCswG6FSbgZjbWtdf_hMLaow',
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
      SUBSCRIPTIONS.SEMIOTICIAN,
      SUBSCRIPTIONS.THE_EPIC_STORM,
    ],
  },
  {
    server: 'KORUMITE',
    subscriptions: [
      SUBSCRIPTIONS.DELBA,
      SUBSCRIPTIONS.GOPARISM,
      SUBSCRIPTIONS.JUDGING_FTW,
      SUBSCRIPTIONS.MATT_POCOCK,
      SUBSCRIPTIONS.PROTESILAOS,
      SUBSCRIPTIONS.T3DOTGG,
    ],
  },
];
