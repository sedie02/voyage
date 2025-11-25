Sprint 2--------------------------

US40: Trip Success Melding
User Story: Als reiziger wil ik een duidelijke melding zien ("Trip succesvol aangemaakt"), zodat ik weet dat mijn invoer bewaard is.

Test Scenarios
Scenario 1: Successvolle trip aanmaak
Given: de gebruiker heeft een geldige trip ingevuld
When: de gebruiker klikt op "Trip aanmaken"
Then: verschijnt er een melding "Trip succesvol aangemaakt"
And: de melding verdwijnt na enkele seconden
And: de gebruiker wordt doorgestuurd naar de tripdetailpagina

Scenario 2: Mislukte trip aanmaak
Given: de gebruiker heeft een ongeldige trip ingevuld
When: de gebruiker klikt op "Trip aanmaken"
Then: verschijnt er een foutmelding
And: de melding kan handmatig gesloten worden

Test Files
Unit: Toast.spec.tsx - Test toast component gedrag
E2E: newTripToast.e2e.ts - Test volledige gebruiker flow
Integration: NewTripPage.spec.tsx - Test formulier + toast integratie

---

US39: Formulier Validatie
User Story: Als reiziger wil ik voorkomen dat ik een onvolledig of ongeldig formulier kan indienen, zodat ik mijn trip alleen kan opslaan als alle gegevens correct zijn ingevuld.

Test Scenarios
Scenario 1: Step 1 Validatie - Reis Type
Given: gebruiker is op stap 1 van het formulier
When: geen reis type is geselecteerd
Then: "Volgende" knop is disabled
When: 1 reis type is geselecteerd
Then: "Volgende" knop is enabled
When: 3 reis types worden geselecteerd
Then: toon waarschuwing "Maximaal 2 reis soorten"

Scenario 2: Step 2 Validatie - Bestemming
Given: gebruiker is op stap 2 van het formulier
When: bestemming veld is leeg
Then: "Volgende" knop is disabled
When: geldige bestemming is ingevuld
Then: "Volgende" knop is enabled

Scenario 3: Step 3 Validatie - Datums
Given: gebruiker is op stap 3 van het formulier
When: startdatum niet is geselecteerd
Then: einddatum is disabled
When: startdatum na einddatum
Then: "Volgende" knop is disabled
When: geldige datums zijn geselecteerd
Then: "Volgende" knop is enabled

Scenario 4: Step 4 Validatie - Budget
Given: gebruiker is op stap 4 van het formulier
When: budget is 0 of negatief
Then: "Trip Aanmaken" knop is disabled
When: budget is een positief getal
Then: "Trip Aanmaken" knop is enabled

Scenario 5: Volledige Formulier Flow
Given: alle velden zijn correct ingevuld
When: gebruiker klikt "Trip Aanmaken"
Then: formulier wordt succesvol verzonden
And: success melding wordt getoond
And: gebruiker wordt geredirect naar trips overzicht

Test Files
Unit: NewTripFormValidation.spec.tsx - Test individuele validatie regels
Integration: NewTripFormFlow.spec.tsx - Test formulier flow tussen stappen
E2E: newTripValidation.e2e.ts - Test volledige validatie in browser

Test Coverage
✅ Knop status (disabled/enabled) per stap
✅ Real-time validatie feedback
✅ Maximum selectie limieten
✅ Datum validatie logica
✅ Budget numerieke validatie
✅ Cross-step form state behou
✅ Error handling bij failed submission
✅ Success flow met redirect

--

US41: Trip Creation Endpoint
User Story: Als ontwikkelaar wil ik een endpoint hebben om nieuwe trips op te slaan, zodat de frontend veilig gegevens kan verzenden.

Test Scenarios
Scenario 1: Successvolle trip creatie
Given: geldige trip data en geautoriseerde gebruiker
When: POST request naar trip endpoint
Then: trip wordt opgeslagen in database
And: retourneert success response met trip ID
And: cache wordt geïnvalideerd

Scenario 2: Geautoriseerde gebruiker
Given: geauthenticeerde gebruiker
When: trip wordt aangemaakt
Then: trip heeft owner_id van gebruiker
And: geen guest_session_id

Scenario 3: Gast gebruiker
Given: niet-geauthenticeerde gebruiker
When: trip wordt aangemaakt
Then: trip heeft guest_session_id
And: geen owner_id

