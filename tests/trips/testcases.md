US40: Als reiziger wil ik een duidelijke melding zien (“Trip succesvol aangemaakt”), zodat ik weet dat mijn invoer bewaard is.
Given: de gebruiker heeft een geldige trip ingevuld
When: de gebruiker klikt op "Trip aanmaken"
Then: verschijnt er een melding "Trip succesvol aangemaakt"
And: de melding verdwijnt na enkele seconden
And: de gebruiker wordt doorgestuurd naar de tripdetailpagina

unit: Toast.spec.tsx
e2e: newTripToast.e2e.ts
integration: NewTripPage.spec.tsx
