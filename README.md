# RJB TRANZ Remittance CRM

A comprehensive multi-platform application for remittance company operations, built with React, Electron, and Capacitor. Supports desktop, web, and mobile platforms with professional CRM features for currency exchange management.

## 🌟 Features

### Core CRM Features
- **Transaction Management**: Create, track, and manage remittance transactions with real-time status updates
- **Client Management**: Maintain client profiles, transaction history, and verification status
- **Invoice System**: Generate and manage invoices with automated workflows
- **Exchange Rates**: Live exchange rate monitoring with alerts and historical data
- **Analytics Dashboard**: Comprehensive business analytics, reporting, and financial insights
- **Receipt Printing**: ESC/POS thermal printer integration for professional receipts

### Multi-Platform Support
- **Desktop Application**: Native desktop experience with Electron (Windows, macOS, Linux)
- **Progressive Web App (PWA)**: Installable web app with offline capabilities
- **Mobile App**: Capacitor-based mobile application for iOS and Android
- **Responsive Web Interface**: Works on all modern browsers and devices

### Advanced Features
- **Real-time Notifications**: Push notifications, email alerts, and system notifications
- **Auto Conversion Widget**: Automatic currency conversion with live rates
- **Rate Alerts**: Customizable alerts for exchange rate changes
- **Session Management**: Auto-logout, sleep mode, and session timeout controls
- **Data Synchronization**: Supabase-powered cloud sync with local offline storage
- **System Settings**: Comprehensive configuration for business preferences
- **Backup & Export**: Automated backups and data export in multiple formats
- **Security**: Encrypted local storage, secure authentication, and privacy controls

### Technical Features
- **Offline Capability**: Full functionality without internet connection
- **Automatic Updates**: Seamless updates for desktop and PWA versions
- **Keyboard Shortcuts**: Comprehensive keyboard navigation
- **Menu Bar Integration**: Native desktop menus and system integration
- **File Operations**: Native file dialogs for import/export
- **Multi-language Support**: Localization and internationalization
- **Theme Customization**: Light/dark themes with system detection

### PWA Features
- **Installable**: Add to home screen on mobile and desktop
- **Offline Mode**: Core functionality works without internet
- **Push Notifications**: Browser-based push notifications
- **Background Sync**: Automatic data synchronization
- **Service Worker**: Caching and offline capabilities
- **App-like Experience**: Native app feel in the browser

### Mobile-Specific Features
- **Touch-Optimized**: Gesture support and mobile-friendly UI
- **Camera Integration**: QR code scanning and photo upload
- **Device Sensors**: Location services and device information
- **Native Sharing**: Share receipts and data via device sharing
- **Biometric Authentication**: Fingerprint/face unlock (platform dependent)

## 🏗️ Architecture

The application is built as a unified codebase that compiles to multiple platforms:

### Core Application
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context
- **Data Layer**: Supabase for cloud, Spark KV for local storage

### Platform Adaptations
- **Web/PWA**: Vite build with service worker
- **Desktop**: Electron wrapper with native APIs
- **Mobile**: Capacitor bridge to native mobile features

### Build System
- **Shared Codebase**: Single source of truth for all platforms
- **Conditional Compilation**: Platform-specific features enabled at build time
- **Unified Development**: Same dev server for all platforms

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- (Optional) Supabase account for cloud features
- (Optional) Capacitor CLI for mobile development

### For Developers

1. **Clone and Install**
   ```bash
   git clone https://github.com/irockymeado-stack/rjb-tranz-remittance.git
   cd rjb-tranz-remittance
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials and other settings
   ```

3. **Development Mode**
   ```bash
   # Web development
   npm run dev

   # Desktop development
   npm run electron-dev

   # Mobile development (requires Capacitor setup)
   npm run mobile-dev
   ```

4. **Build for Production**
   ```bash
   # Web build
   npm run build

   # Desktop builds
   npm run dist          # Current platform
   npm run dist-win      # Windows
   npm run dist-mac      # macOS
   npm run dist-linux    # Linux

   # Mobile builds (requires Capacitor setup)
   npm run mobile-build
   ```

### For End Users

#### Desktop Installation

