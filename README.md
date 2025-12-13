# B1 AppBuilder - Website to Mobile App Converter

Convert any website into a fully functional iOS and Android mobile app in minutes, without writing a single line of code.

## 🎯 Overview

B1 AppBuilder is a SaaS platform that automates the conversion of websites into native iOS and Android applications. Users input their website URL, customize branding, and receive production-ready APK and IPA files within minutes.

**Key Value Proposition:**
- No coding required
- Fast deployment (5-10 minutes per build)
- Cross-platform support (iOS + Android)
- Automated CI/CD pipeline
- Scalable infrastructure

## ✨ Features

- **Website URL Input** - Simple form to specify website URL
- **Platform Selection** - Choose iOS, Android, or both
- **Branding Customization** - App name, colors, icons, splash screens
- **App Details** - Permissions, features, privacy policy
- **Real-time Build Status** - Live progress tracking during build
- **Download Management** - Direct download links for APK/IPA files
- **tRPC API** - Type-safe backend procedures
- **Build Queue** - Sequential job processing with retry logic
- **GitHub Actions** - Automated Android APK and iOS IPA builds
- **User Authentication** - Manus OAuth integration

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Tailwind CSS |
| Backend | Express, tRPC, Node.js |
| Database | MySQL/TiDB, Drizzle ORM |
| Build System | GitHub Actions, Gradle, Xcode |
| Storage | S3/Railway |
| Auth | Manus OAuth |

### System Flow

```
User Input (Website URL)
    ↓
Frontend Wizard (8 Steps)
    ↓
tRPC API (Backend)
    ↓
Build Worker (Queue Processor)
    ↓
GitHub Actions (CI/CD)
    ↓
APK/IPA Generation
    ↓
S3 Storage
    ↓
Download Links
```

## 🚀 Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm
- Git
- GitHub account

### Installation

```bash
# Clone repository
git clone https://github.com/Habadisrael770/b1-appbuilder.git
cd b1-appbuilder

# Install dependencies
pnpm install

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

## 📊 Database Schema

### Core Tables

**apps** - Application configurations
- id, userId, appName, websiteUrl, platform
- primaryColor, secondaryColor, status
- androidPackageUrl, iosPackageUrl
- createdAt, updatedAt

**builds** - Build job history
- id, appId, jobId, status, progress
- error, androidUrl, iosUrl
- createdAt, updatedAt

## 🔄 Build Pipeline

1. User submits website URL and branding
2. App created and stored in database
3. Build job added to processing queue
4. GitHub Actions workflow triggered
5. Gradle/Xcode builds APK/IPA
6. Artifacts uploaded to S3
7. Database updated with download URLs
8. User receives download links

## 🔐 Security

- OAuth 2.0 authentication
- JWT session tokens
- Input validation with Zod
- User ownership verification
- Protected tRPC procedures
- Bearer token for build callbacks

## 📝 API Endpoints

### Apps Router
- `create` - Create new app
- `list` - Get user's apps
- `getById` - Get specific app
- `update` - Update app details
- `delete` - Delete app

### Builds Router
- `startBuild` - Start new build
- `getBuildStatus` - Check build progress
- `getBuildHistory` - Get build history
- `cancelBuild` - Cancel running build

## 📚 Project Structure

```
b1-appbuilder/
├── client/              # Frontend React app
├── server/              # Backend Express app
├── drizzle/             # Database schema
├── build-templates/     # App templates
├── .github/workflows/   # GitHub Actions
└── package.json
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes and test
4. Commit with clear messages
5. Push and create Pull Request

## 📋 Roadmap

- ✅ Website to app conversion
- ✅ Android APK generation
- ✅ iOS IPA generation
- ✅ Build queue system
- ✅ User authentication
- [ ] App Store integration
- [ ] Play Store integration
- [ ] Push notifications
- [ ] Analytics dashboard

## 🐛 Known Issues

- Build queue is in-memory (lost on restart)
- No horizontal scaling support
- iOS builds require Apple Developer account

## 📞 Support

- GitHub Issues: https://github.com/Habadisrael770/b1-appbuilder/issues
- Documentation: https://docs.b1appbuilder.com

## 📄 License

MIT License

## 👥 Authors

- **Manus AI** - Initial development
- **Gemini AI** - Code review and production fixes

---

**Version:** 1.0.0 | **Status:** Production Ready ✅
