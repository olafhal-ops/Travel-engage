# Travel Engage v3 – Meta/Instagram Ready

## Hva denne versjonen gjør

- Har "Koble til Instagram / Meta".
- OAuth-state lagres i sessionStorage.
- App Secret skal aldri ligge i frontend.
- Discovery webhook er separat fra AI-webhook.
- Discovery-køen rangerer kandidater og viser AI-kommentar.
- Siste publisering er fortsatt en brukerhandling.

## Viktig om Meta

Meta beskriver Instagram API with Facebook Login som løsningen for Instagram Professionals (Business/Creator) som blant annet kan finne hashtagged media og hente metadata/metrics om andre Instagram Business/Creator-kontoer.

Dette betyr at discovery kan bygges rundt offisielle API-kall, men konto, app review, permissions, rate limits og Meta-krav må være konfigurert riktig.

## Meta App

Opprett en Meta/Facebook App av Business-type og sett opp Instagram Graph API / Facebook Login.

Frontend bruker disse scopes:

- pages_show_list
- instagram_basic
- pages_read_engagement
- instagram_manage_comments

Ikke legg App Secret i appen.

## OAuth

Frontend bygger denne authorize-URL-en:

https://www.facebook.com/v23.0/dialog/oauth

Callbacken skal være en n8n webhook eller egen backend. Backend må:

1. validere state
2. motta authorization code
3. exchange code mot access token med App Secret
4. hente Page + linked Instagram Professional Account
5. lagre token sikkert
6. gi PWA-en en session/connected-status

## Discovery

Med Page access token + linked IG account kan n8n discovery-laget bruke Meta Graph API til hashtag discovery.

Normalisert kandidatformat:

{
  "username": "...",
  "url": "https://www.instagram.com/...",
  "caption": "...",
  "media_url": "...",
  "timestamp": "..."
}

Send kandidatene til AI webhook for scoring og kommentar.

## Viktig

Ikke bruk scraping eller automatisert massekommentering. Målet er:

Meta API → discovery → AI → menneskelig godkjenning → Instagram

Det er den mest automatiserte løsningen som fortsatt er bygget rundt offisiell API-bruk og kontrollert publisering.
