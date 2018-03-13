# homematic_stromverbrauch_protokollieren

### Wiki
https://github.com/hdering/homematic_stromverbrauch_protokollieren/wiki

### Getestete Geräte:
- HM-ES-TX-WM
- HM-ES-PMSw1-Pl-DN-R1
- HMIP-PSM

## TODO
- Preisänderung innerhalb des Jahres konfigurierbar machen
- Grundpreis berechnen

## Changelog

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
