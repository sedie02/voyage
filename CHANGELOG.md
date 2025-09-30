# Changelog

All notable changes to the Voyage project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🎯 Sprint 0 (9 sep - 22 sep) - Discover & Prepare

#### Added

- Initial project setup with Next.js 14 and TypeScript
- Supabase database schema design
- PWA configuration (manifest.json, next-pwa)
- Complete project documentation structure
- Development environment setup
  - ESLint + Prettier configuration
  - Tailwind CSS setup
  - Jest + Playwright test configuration
- Database schema with all MVP tables
- Core utilities (date, validation, cn)
- Supabase client configurations (browser & server)
- Deployment guide for Skylabs VM
- API documentation structure
- ADR 001: Tech stack keuze

#### Documentation

- README.md with complete setup instructions
- CONTRIBUTING.md with development workflow
- PROJECT_STRUCTURE.md with folder organization
- API.md with endpoint specifications
- DEPLOYMENT.md for Skylabs VM hosting

---

## Planning

### Sprint 1 (23 sep - 6 okt) - Define & Prepare

- [ ] Persona validation via interviews
- [ ] MoSCoW requirements finalization
- [ ] Product backlog creation
- [ ] User story mapping

### Sprint 2 (7 okt - 20 okt) - Design (concept)

- [ ] Wireframes in Figma
- [ ] Component library design
- [ ] DoD & DoR definition
- [ ] API endpoint design

### Sprint 3 (21 okt - 3 nov) - Design & Tech Setup

- [ ] High-fidelity mockups
- [ ] Supabase project setup
- [ ] CI/CD pipeline
- [ ] PoC API calls (Weather, Maps)

### Sprint 4 (4 nov - 17 nov) - Develop (basis)

- [ ] Trip CRUD functionality
- [ ] Auth & guest mode
- [ ] Trip Dashboard UI
- [ ] Trip Wizard flow

### Sprint 5 (18 nov - 1 dec) - Develop (kernfuncties)

- [ ] Itinerary generator (heuristics)
- [ ] Activity management (edit, reorder)
- [ ] Weather badge integration
- [ ] Polls system (create, vote)

### Sprint 6 (2 dec - 15 dec) - Deliver (groepsfuncties)

- [ ] Packing list (shared, checkable)
- [ ] Budget management (equal split)
- [ ] Share links & invite system
- [ ] PWA installable features

### Sprint 7 (16 dec - 29 dec) - Deliver & Afsluiting

- [ ] User testing with 3-5 groups
- [ ] Bug fixes & polish
- [ ] Performance optimization
- [ ] Accessibility improvements
- [ ] Documentation finalization
- [ ] Final presentation

---

## Version History

### [0.1.0] - 2025-09-30

#### Added

- 🎉 **Initial Release**: Project setup and foundation
- Complete Next.js 14 + TypeScript configuration
- Supabase integration setup
- PWA fundamentals
- Development tooling (linting, formatting, testing)
- Comprehensive documentation

---

**Legend**:

- 🎉 Major feature
- ✨ New feature
- 🐛 Bug fix
- 📝 Documentation
- ♻️ Refactor
- 🔥 Removed
- 🚀 Performance
- ⚡ Improvement

[Unreleased]: https://github.com/voyage/voyage/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/voyage/voyage/releases/tag/v0.1.0
