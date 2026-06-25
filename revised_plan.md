# Revised Plan - Jebel Jais Clicker Presentation

Date: June 25, 2026

## 1. Executive conclusion

The final consolidated PDF should become the content and design authority for the web presentation.

The PDF contains 19 pages, but pages 4, 5, and 6 are duplicate versions of "Who is Hero?". As requested, only one version will be retained. The resulting Clicker presentation will contain 17 unique slides, including the final Thank You slide.

The existing `index.html` is a useful presentation-engine prototype, but it should not be treated as the final design foundation. Its content, typography, palette, and slide sequence differ significantly from the newer PDF. The best path is to keep the useful navigation concepts, rebuild the slide markup around the PDF, and integrate the interactive ecosystem map directly into the main presentation.

## 2. Source audit

### Final consolidated PDF

- File: `Final Consolidated Jebel Jais Destination Operations Proposal_240626 - Presentation.pdf`
- Created: June 25, 2026
- Format: 1440 x 810 points, 16:9 landscape
- Pages: 19
- Unique presentation slides after duplicate removal: 17
- File size: approximately 95 MB
- Primary embedded fonts: Montserrat and Canva Sans
- The PDF is not tagged, web-optimized, or suitable for direct web delivery.
- Most photographic assets are embedded separately and can be extracted or replaced with original source files.

### Existing web prototype

- `index.html` was last modified on June 24, 2026, before the final PDF.
- It currently contains 16 slides with a substantially different narrative.
- Most CSS and JavaScript are embedded directly inside `index.html`.
- `css/style.css` and `js/main.js` are currently only minimal stubs.
- The visual direction is dark green, gold, and serif-led, while the PDF is earth-toned, photographic, and Montserrat-led.
- The viewport is fixed at `width=1920`, which is not responsive.
- Keyboard and fullscreen controls already exist and can be adapted.
- There is no complete touch/swipe interaction, URL state, print mode, or reduced-motion handling.

### Existing Slide 10 prototype

- `sample-slide-10.html` is the strongest reusable component.
- It already contains a detailed SVG ecosystem map, presentation steps, keyboard handling, and location drill-down states.
- This existing HTML Slide 10 is the intended replacement for PDF page 12, "The Adventure Ecosystem".
- It currently runs inside an iframe and communicates through `postMessage`.
- The production version should remove the current left-side information panel and place the interactive map inside the dedicated map area on PDF page 12.
- It includes development-only editing controls and placeholder image treatments.
- For production, the SVG and interaction logic should be integrated into the main deck rather than kept in an iframe.

## 3. Design dissection

### Visual identity

The PDF uses a restrained, terrain-led visual system:

- Deep umber and charcoal surfaces, approximately `#30291F` and `#232621`
- Warm white text rather than pure white
- Muted stone-grey secondary text
- Gold used sparingly as an accent, not as the dominant brand colour
- Full-bleed Jebel Jais, mountain, desert, hospitality, and adventure photography
- Organic rock-like image masks and layered landscape cut-outs
- Fine horizontal footer rules
- Small operational label and page number in the top-left
- Hero logo consistently anchored in the bottom-right

### Typography

- Primary type is Montserrat, supported by Canva Sans.
- Headlines use thin or regular uppercase lettering with generous scale.
- Emphasis uses bold Montserrat rather than a contrasting serif.
- Body copy is also uppercase in many places.
- The overall effect is modern, direct, and operational rather than editorial-luxury.

Recommendation:

- Use Montserrat as the web presentation's primary font.
- Use Hero's approved web font files if available.
- If Canva Sans cannot be licensed or self-hosted, use Montserrat for all roles with carefully controlled weights.
- Do not retain Playfair Display as the main headline face because it changes the identity of the final PDF.

### Layout patterns

The deck uses four recurring slide modes:

1. Full-bleed cinematic image with large statement
2. Dark photographic background with structured text overlay
3. Image collage using organic terrain masks
4. Flat umber information slide with no dominant image

