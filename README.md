# Sprachzentrum WhatsApp Chatbot

WhatsApp-Chatbot mit Admin-Verwaltungspanel für das Sprachzentrum.

## Features

### Chatbot
- Automatische Antworten auf häufige Fragen (Kurse, Preise, Zeiten, etc.)
- Kursübersicht und Kursanmeldung direkt über WhatsApp
- FAQ-System mit Stichwort-Erkennung
- Begrüßungsnachricht und Hilfe-Menü

### Admin-Verwaltung
- **Dashboard** mit Statistiken (Kontakte, Nachrichten, Anmeldungen)
- **WhatsApp-Verbindung** - QR-Code scannen direkt im Browser
- **Nachrichten** - Alle Konversationen einsehen und direkt antworten
- **Kontakte** - Übersicht aller WhatsApp-Kontakte
- **Kurse** - Kurse erstellen, bearbeiten und verwalten
- **Anmeldungen** - Kursanmeldungen bestätigen oder stornieren
- **FAQ** - Automatische Antworten verwalten
- **Einstellungen** - Bot-Name, Willkommensnachricht, Auto-Reply

## Schnellstart

### Voraussetzungen
- Node.js 18+
- npm

### Installation

```bash
# Abhängigkeiten installieren
npm install

# Konfiguration erstellen
cp .env.example .env
# .env nach Bedarf anpassen

# Starten
npm start
```

### Mit Docker

```bash
docker compose up -d
```

## Verwendung

1. Server starten: `npm start`
2. Admin-Panel öffnen: http://localhost:3000
3. Einloggen (Standard: admin / admin123)
4. Im Menü "WhatsApp" den QR-Code mit dem WhatsApp auf dem Handy scannen
5. Der Bot ist bereit und antwortet automatisch auf Nachrichten

## Projekt-Struktur

```
├── src/
│   ├── index.js              # Haupteinstiegspunkt
│   ├── config.js             # Konfiguration
│   ├── database/
│   │   ├── setup.js          # DB-Initialisierung & Schema
│   │   └── queries.js        # Datenbankabfragen
│   ├── whatsapp/
│   │   ├── client.js         # WhatsApp-Client (whatsapp-web.js)
│   │   └── handler.js        # Nachrichtenverarbeitung & Bot-Logik
│   ├── admin/
│   │   ├── auth.js           # Authentifizierung
│   │   └── routes.js         # Admin-API-Routen
│   └── public/               # Admin-Dashboard (Frontend)
│       ├── index.html
│       ├── login.html
│       ├── css/style.css
│       └── js/app.js
├── data/                     # SQLite-Datenbank
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Bot-Befehle (WhatsApp)

| Befehl | Beschreibung |
|--------|-------------|
| hallo / hi | Begrüßung + Menü |
| hilfe | Alle Optionen anzeigen |
| kurse | Kursinformationen |
| kursübersicht | Detaillierte Kursliste |
| anmelden [Kurs] | Für einen Kurs anmelden |
| preise | Preisinformationen |
| zeiten | Kurszeiten |
| einstufung | Einstufungstest |
| kontakt | Kontaktdaten |
| standort | Standort |

## Umgebungsvariablen

| Variable | Standard | Beschreibung |
|----------|----------|-------------|
| PORT | 3000 | Server-Port |
| SESSION_SECRET | - | Session-Verschlüsselung |
| ADMIN_USER | admin | Admin-Benutzername |
| ADMIN_PASS | admin123 | Admin-Passwort |
| BOT_NAME | Sprachzentrum Bot | Bot-Name |
| WELCOME_MESSAGE | - | Begrüßungstext |
