# Meeting Summary — Elkon Website Review (2026-05-26)

**Attendees:** Brent, Kelly, Jesse, Jocelyn, Kelsey, Keith (presenter)

**Purpose:** First walkthrough of the new Elkon Products website draft. Team gave initial feedback and will take a week to chew on it before sending refined input.

## Key Discussion Points

- **Hero image:** Current stock photo (rebar) needs to be swapped for something more representative — heavy infrastructure (e.g., Calgary Ring Road, bridge interchanges). Team may pull from Graham Construction's site; Keith to source and check usage rights.
- **Products section:** Remove "pelletized material" — Elkon doesn't supply that. They do supply bagged/sacked (11.3 sacks) silica fume.
- **Placeholder text (Lorem Ipsum):** Brent initially mistook it for Spanish — clarified it's filler. Team will draft real copy.
- **Projects section:** Capped at ~5–6 featured projects on the front page, with a separate area for more (à la Graham Construction).
- **Stats/highlights section** (30+ years, certifications, etc.): Well-received. Option to auto-increment year counter.
- **Calculator:** Liked, called out as a differentiator vs. competitors. Will be expanded to cover bulk loads, pallet/sack counts, minimum load sizes.
- **Contact form:**
  - Remove Brent's cell number and direct email from public site (spam risk, especially from overseas).
  - Set up `info@elconproducts.com` shared mailbox routed to Jesse, Jocelyn, Kelsey.
  - Add phone number field to the form.
  - "Same-day delivery" language → change to "Priority delivery available."
  - Route submissions to both email and SharePoint (future state).
  - Text/SMS alerts with summary digests (not per-submission) — geo-locked to Canada to avoid overseas spam triggers.
- **CofA (Certificate of Analysis) downloads:** Need a password-gated area on the site so customers can self-serve quarterly reports.
- **Analytics & SEO:** Keith to set up Google Business listing, optimize for "silica fume" keyword, configure analytics (location, demographics, page engagement). Goal is page 1–2 of Google.
- **Silica Fume Association link:** Keep it — confirmed it's an industry-wide site (not the Ferroglobe/Bécancour link they wanted to drop).
- **AI / operations wish list** (parking lot — not part of website scope): Invoicing automation (BOL scraping via Azure Document Scanner), order intake via website with SMS alerts, inventory/freight tracking, Sage integration. Keith will revisit.

## Action Items

**Keith:**
- [ ] Replace hero image with infrastructure/highway photo (source from Graham Construction or similar, verify rights)
- [x] Remove "pelletized material" from product list
- [x] Remove Brent's direct email from public-facing site (replaced with `info@elkonproducts.com` placeholder — confirm spelling: notes say "elcon" but company is "Elkon")
- [ ] Remove Brent's cell number from public-facing site (current `604-315-3599` is the main company number per prior commit — confirm whether this also needs to go)
- [x] Expand the request information form (currently too condensed); add phone number field (also added Project Location and Preferred Contact Method)
- [x] Change "same-day delivery" → "Priority delivery available" (contact card, meta description, Edmonton project tag)
- [ ] Build out the calculator (bulk loads, pallets, sacks, minimum load size)
- [ ] Add geo-locking to form submissions (Canada only for alerts) — backend work
- [ ] Build a password-protected CofA download area — needs auth backend
- [ ] Set up `info@elconproducts.com` shared mailbox + SharePoint routing — infrastructure (link added to site, but mailbox not yet live)
- [ ] Configure SEO, Google Business listing, analytics
- [ ] Make the site editable (backend login) so the team can update text themselves
- [x] Cap front-page projects at 5–6 with a "more projects" landing area (5 cards on front page + "View All Projects" CTA linking to a placeholder section; full sub-page deferred until team confirms featured projects)

**Also completed (from Key Discussion Points):**
- [x] Auto-increment year counter (Years in Business now computes from `data-founded="1996"` — confirm founding year)
- [x] Replace project copy, intro paragraph, and About blurb with lorem ipsum pending team-drafted copy
- [x] Remove Bécancour/Quebec references; reduce distribution regions from 4 to 3

**Elkon team (by Tuesday 2026-06-02):**
- Jocelyn taking meeting notes / to-do list
- Draft all real copy to replace Lorem Ipsum placeholders
- Verify the calculator math
- Decide on featured projects and source approved photos
- Set up a single email chain with Keith for ongoing feedback
- Confirm which info fields they want on the contact form

**Timeline:** No hard launch deadline — team prefers to get it right. Target mid-June at earliest. Next checkpoint: **Tuesday, 2026-06-02**.
