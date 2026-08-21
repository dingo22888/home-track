"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type Language = "de" | "en"

const STORAGE_KEY = "hometrack-language"

const de: Record<string, string> = {
  User: "Benutzer",
  Settings: "Einstellungen",
  "Sign out": "Abmelden",
  Close: "Schließen",
  Sidebar: "Seitenleiste",
  "Displays the mobile sidebar.": "Zeigt die mobile Seitenleiste an.",
  "Toggle Sidebar": "Seitenleiste ein-/ausblenden",
  Language: "Sprache",
  German: "Deutsch",
  English: "Englisch",
  Household: "Haushalt",
  Households: "Haushalte",
  Consumers: "Verbraucher",
  Readings: "Ablesungen",
  Navigation: "Navigation",
  Dashboard: "Übersicht",
  "Loading...": "Wird geladen …",
  "No households": "Keine Haushalte",
  "Select household": "Haushalt auswählen",
  "No household selected": "Kein Haushalt ausgewählt",
  "Create your first household to start tracking consumption.": "Erstelle deinen ersten Haushalt, um Verbräuche zu erfassen.",
  "Create household": "Haushalt erstellen",
  "Consumption overview": "Verbrauchsübersicht",
  "Recent usage for each consumer.": "Aktueller Verbrauch je Verbraucher.",
  "Active Consumers": "Aktive Verbraucher",
  "Tracked in this household": "In diesem Haushalt erfasst",
  "Latest Readings": "Letzte Ablesungen",
  "Consumers with readings": "Verbraucher mit Ablesungen",
  Coverage: "Abdeckung",
  "Consumers with at least one reading": "Verbraucher mit mindestens einer Ablesung",
  Consumer: "Verbraucher",
  Type: "Typ",
  Value: "Wert",
  Date: "Datum",
  Notes: "Notizen",
  Unit: "Einheit",
  Location: "Ort",
  Status: "Status",
  Active: "Aktiv",
  Inactive: "Inaktiv",
  Name: "Name",
  Electricity: "Strom",
  Gas: "Gas",
  Water: "Wasser",
  Custom: "Benutzerdefiniert",
  electricity: "Strom",
  gas: "Gas",
  water: "Wasser",
  custom: "Benutzerdefiniert",
  owner: "Eigentümer",
  admin: "Administrator",
  member: "Mitglied",
  "No readings yet. Add your first reading to get started.": "Noch keine Ablesungen vorhanden. Füge die erste Ablesung hinzu.",
  "Meters and consumers in {name}": "Zähler und Verbraucher in {name}",
  "Add consumer": "Verbraucher hinzufügen",
  "No consumers yet": "Noch keine Verbraucher",
  "Add your first meter or consumer to start tracking.": "Füge den ersten Zähler oder Verbraucher hinzu.",
  "Add a new meter or consumer to track.": "Füge einen neuen Zähler oder Verbraucher zur Erfassung hinzu.",
  "e.g. Kitchen Electricity Meter": "z. B. Stromzähler Küche",
  "e.g. kWh": "z. B. kWh",
  "Location (optional)": "Ort (optional)",
  "e.g. Basement": "z. B. Keller",
  "Notes (optional)": "Notizen (optional)",
  "Any additional notes...": "Weitere Notizen …",
  "Saving...": "Wird gespeichert …",
  "Consumer created": "Verbraucher erstellt",
  "Consumer not found": "Verbraucher nicht gefunden",
  "Back to consumers": "Zurück zu Verbrauchern",
  Back: "Zurück",
  "Add reading": "Ablesung hinzufügen",
  "Not specified": "Nicht angegeben",
  Consumption: "Verbrauch",
  "Consumption over time": "Verbrauch im Zeitverlauf",
  "Reading History": "Ableseverlauf",
  "No readings yet. Add your first reading.": "Noch keine Ablesungen vorhanden. Füge die erste Ablesung hinzu.",
  "Save reading": "Ablesung speichern",
  "Add a meter reading for this consumer.": "Füge einen Zählerstand für diesen Verbraucher hinzu.",
  "Reading date": "Ablesedatum",
  "Any notes about this reading...": "Notizen zu dieser Ablesung …",
  "Reading saved": "Ablesung gespeichert",
  "All readings for {name}": "Alle Ablesungen für {name}",
  "Filter by consumer": "Nach Verbraucher filtern",
  "All consumers": "Alle Verbraucher",
  "No readings yet": "Noch keine Ablesungen",
  "Add readings from the consumer detail page.": "Füge Ablesungen auf der Detailseite des Verbrauchers hinzu.",
  "Manage your households": "Verwalte deine Haushalte",
  "New household": "Neuer Haushalt",
  "Add a new household to start tracking consumption.": "Füge einen neuen Haushalt hinzu, um Verbräuche zu erfassen.",
  "e.g. Main Apartment": "z. B. Hauptwohnung",
  "Address (optional)": "Adresse (optional)",
  "e.g. 123 Main St": "z. B. Hauptstraße 123",
  "Creating...": "Wird erstellt …",
  Create: "Erstellen",
  "Household created": "Haushalt erstellt",
  "No households yet": "Noch keine Haushalte",
  "Create your first household to get started.": "Erstelle deinen ersten Haushalt, um loszulegen.",
  "Manage your account": "Verwalte dein Konto",
  Profile: "Profil",
  "Update your personal information.": "Aktualisiere deine persönlichen Daten.",
  Email: "E-Mail",
  "Email cannot be changed here.": "Die E-Mail-Adresse kann hier nicht geändert werden.",
  "Display name": "Anzeigename",
  "Your display name": "Dein Anzeigename",
  "Save changes": "Änderungen speichern",
  "Profile updated": "Profil aktualisiert",
  Appearance: "Darstellung",
  "Customize the look of the app.": "Passe das Erscheinungsbild der App an.",
  Theme: "Design",
  System: "System",
  Light: "Hell",
  Dark: "Dunkel",
  Account: "Konto",
  "Manage your session.": "Verwalte deine Sitzung.",
  "Sign in to your account": "Melde dich bei deinem Konto an",
  Password: "Passwort",
  "Your password": "Dein Passwort",
  "Signing in...": "Anmeldung läuft …",
  "Sign in": "Anmelden",
  "Don't have an account? ": "Noch kein Konto? ",
  "Sign up": "Registrieren",
  "Create account": "Konto erstellen",
  "Get started with HomeTrack": "Starte mit HomeTrack",
  "Your name": "Dein Name",
  "At least 6 characters": "Mindestens 6 Zeichen",
  "Creating account...": "Konto wird erstellt …",
  "Already have an account? ": "Du hast bereits ein Konto? ",
  "Authentication error": "Authentifizierungsfehler",
  "Something went wrong during authentication. Please try again.": "Bei der Authentifizierung ist etwas schiefgelaufen. Bitte versuche es erneut.",
  "Back to sign in": "Zurück zur Anmeldung",
  "Check your email": "Prüfe dein E-Mail-Postfach",
  "We sent you a confirmation link. Please check your email to verify your account.": "Wir haben dir einen Bestätigungslink gesendet. Prüfe dein E-Mail-Postfach, um dein Konto zu bestätigen.",
  Day: "Tag",
  Week: "Woche",
  Month: "Monat",
  Year: "Jahr",
  "Consumption interval": "Verbrauchsintervall",
  "Not enough readings for a chart yet.": "Noch nicht genügend Ablesungen für ein Diagramm.",
  "{days} days": "{days} Tage",
  "{days} of {periodDays} days, partial period": "{days} von {periodDays} Tagen, Teilzeitraum",
  ", allocated proportionally": ", zeitanteilig geschätzt",
  "Consumption ({coverage}{estimate})": "Verbrauch ({coverage}{estimate})",
  "Lighter bars contain values allocated proportionally between readings that are farther apart.": "Hellere Balken enthalten zeitanteilig verteilte Werte zwischen weiter auseinanderliegenden Ablesungen.",
}

