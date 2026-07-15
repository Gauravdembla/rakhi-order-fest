### Changes

1. **Upload the new image** as an optimized WebP CDN asset (`three-rakhis-banner.webp`, compressed to ~100–150 KB), stored at `src/assets/three-rakhis-banner.webp.asset.json`.

2. **`src/pages/Index.tsx`**
   - Import the new asset.
   - Prepend it to the `rakhiImages` array so it appears as the **first** slide in both mobile and desktop carousels.
   - Enable infinite loop on both `<Carousel>` instances by passing `opts={{ loop: true }}` — after the last image, clicking Next wraps to the first (and Prev from the first wraps to the last).

### Not changing
- Existing rakhi images, order of remaining slides, styling, or any other page logic.