These patterns create consistency, but the current sequence does not always alternate them effectively. The web version should preserve the same visual language while improving pacing between dense and cinematic slides.

### Design strengths

- Strong sense of place and local authenticity
- Consistent brand positioning
- Premium but not overly decorative
- Photography supports the destination argument
- Clear repeated footer and page structure
- Cohesive colour grading across unrelated images
- Strong opening, anchor, and closing imagery

### Design weaknesses and recommended corrections

| Finding | Risk | Recommendation |
|---|---|---|
| Body text is often very small | Difficult to read in a meeting room | Increase minimum presentation text size and reduce visible copy per click |
| Most copy is uppercase | Slower reading for paragraphs | Keep uppercase for labels and short statements; use sentence case for longer copy |
| Several slides are text-heavy | Presenter and audience compete for the same text | Use progressive builds and show only the current argument |
| Contrast varies over photography | Text can disappear on projectors | Use localised dark overlays behind text, not a uniform heavy filter |
| Slide 13 is a dense text document | It does not behave like a presentation slide | Break its content into 2 or 3 within-slide Clicker states |
| Slide 16 has no supporting imagery | It feels unfinished beside the other ecosystem slides | Add approved RAK coastal photography or a strong coast texture |
| Slide 12 is only a map placeholder | The narrative centrepiece is missing from the PDF | Replace it with the existing interactive SVG ecosystem map |
| Pages 4 to 6 repeat the same material | Unnecessary repetition | Keep one "Who is Hero?" slide only |
| The PDF is approximately 95 MB | Too heavy for reliable browser delivery | Extract, crop, and recompress assets to WebP with JPG fallback |

## 4. Revised slide sequence

The unique 17-slide sequence will be:

| Web slide | PDF source | Title | Recommended Clicker treatment |
|---:|---:|---|---|
| 1 | 1 | Jebel Jais | Preserve the cinematic full-bleed opening. Title and subtitle can enter as one restrained build. |
| 2 | 2 | The Opportunity | Reveal Today, Tomorrow, and Future as three sequential states. |
| 3 | 3 | Why This Matters | Show the central quote first, then reveal the two outcome columns together. Do not reveal every bullet separately. |
| 4 | 4 | Who is Hero? | Keep only this version. Present four placeholder portfolio images using Jebel Jais mountain-shaped masks with a second offset mask at 50% opacity for depth. Reveal the four credentials as one group after the opening statement. |
| 5 | 7 | The Jebel Jais Vision | Use "From beginning" and "To end" as two large presentation beats. |
| 6 | 8 | A Foundation for Growth | Preserve the 2 x 2 image structure. Reveal the top and bottom rows in two steps. |
| 7 | 9 | Immediate Opportunities | Preserve the 2 x 3 collage. Reveal in two grouped rows to keep pace. |
| 8 | 10 | Growing Year-Round Demand | Keep the hospitality image and reveal the audience segments as one grouped list. |
| 9 | 11 | Jebel Jais as the Anchor | Use two statement builds leading directly into the ecosystem map. |
| 10 | 12 | The Adventure Ecosystem | Use the existing HTML Slide 10 interactive map as the replacement for this PDF page. Remove its left-side panel and fit the map into the slide's dedicated content area. |
| 11 | 13 | Desert and Heritage Experiences | Start with the core proposition, then reveal the sanctuary camp and future opportunities. Consider adding desert imagery. |
| 12 | 14 | Wadi Showka | Preserve the image collage and reveal the potential components as one group. |
| 13 | 15 | Defender Experience Centre | Preserve the image collage and reveal the potential components as one group. |
| 14 | 16 | Coastal and Marine Experiences | Add a strong coastal image treatment, then reveal the opportunity list. |
| 15 | 17 | The Impact | Reveal the six outcomes in two grouped sets of three. |
| 16 | 18 | A Shared Vision for Ras Al Khaimah | Reveal the vision first, proposed next steps second, and the closing statement last. |
| 17 | 19 | Thank You | Preserve the full-bleed mountain closing with contact details and logos. |

