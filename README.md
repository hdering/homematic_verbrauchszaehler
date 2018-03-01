# homematic_stromverbrauch_protokollieren
Mittels ioBroker Javascript Stromzähler protokollieren

Inspiriert durch http://forum.iobroker.net/viewtopic.php?f=21&t=2262&sid=92d04ba1222eeb6a78674eb16637c5c2&start=100

TODO:
- Preisänderung innerhalb des Jahres konfigurierbar machen
- Grundpreis berechnen

Changelog:
erstellt: 09.02.2016 von pix auf Basis des alten Skriptes
18.02.2016 externes Log zugefügt
19.02.2016 Fehler beseitigt
29.02.2016 löst definitiv die alten Skripte ab
           Leerzeichen aus Gerätenamen entfernen (Regexp)
01.03.2016 Optin Log Subscriptions durch Regexp Funktion in anderem Skript ersetzt
21.04.2016 Korrektur Code Quartalsauslösung
08.05.2016 formatDate Parameter von JJJJ.MM.TT auf YYYY.MM.DD
24.05.2016 parseFloat vermehrt eingesetzt, der neue Javascript Adapter Version prüft genauer, ob typeof number wirklich number und nicht string ist
07.07.2016 Quartalserkennung durch parseInt korrigiert
09.07.2016 schedule für Eingabe neuen Strompreis an Neujahr
02.08.2016 Zählerstand schreiben - Typ Fehler korrigiert
12.06.2016 Aufbereitung Gerätenamen verbessert

01.02.2018  Größere Änderungen durchgeführt:
            Jahreswechsel und mnachmal Tageswechsel wurde bei mir nicht zuverlässig erkannt, daher habe ich die Art der Erkennung geändert.
            5 Schedules registrieren jeweils Tages-, Wochen-, Monats-, Quartals-, Jahreswechsel und setzen eine entsprechende Variable.
            Diese Variablen werden bei jedem Zählerstand geprüft.
            
28.02.2018  Das Skript hat nur 2 von 3 Fällen abgefangen:
            1. Standardfall: Neuer Wert kommt vom Stromzähler (Neuer Wert ist größer als alter Wert)
            
            Beispiel:
            obj.newState.val:4925.1
            obj.oldState.val:4924.3
            
            2. Stromzähler wurde zurückgesetzt (Batterie leer, für längere Zeit vom Strom genommen). Neuer Wert Beginn bei 0.
            
            Beispiel:
            obj.newState.val:0
            obj.oldState.val:4924.3
            
            obj.newState.val:2.3
            obj.oldState.val:0
            
            obj.newState.val:5.4
            obj.oldState.val:2.3
            
            3. NEU: CCU2 wurde neugestartet (Sobald ein Status vom Stromzähler kommt ist dieser unter Umständen zu Beginn 0 (gleiches Verhalten wie bei Fall 2). Dieser Fall muss aber abgefangen werden.
            Es werden 2 darauffolgende neue Zählerstände zunächst ignoriert. Falls auch beim 3 mal der neue Wert kleiner als alte Wert ist, muss von Fall 2 ausgegangen werden.
            
            Beispiel:
            1ter Lauf:
            obj.newState.val:0
            obj.oldState.val:4924.3
            
            2ter Lauf:
            obj.newState.val:4925.1
            obj.oldState.val:0
            
            3ter Lauf:
            obj.newState.val:4926.1
            obj.oldState.val:4925.1
