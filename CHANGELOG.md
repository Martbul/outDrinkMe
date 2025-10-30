# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features that have been added

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

---

## [1.0.0] - 2025-01-15

### Added
- Initial release
- User authentication with Clerk
- Drinking tracking system
- Achievement system with 8 badges
- Leaderboard (friends & global)
- Calendar view for tracking history
- User profile management
- Friend system (add, remove, discover)
- Streak tracking
- Weekly stats gadget
- Coefficient calculation system
- Level system based on XP

### Features
- **Authentication**
  - Google Sign-In integration
  - Secure token management
  - Auto-refresh sessions

- **Tracking**
  - Daily drinking log
  - Hold-to-confirm mechanism
  - Real-time streak updates
  - Calendar visualization

- **Social**
  - Friend discovery system
  - Friends leaderboard
  - Global leaderboard
  - User search functionality
  - Friend profiles

- **Gamification**
  - 8 achievement badges
  - Experience points system
  - Level progression (1-20+)
  - Coefficient ranking
  - Weekly competitions

- **Profile**
  - Customizable user profile
  - Statistics dashboard
  - Achievement showcase
  - Account management

### Technical
- React Native with Expo 54
- TypeScript for type safety
- NativeWind for styling
- Expo Router for navigation
- Clerk for authentication
- RESTful API integration

---

## [0.9.0] - 2025-01-10 (Beta)

### Added
- Beta testing release
- Core functionality implementation
- Basic UI/UX design

### Fixed
- Various bugs from alpha testing
- Performance optimizations

---

## [0.5.0] - 2025-01-05 (Alpha)

### Added
- Alpha testing release
- Initial app structure
- Basic authentication flow

---

## How to Update This File

When making changes:

1. **Add to Unreleased section** first
2. **Use proper categories**: Added, Changed, Deprecated, Removed, Fixed, Security
3. **Be specific**: Include ticket numbers if applicable
4. **Format example**:
   ```markdown
   ### Added
   - User profile editing functionality (#123)
   - Dark mode support (#124)
   
   ### Fixed
   - Crash on login with invalid credentials (#125)
   - Calendar not showing correct month (#126)
   ```

5. **When releasing**: Move Unreleased items to a new version section

---

## Version History

- **[1.0.0]** - First production release
- **[0.9.0]** - Beta release
- **[0.5.0]** - Alpha release

[Unreleased]: https://github.com/your-username/outdrinkme/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/outdrinkme/releases/tag/v1.0.0
[0.9.0]: https://github.com/your-username/outdrinkme/releases/tag/v0.9.0
[0.5.0]: https://github.com/your-username/outdrinkme/releases/tag/v0.5.0