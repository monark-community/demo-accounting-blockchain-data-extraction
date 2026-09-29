# Assets

## Photography

All photos are from Unsplash under the free [Unsplash License](https://unsplash.com/license); none are Unsplash+ (each was downloaded from `images.unsplash.com` through the photo's free download link). They are resized to 2,000 px on the long edge, compressed, served from `public/images/` with `next/image`, and credited on `/credits`, which the footer links to.

| File | Unsplash page | Photographer | Profile | Used on |
|-|-|-|-|-|
| `public/images/treasurers.jpg` | https://unsplash.com/photos/g1Kr4Ozfoac | Brooke Cagle | https://unsplash.com/@brookecagle | Home, "For whoever keeps the books": DAO and club treasurers; `/credits` |
| `public/images/freelancer.jpg` | https://unsplash.com/photos/n7Cq2rdd73E | charlesdeluvio | https://unsplash.com/@charlesdeluvio | Home, same section: freelancers paid in crypto; `/credits` |
| `public/images/community.jpg` | https://unsplash.com/photos/QiIxg_q2vh0 | Zainul Yasni | https://unsplash.com/@zainulyasni6118 | Home, same section: community projects; `/credits` |

## Monark brand assets

From `lovable-migration/brand-refs/` and the [monark-community/website](https://github.com/monark-community/website) repo, used per `monark-brand-guidelines.md`:

| File | Source | Used for |
|-|-|-|
| `public/brand/monark-mark.svg`, `src/app/icon.svg` | brand-refs `logos/svg/standalone/logo-branded-standalone.svg` | Header brand, favicon, wallet prompt, start screen, Open Graph image |
| `public/brand/monark-horizontal-{light,dark}.svg` | website `public/vectors/brand/horizontal/` | Footer Monark band |
| `public/brand/monark-vertical-{light,dark}.svg` | brand-refs `logos/svg/vertical/` | 404 page |
| `public/brand/monark-mesh.svg` | website `public/vectors/decorative/monark-mesh.svg` | Home hero only (once per site) |
| `public/brand/socials/*.svg` | website `public/vectors/socials/` | Footer social links (recoloured to `foreground` through a CSS mask) |

## Built in code

- The hero "lift" card: a raw transaction and the same transaction as a ledger line (`src/components/home/lift-card.tsx`).
- Feature fragments on the home page (category chips, two linked wallets, export files and seal).
- The five-step pipeline and the "your wallets count as one" line-art diagram on `/how-it-works`.
- Extraction progress, income statement bars and the seal stamp in the app.
- Open Graph image: generated per locale with `next/og` (`src/app/[locale]/opengraph-image.tsx`).
- Wallet avatars: Jazzicons via the `@monark/ui` `wallet` component.
- Icons: [Lucide](https://lucide.dev). Type: Nunito Sans via `next/font/google`.
