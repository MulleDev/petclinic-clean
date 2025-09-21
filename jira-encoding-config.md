# Jira Server Encoding Konfiguration

## 1. Jira Server JVM Parameter (setenv.sh/setenv.bat)

### Windows (setenv.bat):
```bat
set CATALINA_OPTS=%CATALINA_OPTS% -Dfile.encoding=UTF-8
set CATALINA_OPTS=%CATALINA_OPTS% -Dsun.jnu.encoding=UTF-8
set CATALINA_OPTS=%CATALINA_OPTS% -Djira.i18n.encoding=UTF-8
```

### Linux (setenv.sh):
```bash
export CATALINA_OPTS="$CATALINA_OPTS -Dfile.encoding=UTF-8"
export CATALINA_OPTS="$CATALINA_OPTS -Dsun.jnu.encoding=UTF-8"
export CATALINA_OPTS="$CATALINA_OPTS -Djira.i18n.encoding=UTF-8"
```

## 2. Jira Database Encoding

### MySQL:
```sql
ALTER DATABASE jiradb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### PostgreSQL:
```sql
-- Bei der DB-Erstellung:
CREATE DATABASE jiradb WITH ENCODING 'UTF8';
```

## 3. Tomcat server.xml Konfiguration

```xml
<Connector port="8080" 
           URIEncoding="UTF-8"
           useBodyEncodingForURI="true" />
```

## 4. Jira Web.xml Filter

```xml
<filter>
    <filter-name>encodingFilter</filter-name>
    <filter-class>org.springframework.web.filter.CharacterEncodingFilter</filter-class>
    <init-param>
        <param-name>encoding</param-name>
        <param-value>UTF-8</param-value>
    </init-param>
    <init-param>
        <param-name>forceEncoding</param-name>
        <param-value>true</param-value>
    </init-param>
</filter>
```

## 5. MCP Server Client-Side Lösung (Empfohlen)

Da wir den Jira Server nicht kontrollieren, sollten wir **client-seitig** das Encoding handhaben:

### Option A: Request Headers
```javascript
const response = await fetch(url, {
    headers: {
        'Accept-Charset': 'UTF-8',
        'Content-Type': 'application/json; charset=UTF-8'
    }
});
```

### Option B: Text Dekodierung
```javascript
// Für Responses:
const text = await response.text();
const utf8Text = new TextDecoder('utf-8').decode(new TextEncoder().encode(text));
```

### Option C: PowerShell UTF-8 Output
```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

## 6. Prüfung der aktuellen Konfiguration

```bash
# Java System Properties prüfen:
echo "file.encoding: $(java -XshowSettings:properties 2>&1 | grep file.encoding)"

# Jira Logs prüfen:
tail -f atlassian-jira.log | grep -i encoding
```