**Option 1: Download Pre-built Releases**
Download the latest release from the [Releases page](https://github.com/irockymeado-stack/rjb-tranz-remittance/releases):

- **Windows**: Download `.exe` installer or portable version
- **macOS**: Download `.dmg` file
- **Linux**: Download `.AppImage`, `.deb`, or `.rpm` package

**Option 2: Install with Electron Forge (For Developers)**

If you prefer to build from source using Electron Forge:

```bash
# Clone the repository
git clone https://github.com/irockymeado-stack/rjb-tranz-remittance.git
cd rjb-tranz-remittance

# Install dependencies
npm install

# Install Electron Forge globally (optional)
npm install -g @electron-forge/cli

# Build and package the application
npm run make

# Or use Electron Forge directly
npx electron-forge make

# Install locally built package
# Windows: dist/RJB-TRANZ-Setup-1.0.0.exe
# macOS: dist/RJB TRANZ-1.0.0.dmg
# Linux: dist/rjb-tranz_1.0.0_amd64.deb (or .rpm, .AppImage)
```

**Forge Configuration**
The application includes a complete Electron Forge configuration in `package.json`:
- **Makers**: Configured for Windows (Squirrel, NSIS), macOS (DMG, Zip), and Linux (deb, rpm, AppImage)
- **Publishers**: GitHub releases integration for automatic distribution
- **Plugins**: Auto-updater, native modules support, and cross-platform building

#### Web/PWA Installation
1. Visit the deployed web application
2. Click "Install App" in your browser
3. The PWA will install locally with offline capabilities

#### Mobile Installation
Download from app stores or install APK/IPA files from releases.

## 📋 System Requirements

### Desktop Requirements
#### Minimum Requirements
- **OS**: Windows 10+, macOS 10.14+, or Linux (Ubuntu 18.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **Display**: 1024x768 minimum resolution

#### Recommended
- **OS**: Windows 11, macOS 12+, or Linux (Ubuntu 20.04+)
- **RAM**: 8GB or more
- **Storage**: 1GB free space
- **Display**: 1920x1080 or higher

### Mobile Requirements
- **iOS**: 12.0+ with Safari 12+
- **Android**: 8.0+ with Chrome 70+
- **RAM**: 2GB minimum
- **Storage**: 200MB free space

### Web Browser Requirements
- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- (Optional) Supabase CLI for backend development
- (Optional) Capacitor CLI for mobile development

### Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup Supabase (optional)
npm install -g supabase
supabase login
supabase link --project-ref your-project-ref

# Setup Capacitor (optional for mobile)
npm install -g @capacitor/cli
npx cap init
```

### Available Scripts

#### Development
- `npm run dev` - Start web development server
- `npm run electron-dev` - Start Electron in development mode
- `npm run dev-desktop` - Enhanced desktop development script
- `npm run mobile-dev` - Start mobile development server

#### Building
- `npm run build` - Build web application
- `npm run electron-build` - Run built app in Electron
- `npm run dist` - Build desktop installers for current platform
- `npm run dist-win` - Build for Windows
- `npm run dist-mac` - Build for macOS
- `npm run dist-linux` - Build for Linux
- `npm run mobile-build` - Build mobile apps

#### Database & Backend
- `npm run supabase:start` - Start local Supabase instance
- `npm run supabase:stop` - Stop local Supabase instance
- `npm run supabase:reset` - Reset local database

### Supabase Integration
For full cloud features, set up Supabase:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key to `.env`
3. Run database migrations: `supabase db push`
4. See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed instructions

### Mobile Development
For mobile app development:

1. Install Capacitor: `npm install @capacitor/core @capacitor/cli`
2. Add platforms: `npx cap add ios` and/or `npx cap add android`
3. Sync and run: `npx cap sync && npx cap run ios` (or android)
4. See platform-specific documentation for device setup  
- `npm run dist-linux` - Build for Linux

## 🔄 Auto-Updates

The application includes automatic update functionality:

1. **Automatic Checks**: App checks for updates on startup
2. **Background Downloads**: Updates download automatically
3. **User Notification**: Users are notified when updates are ready
4. **One-Click Install**: Simple restart to apply updates

### For Developers
Set up auto-updates by configuring GitHub releases:

1. Set `GH_TOKEN` environment variable
2. Update repository URL in `package.json`
3. Run `npm run dist` to build and publish

## ⌨️ Keyboard Shortcuts

### Navigation
- `Ctrl/Cmd + 1` - Dashboard
- `Ctrl/Cmd + 2` - Transactions  
- `Ctrl/Cmd + 3` - Invoices
- `Ctrl/Cmd + 4` - Countries

### Actions
- `Ctrl/Cmd + N` - New Transaction
- `Ctrl/Cmd + E` - Export Data
- `Ctrl/Cmd + R` - Refresh Data
- `Ctrl/Cmd + ,` - Settings
- `F11` - Toggle Fullscreen

### System
- `Ctrl/Cmd + Q` - Quit Application
- `Ctrl/Cmd + W` - Close Window
- `Ctrl/Cmd + M` - Minimize Window

## 📊 Data Management

### Local Storage
- All data stored locally using encrypted IndexedDB/Spark KV storage
- No internet required for core functionality
- Automatic backup capabilities with configurable intervals

### Cloud Synchronization
- **Supabase Integration**: Real-time data synchronization with PostgreSQL
- **Multi-device Access**: Sync data across desktop, web, and mobile
- **Offline-First**: Works offline with automatic sync when online
- **Conflict Resolution**: Automatic merging of concurrent changes

### Export/Import
- CSV export for transactions, clients, and invoices
- JSON backup format for complete system restoration
- Excel-compatible exports with formatting
- PDF generation for reports and receipts

### Database Schema
The application uses a comprehensive database schema including:
- Users and authentication
- Transactions with status tracking
- Client profiles and history
- Invoices and payments
- Exchange rates and alerts
- System settings and preferences

See [supabase_schema.sql](supabase_schema.sql) for complete schema details.

## 🔒 Security

### Data Protection
- Local data encryption
- Secure context isolation
- No remote code execution

### Privacy
- No telemetry or tracking
- Local-first architecture
- Optional cloud features

## 🎨 Customization

### Themes
- Light and dark themes
- System theme detection
- Customizable color schemes

### Layout
- Responsive design
- Mobile-friendly interface
- Customizable dashboard

## 🐛 Troubleshooting

### Common Issues

**App won't start**
- Check system requirements
- Try running as administrator (Windows)
- Check antivirus software

**Auto-updates not working**
- Check internet connection
- Verify GitHub repository access
- Look for error messages in console

**Print issues**  
- Verify printer connection
- Check printer driver installation
- Test print from other applications

### Getting Help

1. Check the [Issues page](https://github.com/your-username/rjb-tranz-desktop/issues)
2. Review the [Setup Guide](DESKTOP_SETUP.md)
3. Enable debug mode for detailed logs

## 📈 Roadmap

### Current Features (v1.0+)
- ✅ Multi-platform support (Desktop, Web PWA, Mobile)
- ✅ Supabase cloud integration
- ✅ Real-time exchange rates with alerts
- ✅ ESC/POS thermal printer integration
- ✅ Comprehensive analytics dashboard
- ✅ Advanced notification system
- ✅ Auto-conversion and rate monitoring
- ✅ Session management and security features

### Upcoming Features
- [ ] Multi-currency wallet integration
- [ ] Advanced reporting with custom dashboards
- [ ] API integrations for external services
- [ ] Enhanced security with biometric authentication
- [ ] Bulk transaction processing
- [ ] Advanced client segmentation and marketing tools

### Version History
- **v1.0.0** - Multi-platform release with Supabase integration
- **v0.9.0** - Beta release with core CRM features
- **v0.8.0** - Alpha release with desktop and mobile prototypes

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Ensure all tests pass
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow the existing code style and architecture
- Add TypeScript types for new features
- Update documentation for API changes
- Test on multiple platforms when possible
- Use conventional commit messages

### Repository Structure
- `src/` - Main application code
- `electron/` - Desktop-specific code
- `public/` - Static assets
- `scripts/` - Build and development scripts
- `docs/` - Additional documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support:
- **Email**: support@rjbtranz.com
- **Issues**: [GitHub Issues](https://github.com/irockymeado-stack/rjb-tranz-remittance/issues)
- **Documentation**: 
  - [Desktop Setup Guide](DESKTOP_SETUP.md)
  - [Supabase Setup Guide](SUPABASE_SETUP.md)
  - [Electron Integration](electron-integration.md)
  - [Supabase Integration Summary](SUPABASE_INTEGRATION_SUMMARY.md)

## 🙏 Acknowledgments

Built with modern web technologies:
- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [Electron](https://electronjs.org/) - Desktop app framework
- [Capacitor](https://capacitorjs.com/) - Mobile app framework
- [Supabase](https://supabase.com/) - Backend-as-a-Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Radix UI](https://radix-ui.com/) - UI components
- [React Router](https://reactrouter.com/) - Client-side routing
- [React Query](https://tanstack.com/query/) - Data fetching and caching
- [Sonner](https://sonner.emilkowal.ski/) - Toast notifications
- [Phosphor Icons](https://phosphoricons.com/) - Icon library
- [Spark KV](https://spark.kv/) - Local storage solution

---

**RJB TRANZ Remittance CRM** - Professional remittance management across all platforms.