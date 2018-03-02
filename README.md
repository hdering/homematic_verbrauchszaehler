# homematic_stromverbrauch_protokollieren
Mittels ioBroker Javascript Stromzähler protokollieren

Inspiriert durch http://forum.iobroker.net/viewtopic.php?f=21&t=2262&sid=92d04ba1222eeb6a78674eb16637c5c2&start=100

### Getestete Geräte:
- HM-ES-TX-WM
- HM-ES-PMSw1-Pl-DN-R1
- HMIP-PSM

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