Scenario 4: Ongeldige data
Given: ontbrekende of invalid velden
When: POST request naar endpoint
Then: retourneert 400/422 error
And: duidelijke foutmelding

Scenario 5: Database fouten
Given: database is unavailable
When: trip creatie poging
Then: retourneert 500 error
And: graceful error handling

Scenario 6: Missing database columns
Given: nieuwe kolommen in schema
When: trip creatie met nieuwe velden
Then: valt terug op basis velden
And: trip wordt toch aangemaakt

Test Files
Unit: tripCreation.spec.ts - Test business logic en validatie
Integration: tripEndpoint.spec.ts - Test complete API flow
E2E: tripApi.e2e.ts - Test werkelijke API calls

Test Coverage
✅ Input validatie (required fields, datums)
✅ Authorization (user vs guest)
✅ Database operaties (insert, error handling)
✅ Error responses (400, 500, etc.)
✅ External service integratie (city photos)
✅ Fallback scenarios (missing DB columns)
✅ Response format consistentie
✅ Cache management

---

Sprint 3 -----------------------------------------------

us48
✅ Scenario 1: Formulier toont bestaande gegevens

Given de gebruiker is eigenaar van een bestaande trip
When de gebruiker de pagina /trips/[id]/edit opent
Then worden de velden titel, bestemming, startdatum en einddatum automatisch ingevuld met de huidige tripgegevens

✅ Scenario 2: Velden kunnen worden gewijzigd

Given de gebruiker bevindt zich op het bewerkformulier
When de gebruiker waarden aanpast in één of meer velden
Then worden deze wijzigingen direct weergegeven in de invoervelden zonder fouten

✅ Scenario 3: Wijzigingen succesvol opslaan

Given een geldige bewerking is uitgevoerd
When de gebruiker op “Wijzigingen Opslaan” klikt
Then wordt updateTrip() aangeroepen met de aangepaste waarden
And verschijnt een succesmelding “Reis succesvol bijgewerkt!”
And na 1.5 seconde wordt de gebruiker doorgestuurd naar /trips/[id]

⚠️ Scenario 4: Opslaan mislukt (foutafhandeling)

Given de updateTrip()-actie gooit een fout (bijv. netwerkfout)
When de gebruiker probeert op te slaan
Then verschijnt een foutmelding “Failed to update trip”
And blijft de gebruiker op de huidige pagina

🚫 Scenario 5: Annuleren via navigatie

Given de gebruiker is in het bewerkformulier
When de gebruiker op “Terug” klikt
Then wordt de gebruiker omgeleid naar de tripdetailpagina /trips/[id]
And worden gemaakte wijzigingen niet opgeslagen

Test files
unit: EditTripClient.test.tsx - Test component rendering, form prefill, input state en validatie
integration: EditTripPage.test.tsx - Test interactie tussen server fetch (supabase.from('trips')) en clientcomponent
e2e: trips-edit.spec.ts - Test volledige gebruikersflow: open bewerkpagina, wijzig velden, sla op, valideer navigatie en UI-feedback

Test Coverage
Form rendering en prefill ✅
Form input bindings en state management ✅
Supabase query en foutafhandeling ✅
Navigatiegedrag (cancel en redirect) ✅
UI feedback (success & error states) ✅

---

US47: Wijzigingen Opslaan

User Story:
Als eigenaar wil ik dat mijn wijzigingen in de tripdetails worden opgeslagen, zodat de data actueel blijft.

Test Scenarios
Scenario 1: Succesvolle update
Given: een geldig bewerkformulier met gewijzigde waarden
When: de gebruiker klikt op “Wijzigingen Opslaan”
Then: de updateTrip-functie wordt aangeroepen met juiste payload
And: er verschijnt een melding “Reis succesvol bijgewerkt!”
And: de gebruiker wordt doorgestuurd naar /trips/[id]

Scenario 2: Backend error
Given: geldige invoer
When: de backend retourneert een fout
Then: de foutmelding “Opslaan mislukt, probeer opnieuw” verschijnt
And: de formulierwaarden blijven behouden

Scenario 3: Validatiebehoud
Given: ongeldige invoer (bv. lege titel)
When: op “Opslaan” geklikt
Then: er wordt geen request verstuurd
And: validatie toont verplicht veldmelding

Test files
unit: EditTripClient.update.test.tsx - Controleren van feedback, state en validatie
integration: updateTripAction.test.ts - Back-end aanroep en foutafhandeling
e2e: trip-update-flow.spec.ts - Gebruikersflow en visuele feedback
