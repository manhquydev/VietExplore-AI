# Logo Organization Structure

## Current Active Logos (in `/public/`)
These are the **ONLY** logos that should be used in the application:

- `logo-icon.svg` - Bánh chưng icon (green square with yellow center)
- `logo-horizontal.svg` - Bánh chưng horizontal logo with text
- `favicon.svg` - Bánh chưng favicon for browser tabs

## Project Logo Design
**Bánh Chưng Theme** - Vietnamese traditional cake representing cultural heritage:
- Main color: `#16A34A` (green)
- Accent color: `#F59E0B` (yellow/orange for đậu xanh)
- Traditional rope binding pattern
- Minimalist and modern adaptation

## Backup Structure

### `/backup/` - Current Project Versions
- `logo-banhchung-*` - Various versions of the current bánh chưng design
- `favicon-banhchung.svg` - Source favicon

### `/backup/legacy-logos/` - Old Designs (DO NOT USE)
- `favicon-old-pink.svg` - Previous pink lotus design
- `icon-round-old-pink.svg` - Previous round icon
- `icon-192-old.png` - Previous 192px icon

### `/backup/logo-set/` - Design Explorations
- Various logo experiments and alternatives
- For reference only, not for production use

## Usage Guidelines
1. **Always use files from `/public/` root only**
2. **Never copy files from backup to production without proper review**
3. **The current design is bánh chưng (green square) - not lotus (pink)**
4. **When in doubt, refer to this README**

## Component Usage
- `<Logo variant="horizontal" />` → uses `/logo-horizontal.svg`
- `<Logo variant="icon" />` → uses `/logo-icon.svg`
- Admin sidebar → uses `/logo-icon.svg`
- Favicon → uses `/favicon.svg`