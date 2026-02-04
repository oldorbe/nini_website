# Design Guidelines for Artist Portfolio Website

## Responsive Navigation Design

### Three-Stage Navigation Behavior

The navigation bar follows a fluid responsive pattern with three distinct stages:

1. **Wide Screen (> max-width threshold)**
   - Navigation has a maximum width upper limit
   - Centered on the page with generous spacing between heading (logo) and navigation links
   - The gap between heading and nav links is at its maximum

2. **Medium Screen (between max-width and hamburger breakpoint)**
   - Navigation width equals 100% of page width (minus padding)
   - The gap between heading and nav links shrinks proportionally as the viewport narrows
   - Navigation links remain visible

3. **Narrow Screen (< hamburger breakpoint, currently 800px)**
   - Navigation switches to hamburger menu
   - Hamburger button stays fixed at top-right corner using absolute positioning

### Key CSS Implementation

```css
.header {
    max-width: max(900px, 70%);  /* Takes the LARGER of fixed px or percentage */
    /* This ensures:
       - On very wide screens: uses 70% of viewport (scales with screen)
       - On narrower screens: minimum 900px until viewport is smaller
       - Provides fluid spacing between heading and nav */
}
```

### Design Principles

1. **Navigation Width: Dynamic Calculation**
   - Use `max()` function to take the larger of a fixed pixel value and a percentage
   - `max(900px, 70%)` means: at least 900px, OR 70% of viewport if that's larger
   - This provides a minimum comfortable spacing while scaling up on wider screens

2. **Content Width (Thumbnails Container)**
   - Uses percentage-based width (currently 70%)
   - Independent from navigation width
   - Maintains consistent visual proportion

3. **Hamburger Menu Positioning**
   - Uses `position: absolute` with `right: 15px` and `top: 50%; transform: translateY(-50%)`
   - Parent `.header` has `position: relative`
   - Ensures hamburger button stays at top-right corner regardless of content

4. **Font Size Consistency**
   - Navigation link font size remains constant across breakpoints (0.85rem)
   - Only padding adjusts, not typography
   - Maintains readability and visual consistency

## Typography

- **Logo**: Georgia, italic, purple (#8B2252)
- **Navigation Links**: Noto Sans Light (weight 300), 0.85rem
- **Thumbnail Titles**: Noto Sans Light (weight 300)

## Layout Measurements

| Element | Width |
|---------|-------|
| Navigation bar | `max(900px, 70%)` |
| Content area (thumbnails) | 70% |
| Detail page content | 55% (narrower for focus) |

## Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| > 900px | Full navigation visible, max-width applied |
| 800px - 900px | Navigation fluid, approaching hamburger |
| < 800px | Hamburger menu activated |
| < 500px | Single column layout, full-width images |

## Gallery Thumbnails

- Fixed height: 225px
- `object-fit: cover` to maintain aspect ratio
- Flexbox layout with `flex-wrap: wrap` and `align-items: flex-end`
- Variable widths based on original image proportions
