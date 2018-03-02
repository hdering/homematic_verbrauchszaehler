# homematic_stromverbrauch_protokollieren

Inspiriert durch http://forum.iobroker.net/viewtopic.php?f=21&t=2262&sid=92d04ba1222eeb6a78674eb16637c5c2&start=100

Skript dient zur Ermittlung des Stromverbrauchs bei Geräten.

Zählerstände werden gespeichert jeweils
-jeden Tag
-jede Woche Montag
-jeden Monatsersten
-jeden Quartalsersten
-jedes Neujahr
wenn ein neuer Wert reinkommt.

Der Strompreis wird in die Variable "Strompreis_aktuell" geschrieben. 
Änderungen des Strompreispreises müssen rechtzeitig per Cronjob programmiert werden.

Die Stromkosten (Verbrauch * Preis) werden ebenso
-jeden Tag
-jede Woche Montag
-jeden Monatsersten
-jeden Quartalsersten
-jedes Neujahr
genullt und bis dahin durch die Berechnung (der Differenz des aktuellen Zählerstandes - Zählerstand Beginn des Zeitraums) * Strompreis ermittelt.

Der kumulierte Zählerstand berücksichtigt evtl. Resets und Überläufe der realen Zählerstände der Geräte.
  
### Getestete Geräte:
- HM-ES-TX-WM
- HM-ES-PMSw1-Pl-DN-R1
- HMIP-PSM


## TODO

- Preisänderung innerhalb des Jahres konfigurierbar machen
- Grundpreis berechnen

## Changelog

### 1.0.2 (2018-02-28)
* (hdering) Es wurden nur 2 Fälle angefangen. 1. Neuer Wert kommt vom Stromzähler. 2. Stromzähler wurde zurückgesetzt. Fall 3, dass einfach nur die CCU neugestartet wird, wurde nicht abgefangen.

### 1.0.1 (2018-02-01)
* (hdering) Größere Änderungen durchgeführt:
            Jahreswechsel und mnachmal Tageswechsel wurde bei mir nicht zuverlässig erkannt, daher habe ich die Art der Erkennung geändert.
            5 Schedules registrieren jeweils Tages-, Wochen-, Monats-, Quartals-, Jahreswechsel und setzen eine entsprechende Variable.
            Diese Variablen werden bei jedem Zählerstand geprüft.

### 1.0.0 (2018-01-01)
* (hdering) Skript aus dem Forum als Basis genommen (http://forum.iobroker.net/viewtopic.php?f=21&t=2262&sid=92d04ba1222eeb6a78674eb16637c5c2&start=100)