The Clicker should target approximately 25 to 30 total advances. Every bullet should not become a separate click.

## 5. Clicker interaction model

### Required controls

- Right Arrow, Down Arrow, Page Down, Space, and Enter: advance
- Left Arrow, Up Arrow, Page Up, and Backspace: go back
- Home: first slide
- End: final slide
- Escape: exit fullscreen or return to the opening screen
- Mouse click or presenter clicker: advance
- Optional left and right screen-edge click zones
- Touch swipe left and right for tablets

### Splash-screen presentation mode toggle

Add a clearly labelled toggle to the splash screen so the presenter can test or choose the presentation style before starting.

Recommended label:

**Progressive reveals**

- **On:** Slides use the planned Clicker build steps. Text, images, and grouped content are revealed progressively before moving to the next slide.
- **Off:** All text and images on regular slides are visible immediately. A click or key press moves directly between slides without stopping on internal build steps.
- **Exception:** Slide 10, "The Adventure Ecosystem", remains interactive in both modes. Its map states and location drill-down sequence must continue to respond to the Clicker even when progressive reveals are off.

The selected mode should be visible on the splash screen before the presentation begins. It may be saved in `localStorage` for presenter convenience, but the current selection must always be clear and easy to change.

### Presentation behaviour

- Fullscreen launch from a clean opening screen
- Splash screen includes the Progressive reveals toggle.
- One active slide at a time
- Internal build steps before advancing to the next slide when Progressive reveals is on
- Fully revealed regular slides with direct slide-to-slide navigation when Progressive reveals is off
- Discreet slide counter and progress indicator
- URL hash state, such as `#/10/3`, so a slide and build step can be reopened directly
- State reset when returning to the opening screen
- No accidental text selection while presenting
- Reduced-motion mode when requested by the operating system
- Motion limited to fades, short vertical transitions, line drawing, and map reveals

### Slide 10 behaviour

The production map should use a single keyboard and state system within `index.html`.

PDF page 12 and HTML Slide 10 represent the same presentation slide. The existing interactive map is therefore not an additional slide; it is the completed content for that PDF placeholder.

Slide 10 is exempt from the splash-screen Progressive reveals setting. The map remains interactive and retains its own internal sequence whether the toggle is on or off.

Production layout requirements:

- Remove the full left-side title, description, hint, and legend panel.
- Preserve PDF page 12's title, presentation margins, footer rule, copyright line, and Hero logo.
- Insert the interactive map inside the large dedicated space beneath the slide title and above the footer.
- Scale and reposition the map, nodes, cards, labels, and connection paths to fit that content area without clipping.
- Keep essential location labels within the map itself rather than recreating a separate legend.
- Preserve safe margins for projectors and avoid placing interactive content beneath the global footer or navigation controls.

Recommended map sequence:

1. Resting state with Jebel Jais highlighted
2. Main ecosystem connections appear
3. Coastal Experiences focus
4. Desert Experiences focus
5. Defender Experience focus
6. Wadi Showka focus
7. Return to the complete ecosystem before moving forward

The current map editor, position controls, placeholder labels, and development buttons must not appear in presentation mode.

## 6. Recommended HTML architecture

`index.html` should remain the canonical presentation document, but styles and behaviour should move into maintainable external files.

```text
Jebel-Jais/
|-- index.html
|-- css/
|   |-- tokens.css
|   |-- style.css
|   |-- animations.css
|   `-- print.css
|-- js/
|   |-- main.js
|   `-- ecosystem-map.js
|-- assets/
|   |-- fonts/
|   |-- logos/
|   |-- images/
|   `-- svg/
|       `-- ecosystem-map.svg
`-- revised_plan.md
```

All 17 slide sections should remain in `index.html`. The external files should only hold design tokens, presentation behaviour, map behaviour, and print rules.

### Slide markup

Each slide should use semantic and state-friendly markup:

```html
<section class="slide slide--opportunity" data-slide="2">
  <div class="slide__background"></div>
  <div class="slide__content">
    <div data-step="0">...</div>
    <div data-step="1">...</div>
    <div data-step="2">...</div>
  </div>
