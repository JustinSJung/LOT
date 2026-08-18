# LOT

LOTTO AI LAB — Statistical Lottery Intelligence. Full README (features,
methodology, screenshots, roadmap) lands in a later phase; this is a
placeholder covering what exists today.

## Data Source

Draw data (`data/draws.json`) is fetched from a **community-maintained GitHub
Pages mirror**, not the official Dongheng Lottery (dhlottery.co.kr) API
directly:

- Mirror: https://smok95.github.io/lotto/results/all.json
- The official dhlottery.co.kr API blocks requests from this project's
  available environments at the IP/session level (confirmed via diagnostic
  logging in `scripts/fetch-draws.ts`), independent of request headers.
- Because this is an **unofficial third-party mirror**, there is a small
  possibility of transcription errors or lag versus the official result.
  Re-verify against dhlottery.co.kr directly if precision matters.
- The original direct-fetch implementation is preserved (commented out) at
  the bottom of `scripts/fetch-draws.ts` in case official API access becomes
  available later.
