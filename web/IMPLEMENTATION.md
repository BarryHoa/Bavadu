# Next.js Internationalization & Background Settings Implementation

## Features Implemented

### 1. Next-intl Internationalization

- ✅ Configured next-intl for Vietnamese and English support
- ✅ Created middleware for locale routing
- ✅ Added translation files for both languages
- ✅ Updated app structure to support `[locale]` routing
- ✅ Created language switcher component
- ✅ Integrated language switcher into navbar

### 2. Background Settings

- ✅ Created background image selector (bg_1 to bg_8)
- ✅ Added transparency slider control
- ✅ Implemented real-time preview functionality
- ✅ Added localStorage persistence
- ✅ Integrated into settings page

## File Structure

```
web/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx          # Locale-specific layout
│   │   ├── page.tsx            # Home page
│   │   └── workspaces/
│   │       └── settings/
│   │           └── page.tsx    # Settings page with background controls
│   ├── layout.tsx              # Root layout (redirects to /vi)
│   └── page.tsx                # Root page (redirects to default locale)
├── components/
│   ├── background-settings.tsx # Background selection component
│   ├── language-switcher.tsx   # Language switching component
│   └── navbar.tsx             # Updated navbar with language switcher
├── messages/
│   ├── vi.json                # Vietnamese translations
│   └── en.json                # English translations
├── i18n.ts                    # Next-intl configuration
├── middleware.ts              # Locale routing middleware
└── next.config.js             # Updated with next-intl plugin
```

## Usage

### Language Switching

- Navigate to any page and use the language switcher in the navbar
- URLs will automatically update to include locale (e.g., `/vi/settings`, `/en/settings`)

### Background Settings

1. Navigate to `/vi/workspaces/settings` or `/en/workspaces/settings`
2. Use the "Background Settings" section to:
   - Select from 8 available background images (bg_1.jpg to bg_8.jpg)
   - Adjust transparency with the slider (0-100%)
   - Preview changes in real-time
   - Save settings to localStorage

### Background Images Available

- `bg_1.jpg` - Background 1
- `bg_2.jpg` - Background 2
- `bg_3.jpg` - Background 3
- `bg_4.png` - Background 4
- `bg_5.jpg` - Background 5
- `bg_6.jpg` - Background 6
- `bg_7.jpg` - Background 7
- `bg_8.jpg` - Background 8

## Technical Details

### Dependencies Added

- `@heroui/slider` - For transparency control slider

### Key Features

- **Real-time Preview**: Background changes apply immediately
- **Persistence**: Settings saved to localStorage
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Type Safety**: Full TypeScript support

### Background Implementation

- Uses CSS `background-image` with `background-size: cover`
- Creates overlay div for transparency control
- Fixed positioning for consistent background across pages
- Automatic cleanup of overlay elements

## Development

To run the development server:

```bash
cd web
bun run dev
```

The application will be available at:

- Vietnamese: `http://localhost:3000/vi`
- English: `http://localhost:3000/en`
