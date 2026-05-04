# zoom-australia-market-entry: Backfill Staging

**Pilot:** 3 of 3
**case_study_id:** `0b0025c5-4748-49ae-b646-8ec8018e67b5`
**Researched by:** Stephen Browne
**last_verified_at:** 2026-05-04

---

## TLDR

- Michael Chetner became Zoom's first ANZ employee in April 2017
- AARNet partnership (since 2014) reached 60+ Australian institutions by end-2017
- 134% revenue growth and 105% customer growth announced December 2017
- Australian customers: REA Group, SEEK, Movember, Western Sydney University
- Zoom Phone launched in Australia July 2019, Zoom Contact Center 2023

## Quick Facts

- Label: ANZ Entry | Value: April 2017 | Icon: Calendar
- Label: First Hire | Value: Michael Chetner | Icon: User
- Label: Channel Partner | Value: AARNet (since 2014) | Icon: Network
- Label: ANZ Revenue Growth | Value: 134% YoY (2017) | Icon: TrendingUp
- Label: ANZ Customer Growth | Value: 105% YoY (2017) | Icon: Users
- Label: Origin | Value: San Jose, USA | Icon: MapPin

## Hero

URL: TBD — please supply a Zoom-AU brand asset, Michael Chetner photo, or Sydney office image. Component renders nothing if `hero_image_url` is null, so this can ship null and be backfilled later.
Alt: TBD
Credit: TBD

## Sources

1. [Zoom Blog — Zoom Announces 134% Revenue Growth in Australia and New Zealand](https://blog.zoom.us/zoom-announces-134-percent-revenue-growth-australia-new-zealand/) - accessed 2026-05-04 - press_release
2. [ITBrief — Video communication service Zoom posts 134% revenue growth in ANZ](https://itbrief.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz) - accessed 2026-05-04 - news
3. [ChannelLife — Zoom posts 134% revenue growth in ANZ](https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz) - accessed 2026-05-04 - news
4. [ChannelLife — Exclusive interview: Targeting the university sector with AARNet and Zoom](https://channellife.com.au/story/exclusive-interview-targeting-university-sector-aarnet-and-zoom) - accessed 2026-05-04 - interview
5. [AARNet — Transforming online collaboration for Australian universities](https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities) - accessed 2026-05-04 - other
6. [AARNet — Zoom Video Communications for Research & Education](https://www.aarnet.edu.au/zoom) - accessed 2026-05-04 - other
7. [Zoom Blog — Zoom To Reach Over 1 Million in Australia Via AARNet](https://blog.zoom.us/zoom-reaches-1-million-australia-via-aarnet/) - accessed 2026-05-04 - press_release
8. [ARN — Zoom A/NZ head Michael Chetner resigns](https://www.arnnet.com.au/article/705793/zoom-anz-head-michael-chetner-resigns/) - accessed 2026-05-04 - news
9. [The Org — Michael Chetner, Head of Australia and Asia Pacific at Zoom](https://theorg.com/org/zoom/org-chart/michael-chetner) - accessed 2026-05-04 - linkedin
10. [ITBrief — Zoom Virtual Agent launch promises big things for ANZ businesses](https://itbrief.com.au/story/zoom-virtual-agent-launch-promises-big-things-for-anz-businesses) - accessed 2026-05-04 - news
11. [Atlassian — Zoom surpasses growth goals with Atlassian cloud products case study](https://www.atlassian.com/customers/zoom) - accessed 2026-05-04 - company_blog

## Quotes

> "They've bundled the value up really nicely. If I was to compare their offering with any other service provider, it's very easy to have the pipes but you need to have relevant applications."
> Attributed to: Michael Chetner, Head of A/NZ, Zoom
> Source: [ChannelLife](https://channellife.com.au/story/exclusive-interview-targeting-university-sector-aarnet-and-zoom)
> Place after section: entry-strategy

> "In today's hyper-connected world, Zoom has cut through the noise, answering the call for simplified communications."
> Attributed to: Michael Chetner, Head of A/NZ, Zoom
> Source: [ChannelLife](https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz)
> Place after section: success-factors

> "Zoom's rapid expansion into the ANZ region has been fuelled by a demand for easy and secure meeting experiences."
> Attributed to: Eric S. Yuan, Founder & CEO, Zoom
> Source: [ChannelLife](https://channellife.com.au/story/video-communication-service-zoom-posts-134-revenue-growth-nz)
> Place after section: key-metrics

> "There has been an amazing turn-around on our functionality requests."
> Attributed to: Geoff Lambert, Western Sydney University
> Source: [AARNet — Transforming online collaboration](https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities)
> Place after section: success-factors

> "Zoom bridges the gap between on-campus and off-campus students for tutorials."
> Attributed to: Troy Down, University of Southern Queensland
> Source: [AARNet — Transforming online collaboration](https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities)
> Place after section: success-factors

> "The reliability and ease of the AARNet Zoom service increased the use of desktop and mobile video conferencing."
> Attributed to: Ben Loveridge, University of Melbourne
> Source: [AARNet — Transforming online collaboration](https://www.aarnet.edu.au/transforming-online-collaboration-for-australian-universities)
> Place after section: success-factors

---

## Notes for review

- **Hero image:** flagged as TBD because I don't have a verified URL for a Zoom-AU brand asset that won't 404. Recommend you supply one of: a Zoom press kit asset, the AARNet partnership signing photo, or a Michael Chetner LinkedIn-permission photo. The page renders gracefully with `hero_image_url = null`.
- **Inline source HTML scrub:** per Phase 2 §2.7 #2, the existing `<p class="text-sm text-muted-foreground mt-4"><em>Sources: …</em></p>` blocks appended to Zoom bodies will be stripped during the apply step (see "## Inline source-block scrub" in this file's apply plan, below).
- 11 sources within the 8-15 range. The Atlassian case study is included as a customer-side artifact.
- 6 quotes (max per spec). Three from inside Zoom (Chetner ×2, Yuan ×1), three from AARNet university customers (Lambert/WSU, Down/USQ, Loveridge/UoM). The customer-side voices are deliberate — they triangulate the story beyond founder narrative and match the actual case study angle (channel-partnership-led market entry).

## Inline source-block scrub (apply step only — not part of upserts above)

When applying this pilot to the database, ALSO run a one-time scrub of the 13 inline source blocks currently embedded in Zoom's `content_bodies.body_text`:

```sql
UPDATE public.content_bodies cb
SET body_text = regexp_replace(
  cb.body_text,
  '<p class="text-sm text-muted-foreground mt-4"><em>Sources:.*?</em></p>',
  '',
  'gi'
)
FROM public.content_sections cs
JOIN public.content_items ci ON cs.content_id = ci.id
WHERE cb.section_id = cs.id
  AND ci.slug = 'zoom-australia-market-entry'
  AND cb.body_text LIKE '%Sources:%';
```

This will be packaged as a separate, reversible-via-restore migration that runs immediately before the source/quote upserts. The structured `case_study_sources` table replaces this inline HTML.
