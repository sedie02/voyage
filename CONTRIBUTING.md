# 🤝 Contributing to Voyage

Bedankt voor je interesse in Voyage! Dit document beschrijft hoe je kunt bijdragen aan het project.

## 📋 Development Setup

Zie [README.md](README.md#getting-started) voor installatie-instructies.

## 🌿 Git Workflow

### Branching Strategy

```
main
  ↑
develop
  ↑
feature/123-trip-wizard
feature/124-poll-system
```

- **`main`**: Production-ready code (alleen via PR)
- **`develop`**: Integration branch voor features
- **`feature/<issue-nummer-beschrijving>`**: Feature development

### Feature Development

1. **Maak een branch vanaf develop:**

   ```bash
   git checkout develop
   git pull
   git checkout -b feature/123-trip-wizard
   ```

2. **Maak je changes en commit:**

   ```bash
   git add .
   git commit -m "feat: add trip wizard flow"
   ```

3. **Push en maak Pull Request:**
   ```bash
   git push origin feature/123-trip-wizard
   ```

### Commit Message Conventie

We gebruiken [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: Nieuwe feature
- `fix`: Bug fix
- `docs`: Documentatie wijzigingen
- `style`: Code formatting (geen logica wijziging)
- `refactor`: Code refactoring
- `test`: Test toevoegingen/wijzigingen
- `chore`: Build process of auxiliary tools

**Voorbeelden:**

```bash
feat(trips): add trip creation wizard
fix(polls): resolve vote counting bug
docs(readme): update installation instructions
test(api): add tests for trip endpoints
```

## 🔍 Code Review Process

### Pull Request Checklist

Voordat je een PR maakt:

- [ ] Code compileert zonder errors
- [ ] Alle tests passeren (`npm test`)
- [ ] Linting errors zijn opgelost (`npm run lint`)
- [ ] Code is geformatteerd (`npm run format`)
- [ ] Nieuwe features hebben tests
- [ ] README/docs zijn bijgewerkt indien nodig
- [ ] Geen console.logs of debugger statements
- [ ] Environment variables zijn gedocumenteerd in `.env.example`

### PR Template

```markdown
## Beschrijving

[Korte beschrijving van wat deze PR doet]

## Type wijziging

- [ ] Bug fix
- [ ] Nieuwe feature
- [ ] Breaking change
- [ ] Documentatie update

## Gerelateerde Issues

Closes #123

## Testing

[Beschrijf hoe je getest hebt]

## Screenshots (indien van toepassing)

[Voeg screenshots toe]

## Checklist

- [ ] Code compileert
- [ ] Tests toegevoegd/bijgewerkt
- [ ] Linting/formatting ok
- [ ] Docs bijgewerkt
```

### Review Guidelines

Als reviewer:

1. **Functionaliteit**: Werkt de feature zoals bedoeld?
2. **Code kwaliteit**: Is de code leesbaar en onderhoudbaar?
3. **Tests**: Zijn er adequate tests?
4. **Performance**: Geen onnodig zware operaties?
5. **Security**: Geen security risks?
6. **Accessibility**: Voldoet aan WCAG basics?

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test structuur:**

```typescript
describe('TripService', () => {
  it('should create a new trip', async () => {
    // Arrange
    const tripData = { ... };

    // Act
    const result = await createTrip(tripData);

    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(tripData.title);
  });
});
```

### E2E Tests

```bash
# Run E2E tests
npx playwright test

# Run specific test
npx playwright test trips.spec.ts

# Debug mode
npx playwright test --debug
```

## 📝 Code Style

### TypeScript

- Gebruik `interface` voor object shapes, `type` voor unions/intersections
- Altijd expliciete return types voor functions
- Vermijd `any`, gebruik `unknown` indien echt nodig

**Good:**

```typescript
interface Trip {
  id: string;
  title: string;
}

function getTrip(id: string): Promise<Trip> {
  // ...
}
```

**Bad:**

```typescript
function getTrip(id: any) { // ❌ any
  return fetch(...); // ❌ no return type
}
```

### React Components

- Functionele components met hooks
- Props interface bovenaan component
- Default exports voor pages, named voor components

**Good:**

```typescript
interface TripCardProps {
  trip: Trip;
  onSelect: (id: string) => void;
}

export function TripCard({ trip, onSelect }: TripCardProps) {
  return (
    <div onClick={() => onSelect(trip.id)}>
      <h3>{trip.title}</h3>
    </div>
  );
}
```

### CSS/Tailwind

- Gebruik utility classes waar mogelijk
- Extracteer herhaalde patterns naar components
- Gebruik `cn()` utility voor conditional classes

```typescript
import { cn } from '@/lib/utils/cn';

<button
  className={cn(
    'btn btn-primary',
    isLoading && 'opacity-50 cursor-not-allowed'
  )}
>
  Submit
</button>
```

## 🐛 Bug Reports

Bij het melden van bugs, include:

1. **Beschrijving**: Wat ging er mis?
2. **Stappen om te reproduceren**
3. **Verwacht gedrag**
4. **Actueel gedrag**
5. **Screenshots/logs** (indien van toepassing)
6. **Environment**: Browser, OS, versie

## 💡 Feature Requests

Voor nieuwe features:

1. Check of het al in de backlog staat
2. Beschrijf de use case
3. Leg uit waarom dit waardevol is
4. Voorstel voor implementatie (optioneel)

## 📞 Vragen?

- Stel vragen in #voyage Teams kanaal
- Tag @yassine of @sedäle voor urgente zaken
- Check documentatie eerst (README, Wiki, ADRs)

---

**Happy coding! 🚀**
