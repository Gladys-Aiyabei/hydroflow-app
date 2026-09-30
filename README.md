# HydroFlow Fleet

Expo (SDK 57) + Expo Router app for water bowser dispatch and delivery tracking, built from the Stitch designs in the parent folder.

## Run

```bash
npm install
npx expo start        # scan the QR code with Expo Go, or press a / i / w
```

All libraries used are included in Expo Go — no development build or API keys needed.

## Screens

| Route | Screen |
| --- | --- |
| `/` | **Dashboard** – depot telemetry, KPIs, fast actions, reservoir gauge, live fleet |
| `/orders` | **Orders** – search, status filters, urgent order, dispatch pipeline, assign bowsers |
| `/tracking` | **Tracking** – animated fleet map, driver card, next drop-off, tank dynamics, navigation |
| `/delivery` | **Delivery** – flow meter log, water quality checks, photo proof (camera), signature sign-off |
| `/new-order` | **New order** modal – customer/site form, category & grade, litre stepper, urgency |

## Structure

```
src/
  app/            routes (Expo Router)
  components/     UI kit, header/logo, bowser card, fleet map, signature pad
  data/           mock data + FleetProvider (shared in-memory state)
  theme/          HydroFlow Modern Industrial design tokens
  utils/          cross-platform helpers
```

Data is mocked in `src/data/mock.ts`; actions (assign bowser, create order, confirm delivery) update shared state in `src/data/store.tsx`. Swap these for API calls when a backend is available.

## Checks

```bash
npx tsc --noEmit
npx expo lint
```
