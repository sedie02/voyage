# Playwright Test Reports

Hoe je Playwright test runs uitvoert en rapporten genereert.

## Test Scripts

```bash
# Alle E2E tests uitvoeren
npm run test:e2e

# Tests uitvoeren met HTML rapport
npm run test:e2e:report

# Tests in UI mode (interactief)
npm run test:e2e:ui

# Specifieke ISO 25010 tests
npm run test:functional      # Functionaliteit tests
npm run test:performance     # Performance tests
npm run test:compat          # Compatibility tests
npm run test:usability       # Usability tests
npm run test:reliability     # Reliability tests
npm run test:security        # Security tests
npm run test:context         # Context coverage tests
npm run test:infoquality     # Information quality tests
```

## Rapport Genereren

Na het uitvoeren van tests wordt automatisch een HTML rapport gegenereerd in `playwright-report/`.

Open het rapport:

```bash
npx playwright show-report
```

Of open handmatig:

```bash
open playwright-report/index.html  # macOS
xdg-open playwright-report/index.html  # Linux
start playwright-report/index.html  # Windows
```

## Rapport Inhoud

Het HTML rapport bevat:

- Test overzicht (passed/failed/skipped)
- Per test: screenshots bij failures
- Video opnames bij failures
- Trace files voor debugging
- Timing informatie per test
- Browser console logs

## CI/CD Integratie

In CI (GitHub Actions) worden tests uitgevoerd met:

- HTML reporter (voor artefacten)
- GitHub reporter (voor inline comments)
- Screenshots en videos worden bewaard bij failures

## Test Locaties

- **ISO 25010 tests**: `tests/iso25010/*.e2e.ts`
- **Trip tests**: `tests/trips/e2e/*.e2e.ts`
- **Fix tests**: `fix/*.e2e.ts`

## Configuratie

Zie `playwright.config.ts` voor:

- Timeout settings (30s per test)
- Retry logic (2 retries in CI)
- Screenshot/video settings
- Browser configuratie (Chromium)
- Reporter configuratie