</section>
```

The navigation engine should determine whether to advance an internal step or move to the next slide.

It should also read the splash-screen mode:

```js
if (slide.isEcosystemMap) {
  advanceMapState();
} else if (progressiveRevealsEnabled) {
  advanceBuildOrSlide();
} else {
  advanceSlide();
}
```

## 7. Responsive presentation strategy

The stage should use a fixed 16:9 design coordinate system that scales proportionally inside the browser.

- Use `width=device-width, initial-scale=1`.
- Use an aspect-ratio stage rather than a fixed 1920-pixel viewport.
- Scale the full slide with `min(100vw / design-width, 100vh / design-height)`.
- Maintain safe margins for projector overscan.
- Support 1366 x 768, 1440 x 810, 1920 x 1080, and 4K screens.
- Provide a portrait mobile fallback that stacks content for review, while presentation mode remains landscape-first.

## 8. Asset strategy

### Images

- Use clearly identifiable placeholder images throughout the initial HTML build.
- Every placeholder must be easy to replace without changing the slide markup or layout.
- Use stable asset names, data attributes, or CSS custom properties so final photography can be swapped centrally.
- Placeholder compositions should demonstrate the intended crop, colour grade, overlay, and mask behaviour.
- Do not treat images extracted from the PDF as final approved assets unless the user later confirms them.
- Replace placeholders with approved original photography when the final images become available.
- Do not use full-page PDF screenshots as normal slide backgrounds because they are heavy, inaccessible, and cannot adapt responsively.
- Recreate text and layout in HTML/CSS.
- Export photographic assets as WebP with JPG fallback.
- Use responsive sizes rather than loading 4K assets on every device.
- Apply colour grading and local overlays in CSS where possible.

### Logos

- Use clean SVG or transparent PNG versions of the Hero and Jais logos.
- Avoid extracting logos from rendered page screenshots.

### Organic image masks

- Recreate the PDF's rock and terrain cut-outs with reusable SVG masks or CSS `clip-path`.
- Limit the system to 3 or 4 reusable mask shapes so the deck remains cohesive and maintainable.

### "Who is Hero?" image treatment

The four portfolio images on "Who is Hero?" should use a distinctive Jebel Jais mountain treatment:

- Use a simplified Jebel Jais ridge or mountain silhouette as the primary clipping mask for each placeholder image.
- Add a second copy of the mountain silhouette behind or slightly offset from the main image.
- Render the secondary mask at approximately 50% opacity to create depth and a layered mountain effect.
- Keep the secondary layer subtle so portfolio names and descriptions remain legible.
- Use one coherent mountain profile across the four images, with small crop or offset variations to avoid mechanical repetition.
- Build the treatment as a reusable SVG mask or component so replacing a placeholder only requires changing its image source.
- Ensure both layers resize together and preserve their alignment across screen sizes.
- Provide a simple rectangular fallback if SVG masking is unavailable.

Initial placeholder labels:

- Platinum Heritage
- The Dubai Balloon
- Hero Balloon Flights
- Absolute Adventure

### Performance targets

- Initial slide and presentation shell: below 2 MB
- Complete deck: target below 15 MB
- No single image above approximately 1.5 MB
- Lazy-load slides beyond the next two slides
- Preload the current, previous, and next slide assets

## 9. Content recommendations

The final PDF copy should be preserved as the approved source unless content editing is authorised. However, the visible copy should be staged for presentation.

Priority copy improvements, if approval is available:

- Convert long uppercase paragraphs to sentence case.
- Shorten Slide 3 outcome descriptions.
- Reduce Slide 11 to one proposition, one flagship opportunity, and one opportunity list.
- Tighten Slide 16 so the next steps and closing statement are readable from a distance.
- Standardise spelling to the approved regional style, including "centre", "programmes", and "travellers" if British English remains the standard.
- Confirm whether "Al Wadi Desert" and each ecosystem location name match the final approved naming.

## 10. Implementation phases

### Phase 1 - Source preparation

- Confirm the PDF as the source of truth.
- Remove duplicate PDF pages 5 and 6 from the web sequence.
- Create and catalogue replaceable placeholder assets for every photographic position.
- Define stable filenames and replacement notes for each future final image.
- Collect clean logo assets separately; logos should not use photographic placeholders.

### Phase 2 - Presentation shell

- Rebuild `index.html` around 17 semantic slide sections.
- Move CSS and JavaScript into the existing external files.
- Implement slide and internal-step state.
- Add the splash-screen Progressive reveals toggle and presentation-mode state.
- When the toggle is off, immediately apply the fully revealed state to all regular slides.
- Keep Slide 10's interactive map state independent from this toggle.
- Add keyboard, clicker, touch, fullscreen, progress, and URL-hash controls.

### Phase 3 - Design system

- Define the PDF-matched colour tokens.
- Self-host Montserrat or the approved Hero font family.
- Build reusable headline, body, label, footer, overlay, collage, and mask components.
- Build the reusable two-layer Jebel Jais mountain mask for the "Who is Hero?" portfolio images.
- Establish projector-safe type sizes and contrast rules.

### Phase 4 - Slide production

- Recreate slides 1 to 9 from the PDF.
- Integrate the interactive map as slide 10.
- Recreate slides 11 to 17.
- Add progressive builds only where they improve comprehension.

### Phase 5 - Map production

- Remove editor-only controls from the Slide 10 prototype.
- Remove the current left-side panel from the Slide 10 prototype.
- Recompose the SVG map to fit PDF page 12's dedicated map area.
- Move the SVG and JavaScript into the main deck.
- Replace placeholder map-card imagery.
- Test every forward and backward transition at map boundaries.

### Phase 6 - Optimisation and QA

- Compress and resize all images.
- Test presentation controls with a keyboard and USB clicker.
- Test fullscreen behaviour in Chrome, Edge, and Safari.
- Test at common projector and laptop resolutions.
- Verify text contrast and legibility from a distance.
- Test touch/swipe behaviour on a tablet.
- Add and test a print stylesheet.
- Confirm that all 17 slides and internal states work in both directions.

## 11. Acceptance criteria

The implementation will be considered ready when:

- Exactly 17 unique slides are present.
- Only one "Who is Hero?" slide remains.
- The presentation copy and order match the final consolidated PDF.
- The visual system matches the PDF's Montserrat-led earth-tone identity.
- Every slide is readable on a 1080p projector.
- All photographic positions use clearly marked, replaceable placeholders until final images are supplied.
- Replacing a placeholder image does not require restructuring its slide.
- The "Who is Hero?" portfolio images use a Jebel Jais mountain mask with a subtle second layer at approximately 50% opacity.
- The splash screen provides an understandable Progressive reveals toggle.
- With the toggle on, regular slides use their planned internal build steps.
- With the toggle off, all regular-slide text and imagery are visible immediately and navigation moves directly between slides.
- Slide 10 remains interactive in both toggle modes.
- The Clicker can navigate all slides and internal states forward and backward.
- PDF page 12 is represented by HTML Slide 10, not duplicated as a separate slide.
- HTML Slide 10 has no internal left-side panel, and its map fits within PDF page 12's dedicated content area.
- Slide 10 works without an iframe or presentation-breaking focus issues.
- No development controls remain.
- Placeholder imagery remains intentionally until approved final images are supplied.
- The complete deck loads within the agreed performance budget.
- The browser console shows no errors.
- The deck can be printed or exported cleanly.

## 12. Immediate next action

~~The next implementation step should be to inventory and extract the PDF's embedded images, then rebuild the presentation shell in `index.html` using the 17-slide mapping above.~~

**Done.** The presentation shell has been rebuilt in `index.html` around the 17-slide mapping (see section 13). The next action is now **asset replacement and QA**: supply approved photography for the marked placeholder positions, then complete Phase 6 testing.

The legacy deck was preserved as `index.legacy.html`, and `sample-slide-10.html` is retained unchanged as the map source of truth.

## 13. Implementation status — as built (June 25, 2026)

The deck has been rebuilt from the PDF as the content authority. `index.html` is now the canonical 17-slide Clicker presentation.

### Completed

- **Shell & sequence.** 17 semantic `<section class="slide" data-slide="N">` sections matching the section-4 mapping. PDF pages 5–6 (duplicate "Who is Hero?") dropped; page 12 is represented by the interactive HTML map, not a duplicate slide.
- **Design system.** PDF-matched earth-tone tokens (umber `#30291F`, charcoal `#232621`, warm white `#F4EFE6`, stone `#A99E8C`, sparing gold `#C49A5A`). Montserrat is the single type family (uppercase headlines, thin/regular weights). Playfair Display retired. Top-left operational label + page number, footer rule + copyright + logo on every slide.
- **Responsive stage.** Fixed 1440×810 design coordinate system scaled with `min(100vw/1440, 100vh/810)`. Viewport is `width=device-width`. Portrait mobile fallback stacks content for review.
- **Progressive reveals toggle.** On the splash screen, persisted to `localStorage` (`jj-progressive`). On = planned per-slide build steps via `[data-step]`; Off = every regular slide fully revealed with direct slide-to-slide navigation. Slide 10 is exempt and stays interactive in both modes.
- **Clicker model.** Keyboard (arrows, PageUp/Down, Space, Enter, Backspace, Home, End, Esc), mouse/clicker click-to-advance, left-edge click = back, touch swipe, fullscreen launch, progress bar + dots + counter, and URL-hash state (`#/slide/step`) that restores a slide and build step on load.
- **Slide 10 map, inlined.** SVG map + production state machine moved into `index.html` (no iframe, no `postMessage`, no left-side panel). Sequence: resting → main → coastal → desert → defender → wadi → complete ecosystem → advance deck. Driven by the deck's own navigation; node/card/icon clicks still drill in. Map background image and location icons reused from `assets/`.
- **"Who is Hero?" treatment.** Two-layer Jebel Jais mountain `clip-path` mask (front image + offset back layer at 50% opacity) on the four portfolio placeholders.
- **Placeholders.** Every photographic position is a clearly marked, gradient "IMAGE" block with a `data-img`/`data-label` hook, replaceable without changing slide structure.

### Deviation from plan (by request)

- **Map position editor retained.** Section 5 / Phase 5 / acceptance criterion "No development controls remain" called for removing the editor. At the user's request the editor is **kept** so placement can still be eyeballed and verified. It was extracted to `js/ecosystem-editor.js` and only appears on Slide 10 (toggle button top-right). It must be removed (or gated behind a debug flag) before final delivery to satisfy the "no development controls" criterion.

### Remaining / not yet done

- Replace placeholder imagery with approved photography; collect clean SVG/PNG logos.
- Self-host Montserrat (currently Google Fonts CDN) per Phase 3.
- Image compression/optimisation and performance-budget verification (Phase 6).
- Print/export stylesheet (`css/print.css`).
- Optional CSS extraction to `css/tokens.css` / `style.css` / `animations.css` (styles are currently embedded in `index.html`; the map editor is already external).
- Cross-browser, projector-resolution, tablet, and clicker QA; confirm no console errors in-browser.
- Remove the dev editor before final delivery (see deviation above).
