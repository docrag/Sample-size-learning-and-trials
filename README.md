# Study design & sample size — a four-page site

```
index.html            Home
observational.html    Cross-sectional · case–control · cohort · implementation
trials.html           Parallel · cluster · stepped wedge · crossover · adaptive
toolkit.html          The pitfall lab — every explorer in one place
assets/site.css       One stylesheet
assets/core.js        Statistics, tabs, explorer framework, author block
assets/explorers.js   The fourteen interactive explorers
```

Keep the folder structure. Open `index.html` to run it locally; upload the whole folder to host it.

## What changed from the two standalone files

**One site, shared assets.** Four pages under a common masthead with Home / Observational / Trials / Pitfall lab. Theme choice persists across pages.

**Each design is a tab.** Observational has seven tabs, trials has nine. Pick a tab and it holds the concept, algebra, assumptions, worked example, calculator, pitfalls and sources for that design alone — nothing else on screen. Deep links work: `trials.html#sw` opens the stepped wedge tab; a section id opens the tab containing it and scrolls to it.

**Fourteen interactive explorers.** This is the substantial addition. Each takes one pitfall, puts it on a slider, and draws what it does to the answer. They live beside the design they belong to and are also gathered in the pitfall lab, grouped by the kind of damage they do.

| Explorer | Shows | Bias or sample size? |
|---|---|---|
| Precision is expensive | The square-root law, in cost | Sample size |
| Clustered sampling / design effect | Effective sample per cluster ceilings at 1/ρ | Sample size |
| Odds ratio vs risk ratio | Where Cornfield's approximation breaks | Interpretation |
| Exposure misclassification | A real effect dragged towards the null | **Bias** |
| Matching costs sample size | Pairs required rising with φ | Sample size |
| Sparse cells | One thin cell setting your whole interval | Sample size |
| Differential attrition | Effects manufactured from nothing | **Bias** |
| Immortal time bias | Protection conjured from bookkeeping | **Bias** |
| ITS pre-period length | Precision of the counterfactual trend | Sample size |
| Stepped wedge: omitted period effects | Secular trend credited to your intervention | **Bias** |
| Stepped wedge: lagged effect | Constant-effect model understating the truth | **Bias** |
| Non-adherence and drop-in | The dilution you must power for | Sample size |
| Non-inferiority margin | What each percentage point of rigour costs | Sample size |
| Repeated interim looks | Type I error at 5, 10, 20 analyses | **Bias** |

The bias/sample-size split is stated on the lab page, because it is the distinction that matters: half of these are cured by recruiting more people and half are not.

**Your identity on every page.** Name, both IIT Bombay affiliations, and linked buttons for ORCID and LinkedIn in a colophon footer that appears on all four pages.

## One thing you must edit

`assets/core.js`, near the top:

```js
var AUTHOR={
  name:"Raghavan Parthasarathy",
  creds:"MBBS",
  roles:["Research Scholar, Koita Centre for Digital Health (KCDH), IIT Bombay",
         "Project Research Scientist, National Disease Modelling Consortium (NDMC), IIT Bombay"],
  orcid:"0000-0001-6173-2238",
  linkedin:"https://www.linkedin.com/in/REPLACE-WITH-YOUR-HANDLE"   // <-- set this
};
```

**I do not have your LinkedIn URL**, so it is a placeholder. Until you replace it the button renders dashed and reads "LinkedIn (set URL)" so it cannot be mistaken for a working link. Everything else in that block is what I had on file from your earlier website notes — correct it if anything has changed. Edit once and it updates all four pages.

## Hosting

**GitHub Pages.** In your repo: Add file → Upload files, drag in `index.html`, the three other pages and the `assets` folder, commit. Live at `yourname.github.io` within a minute. For a custom domain, add `parthasarathyr.com` under Settings → Pages and point a CNAME at it.

Nothing here requires a build step, a server, or any JavaScript beyond what is in the folder. Three Google Fonts load from a CDN and the site degrades gracefully if they are blocked.

## Verification

Every explorer was tested by driving each slider to its minimum, midpoint and maximum on every page, checking that the curve redraws and the readout stays finite. Two returned nothing at impossible parameter combinations — a risk above 100%, an exposure prevalence above 100% — and both now say which slider to move instead of going blank.

The repeated-testing simulation was validated against published values for repeated significance testing at the 5% level: it produces 0.083 at two looks, 0.142 at five, 0.193 at ten and 0.246 at twenty, against published 0.083 / 0.142 / 0.193 / 0.246. My first attempt used a weak random number generator and was systematically high; it now uses a mulberry32 generator with polar-method normals.

The stepped-wedge trend explorer originally had a sign convention that made its own caption wrong. The trend is now defined in the direction the intervention is meant to work, so a positive value unambiguously means the world was already moving your way.

## Still deliberately absent

Prediction model sample size, bioequivalence, phase I and dose-finding, N-of-1, SMART designs beyond a mention, simulation-based power for non-proportional hazards.
