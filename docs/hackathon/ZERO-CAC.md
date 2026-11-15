# Zero-CAC growth strategy

## Organic acquisition loop

1. A developer imports public repositories, reviews project descriptions, and creates a portfolio.
2. They publish and share that portfolio with recruiters, clients, peers, or communities.
3. Visitors discover SkillLoop through its embedded “Create your own portfolio” CTA.
4. A genuinely new developer can register; a valid signed referral connects that registration to the source portfolio.
5. The new developer can create and share another portfolio, creating further opportunities for discovery.

The application implements and measures this acquisition mechanism. It is a product-led organic growth hypothesis, not evidence of sustainable zero customer acquisition cost at scale, customer traction, or revenue.

## Attribution and event definitions

- **Portfolio view browser-day:** at most one view event per published portfolio, pseudonymous browser token, and UTC day. Private previews are not instrumented.
- **CTA click browser-day:** at most one recorded click per published portfolio, pseudonymous browser token, and UTC day, subject to the known repeat-click discrepancy below.
- **Unique referred registration:** a newly created account attributed to a valid signed referral cookie within 30 days, when the source portfolio is still published and the new account is not its owner. Existing accounts are excluded; database uniqueness makes conversion writes idempotent.
- **Registration-to-click rate:** referred registrations divided by CTA click browser-days. This is a descriptive ratio, not a same-person cohort conversion rate, and can exceed 100% because its numerator and denominator have different definitions.

Referral attribution is signed with a server-side secret, expires after 30 days, uses an HttpOnly, SameSite=Lax cookie, and uses Secure in production HTTPS. The latest valid CTA replaces prior valid attribution. Invalid, expired, tampered, unpublished-source, and self-referral cases are rejected. Analytics and referral failures are best-effort and do not block normal authentication.

## Paid spend and CAC

The dashboard's “$0 reported” means no paid acquisition spend has been entered. It does not mean hosting, infrastructure, AI, or operating costs are zero. A defensible CAC measure needs a complete, consistently scoped cost ledger and an agreed acquisition window and attribution method; SkillLoop does not currently provide that ledger or claim measured CAC.

## Known limitations

- Views and clicks are pseudonymous browser-days, not verified unique people. Cookie changes, shared devices, multiple browsers, and bots can affect counts.
- Bot filtering is user-agent based.
- Request rate limiting is best-effort and per process, not a global quota across server instances.
- Visitor cookie changes can change deduplication. During controlled staging acceptance, a repeat CTA click increased the count within the same browser session; this remains a known discrepancy for investigation. Referral registration deduplication passed.
- Referred-user portfolio publication outcomes are not tracked.
- Clicks and registrations are not a same-person conversion cohort.
- Analytics storage failures can result in lost events.

## Future measurement

Investigate the repeat-click discrepancy; validate bot filtering and event quality; define privacy-conscious cohort measurement and a complete cost ledger before making scale or CAC claims. Test sharing prompts and referral copy without presenting controlled test activity as customers or commercial traction.
