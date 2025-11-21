# Cline Setup für Adesso AI Hub

## ✅ Cline ist installiert!

## Nächste Schritte:

### 1. API-Key als Umgebungsvariable setzen

Öffne ein Terminal und führe aus:

```bash
# Temporär (nur für diese Session):
export AI_HUB_API_KEY="dein_api_key_hier"

# ODER dauerhaft in ~/.zshrc:
echo 'export AI_HUB_API_KEY="dein_api_key_hier"' >> ~/.zshrc
source ~/.zshrc
```

**WICHTIG:** Ersetze `dein_api_key_hier` mit deinem echten API-Key!

### 2. VS Code neu starten

Damit Cline die Umgebungsvariable sieht:
```bash
# Schließe VS Code komplett und öffne es neu
code .
```

### 3. Cline konfigurieren

1. **Öffne Cline**: Klicke auf das Cline-Icon in der linken Sidebar (oder `Cmd+Shift+P` → "Cline: Open")

2. **API-Einstellungen**: Klicke auf das Zahnrad-Symbol ⚙️ in Cline

3. **Wähle "OpenAI Compatible"** als API Provider

4. **Trage ein**:
   - **API Key**: `${AI_HUB_API_KEY}` (genau so schreiben - nutzt die Umgebungsvariable)
   - **Base URL**: `https://adesso-ai-hub.3asabc.de/v1`
   - **Model ID**: `bedrock-claude-v4-sonnet` (oder ein anderes Modell)

5. **Speichern** und testen!

### 4. Cline testen

Öffne Cline und schreibe:
```
Hallo! Kannst du dich vorstellen und mir sagen, welches Modell du bist?
```

Wenn alles funktioniert, antwortet das Adesso AI Hub Modell!

---

## Verfügbare Modelle im Adesso AI Hub

Basierend auf deinem Beispielcode sind verfügbar:
- `bedrock-claude-v4-sonnet` (empfohlen)
- `gpt-4`
- `gpt-3.5-turbo`
- Weitere Modelle - prüfe die Adesso AI Hub Dokumentation

Du kannst das Modell jederzeit in den Cline-Einstellungen wechseln!

---

## Troubleshooting

### "API Key not found" Fehler
```bash
# Prüfe, ob der Key gesetzt ist:
echo $AI_HUB_API_KEY

# Wenn leer: Key setzen und VS Code neu starten
export AI_HUB_API_KEY="dein_key"
code .
```

### "Connection failed" Fehler
- Prüfe die Base URL: `https://adesso-ai-hub.3asabc.de/v1`
- Prüfe, ob der API-Key korrekt ist
- Teste den Endpunkt manuell:
```bash
curl -H "Authorization: Bearer $AI_HUB_API_KEY" \
  https://adesso-ai-hub.3asabc.de/v1/models
```

### Modell nicht gefunden
- Verwende exakt den Modellnamen aus dem Hub
- Beispiel: `bedrock-claude-v4-sonnet`

---

## Parallel-Nutzung mit GitHub Copilot

Du kannst jetzt beide nutzen:
- **GitHub Copilot Chat** (dieser hier) → für schnelle Fragen
- **Cline** (mit Adesso AI Hub) → für komplexe Code-Generierung

Beide arbeiten unabhängig voneinander!

---

## Nächste Schritte nach erfolgreicher Einrichtung

1. Teste Cline mit einer einfachen Aufgabe
2. Vergleiche die Antworten von Copilot vs. Adesso AI Hub
3. Nutze das beste Tool für die jeweilige Aufgabe
4. Dokumentiere, welche Modelle für welche Tasks am besten sind

Viel Erfolg! 🚀