type Variables = Record<string, string | number>

interface I18nContextValue {
  language: Language
  locale: "de-DE" | "en-US"
  setLanguage: (language: Language) => void
  t: (source: string, variables?: Variables) => string
  formatDate: (value: string) => string
  formatDateTime: (value: string) => string
  formatNumber: (value: number, decimals?: number) => string
  parseNumber: (value: string) => number
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

function interpolate(value: string, variables?: Variables) {
  if (!variables) return value
  return Object.entries(variables).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)),
    value,
  )
}

function parseDate(value: string) {
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("de")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "de" || stored === "en") setLanguageState(stored)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const locale = language === "de" ? "de-DE" : "en-US"
  const t = useCallback(
    (source: string, variables?: Variables) =>
      interpolate(language === "de" ? (de[source] ?? source) : source, variables),
    [language],
  )

  const value = useMemo<I18nContextValue>(() => ({
    language,
    locale,
    setLanguage,
    t,
    formatDate: (input) => {
      const date = parseDate(input)
      return date ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date) : input
    },
    formatDateTime: (input) => {
      const date = parseDate(input)
      return date
        ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date)
        : input
    },
    formatNumber: (number, decimals = 2) => new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(number),
    parseNumber: (input) => {
      const normalized = language === "de"
        ? input.replace(/\./g, "").replace(",", ".")
        : input.replace(/,/g, "")
      return Number(normalized)
    },
  }), [language, locale, setLanguage, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within an I18nProvider")
  return context
}
