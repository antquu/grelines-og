
[![Bannière Grelines](https://image.noelshack.com/fichiers/2026/33/3/1786564741-og-git.png)](https://grelines-og.vercel.app/)

# Grenoble Transport Stop Viewer

A React.js web application for viewing Grenoble public transport stops with real-time departure information using Apple Maps.

## Features

- 🗺️ **Apple Maps integration** with MapKit JS
- 🚌 **Real-time transport stop information**
- 🎯 **Animated sidebar overlay** for stop details
- 📱 **Full-screen map** with overlay sidebar (not beside)
- 🎨 **Transit-inspired UI design** (MBTA style)
- 🚀 **Built with Vite** for fast development
- 🌙 **Dark mode support**
- ⚡ **Responsive design**

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Maps**: Apple MapKit JS
- **Animations**: Framer Motion
- **API Calls**: Axios
- **Font**: Helvetica/System fonts

## Project Structure

```
src/
├── components/          # React components
│   ├── Map.tsx         # Apple Maps component
│   ├── Sidebar.tsx     # Animated overlay sidebar
│   └── index.ts        # Component exports
├── services/           # API services
│   └── api.ts          # MTAG API integration + mock data
├── types/              # TypeScript types
│   └── index.ts        # Type definitions
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles with Tailwind

public/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn

### Installation & Development

1. Dependencies are already installed from initial setup

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

### Build for Production

```bash
npm run build
```

## Apple Maps Configuration

⚠️ **Important**: To use Apple Maps with a real token:

1. Get your MapKit token from [Apple Developer Account](https://developer.apple.com/account/)
2. See [`APPLE_MAPS_SETUP.md`](./APPLE_MAPS_SETUP.md) for detailed instructions

During development without a token, a fallback interface is shown.

## API Integration

The application uses the MTAG (Mobilités Métropolitaines) API:
- **Base URL**: `https://data.mobilites-m.fr/donnees`

Currently using **mock data** for demonstration. To integrate real data:

1. Update API calls in `src/services/api.ts`
2. Replace mock data with real API endpoints
3. Adapt types in `src/types/index.ts` if needed

## Architecture

### Layout Strategy
- **Map**: Full-screen overlay (z-index: 0)
- **Header**: Fixed top-left with drop shadow (z-index: 30)
- **Sidebar**: Animated overlay from left, slides in over map (z-index: 40)
- **Mobile Backdrop**: Darkened overlay when sidebar open (z-index: 20)

This allows the map to always be visible while sidebar details slide over it.

### Features in Detail

#### Interactive Apple Map
- Displays all transport stops in Grenoble
- Yellow markers for regular stops
- Blue marker for selected stop
- Click marker to view stop details
- Responsive to user interaction

#### Stop Details Sidebar
- Slides in from left with smooth animation
- Shows stop name and location
- Lists all lines serving the stop
- Displays next departures with countdown timers
- Real-time status indicators
- Touch-friendly close button

#### Responsive Design
- Mobile-first approach
- Sidebar overlays map on all screen sizes
- Touch-friendly interface
- Dark mode support

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Files to Modify

**To add real API integration:**
- `src/services/api.ts` - Replace mock data with real API calls

**To update map styling:**
- `src/components/Map.tsx` - Adjust map configuration

**To customize sidebar appearance:**
- `src/components/Sidebar.tsx` - Modify styles and layout

**To add new stop information:**
- `src/types/index.ts` - Extend interface definitions

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Apple Maps supported on all modern browsers

## Future Improvements

- [ ] Real MTAG API integration
- [ ] Search functionality for stops
- [ ] Favorites/bookmarks system
- [ ] Route planning between stops
- [ ] Multiple language support
- [ ] Progressive Web App (PWA) features
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Push notifications for departures

## License

MIT License - feel free to use for your projects!

## Support

For issues or questions about Apple Maps, see `APPLE_MAPS_SETUP.md` or visit:
- [Apple MapKit Documentation](https://developer.apple.com/maps/)
- [MTAG API Documentation](https://data.mobilites-m.fr/donnees)

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
