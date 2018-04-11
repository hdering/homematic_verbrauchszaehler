# homematic_verbrauchszaehler

### Wiki
https://github.com/hdering/homematic_verbrauchszaehler/wiki/Wiki

## TODO
- Zaehlerstand_letzte_Ablesung und Zaehlerstand_jetzt angeben können

## Changelog

### 1.3.0 (2018-04-11)
* (hdering) !!! WICHTIG !!! Da das Skript kein reiner Stromzähler mehr ist, habe ich den Pfad innerhalb der Instanz umbenannt "Strom" -> "Verbrauchszaehler". Bevor das neue Skript verwendet wird, solltet ihr euern Ordner in den Objekten nach "Verbrauchszaehler" umbenennen.
* (hdering) Grundpreis kann jetzt einberechnet werden. Es wird vorher Grundpreis * 12 Monate / 365 Tage gerechnet und dieser Wert dem Tages/Wochen/Monats-... hinzuaddiert
* (hdering) Die Einheit für den kumulierten sowie berechneten Verbrauch kann angegeben werden (default_unit, default_unit_kilo) (Dadurch kann der Gaszähler m3 als Einheit haben)
* (hdering) Wenn der Datenpunkt bereits in Kilo angegeben wird, kann die spätere Berechnung nach kilo deaktiviert werden (KumulierterWertIstBereitsInKilo)

### 1.2.0 (2018-03-22)
* (hdering) Eigene Datenpunkte haben ihre eigene Einheit
* (hdering) Tages-, Wochen-, Monats-.... werden jetzt immer um 0 Uhr durchgeführt und nicht erst, wenn ein neuer Wert vom Zähler reinkommt.
* (hdering) Wenn kein Arbeitspreis angegeben wird, wird der Zählerstand trotzdem gezählt. Es wird eine Warnung ins Log geschrieben.

### 1.1.3 (2018-03-20)
* (hdering) AnzahlKommastellenZaehlerstand korrigiert

### 1.1.2 (2018-03-19)
* (hdering) Tages-, Wochen-, Monats-.... bei eigenen Datenpunkten vergessen zu setzen

### 1.1.1 (2018-03-14)
* (hdering) Fehler beim Prüfen einer Preisänderung

### 1.1.0 (2018-03-12)
* (hdering) Arbeitspreis + Grundpreis werden nicht über das Skript gesetzt.
* (hdering) Neuer Arbeitspreis + Grundpreis können innerhalb des Jahres angegeben werden.
* (hdering) Geräte können ihren eigenen Strompreis haben.
* (hdering) Geräte mit eigenem Strompreis haben ebenfalls die Funktion Arbeitspreis + Grundpreis innerhalb des Jahres zu ändern.
* (hdering) Eigene Datenpunkte angeben
* (hdering) Fehler in Funktion entferneDatenpunkt behoben

### 1.0.7 (2018-03-07)
* (hdering) Wenn eine History Instanz verfügbar ist, kann man im Skript die Instanz angeben. Es wird dann bei allen Objekten die History aktiviert.
* (hdering) Bei jedem Tages/Wochen/Monats/...-wechsel wird nun der aktuelle Verbrauch/die aktuellen Kosten in einer zusätzlichen Variable abgespeichert

### 1.0.6 (2018-03-05)
* (hdering) Jedes Gerät kann nun seinen eigenen Arbeitspreis haben.

### 1.0.5 (2018-03-04)
* (hdering) Quartalswechsel korrigiert
* (hdering) Funktion entferneDatenpunkt erweitert

### 1.0.4 (2018-03-03)
* (hdering) Falls Gerätename nicht "normalisiert" werden kann, wird dies abgefangen und eine Nachricht erzeugt.

### 1.0.3 (2018-03-02)
* (hdering) Bei Überlauf, Neustart, Rücksetzen oder oder wird der alte Wert nicht mehr gespeichert. Logik nochmals vereinfacht.

### 1.0.2 (2018-02-28)
* (hdering) Es wurden nur 2 Fälle abgefangen. 
1. (Standard) Neuer Wert kommt vom Stromzähler. 
2. Stromzähler wurde zurückgesetzt. 
3. (NEU) CCU wurde neugestartet.

### 1.0.1 (2018-02-01)
* (hdering) Größere Änderungen durchgeführt:
            Jahreswechsel und mnachmal Tageswechsel wurde bei mir nicht zuverlässig erkannt, daher habe ich die Art der Erkennung geändert.
            5 Schedules registrieren jeweils Tages-, Wochen-, Monats-, Quartals-, Jahreswechsel und setzen eine entsprechende Variable.
            Diese Variablen werden bei jedem Zählerstand geprüft.

### 1.0.0 (2018-01-01)
* (hdering) Skript aus dem Forum als Basis genommen (http://forum.iobroker.net/viewtopic.php?f=21&t=2262&sid=92d04ba1222eeb6a78674eb16637c5c2&start=100)
