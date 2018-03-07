# homematic_stromverbrauch_protokollieren

Inspiriert durch http://forum.iobroker.net/viewtopic.php?f=21&t=2262&sid=92d04ba1222eeb6a78674eb16637c5c2&start=100

Skript dient zur Ermittlung des Stromverbrauchs bei Geräten.

Zählerstände werden gespeichert jeweils
* jeden Tag
* jede Woche Montag
* jeden Monatsersten
* jeden Quartalsersten
* jedes Neujahr
wenn ein neuer Wert reinkommt.

Der Strompreis wird in die Variable "Strompreis_aktuell" geschrieben. 
Änderungen des Strompreispreises müssen rechtzeitig per Cronjob programmiert werden.

Die Stromkosten (Verbrauch * Preis) werden ebenso
* jeden Tag
* jede Woche Montag
* jeden Monatsersten
* jeden Quartalsersten
* jedes Neujahr

genullt und bis dahin durch die Berechnung (der Differenz des aktuellen Zählerstandes - Zählerstand Beginn des Zeitraums) * Strompreis ermittelt.

Der kumulierte Zählerstand berücksichtigt evtl. Resets und Überläufe der realen Zählerstände der Geräte.

---

Jedes Gerät hat ab Version 1.0.6 in seinem Verzeichnis einen zusätzlichen Ordner "eigenerPreis", z.B.
* Strom.Küche.Kühlschrank.*eigenerPreis*.aktuell.Arbeitspreis
* Strom.Küche.Kühlschrank.*eigenerPreis*.aktuell.Grundpreis (Wert wird noch nicht ausgewertet)

Sobald der Wert > 0 ist, wird dieser zur Berechnung der Stromkosten herangezogen.

Somit kann jedes beliebige Gerät seinen eigenen Arbeitspreis haben.

---

Ab Version 1.0.7 wird bei einem Tages/Wochen/Monats/...-wechsel der "alte" Wert in einer zusätzlichen Variable abgespeichert und ensprechend dorchrotiert.
* Strom.Küche.Kühlschrank.Kosten.Tag (aktueller Wert)
* Strom.Küche.Kühlschrank.Kosten._Tag.Tag_1 (Wert vor einem Tag)
* Strom.Küche.Kühlschrank.Kosten._Tag.Tag_2 (Wert vor zwei Tagen)
* Strom.Küche.Kühlschrank.Kosten._Tag.Tag_3
* Strom.Küche.Kühlschrank.Kosten._Tag.Tag_n



* Strom.Küche.Kühlschrank.Verbrauch.Tag
* Strom.Küche.Kühlschrank.Verbrauch._Tag.Tag_1
* Strom.Küche.Kühlschrank.Verbrauch._Tag.Tag_2
* Strom.Küche.Kühlschrank.Verbrauch._Tag.Tag_3
* Strom.Küche.Kühlschrank.Verbrauch._Tag.Tag_n



---
  
### Getestete Geräte:
- HM-ES-TX-WM
- HM-ES-PMSw1-Pl-DN-R1
- HMIP-PSM

## TODO

- Preisänderung innerhalb des Jahres konfigurierbar machen
- Grundpreis berechnen

## Changelog

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
