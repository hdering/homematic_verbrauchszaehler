/* Strom Zaehlerstaende, Verbrauch und Kosten

Skript dient zur Ermittlung des Stromverbrauchs bei Geräten.

Getestete Geräte:
- HM-ES-TX-WM
- HM-ES-PMSw1-Pl-DN-R1
- HMIP-PSM

---------------------------------------------------------------------------------------

Zählerstände werden gespeichert jeweils
-jeden Tag
-jede Woche Montag
-jeden Monatsersten
-jeden Quartalsersten
-jedes Neujahr
wenn ein neuer Wert reinkommt.

---------------------------------------------------------------------------------------

Der Strompreis wird in die Variable "Strompreis_aktuell" geschrieben. 
Änderungen des Strompreispreises müssen rechtzeitig per Cronjob programmiert werden.

---------------------------------------------------------------------------------------

Die Stromkosten (Verbrauch * Preis) werden ebenso
-jeden Tag
-jede Woche Montag
-jeden Monatsersten
-jeden Quartalsersten
-jedes Neujahr
genullt und bis dahin durch die Berechnung (der Differenz des aktuellen Zählerstandes - Zählerstand Beginn des Zeitraums) * Strompreis ermittelt.

---------------------------------------------------------------------------------------

Der kumulierte Zählerstand berücksichtigt evtl. Resets und Überläufe der realen Zählerstände der Geräte.

---------------------------------------------------------------------------------------

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

--------------

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
            
---------------------------------------------------------------------------------------

TODO:

- Preisänderung innerhalb des Jahres konfigurierbar machen
- Grundpreis berechnen

*/

//----------------------------------------------------------------------------//
// +++++++++  USER ANPASSUNGEN ++++++++++++++++++++++++

var logging = true;

var arbeitspreis = 0.2627;
// Preis ab 01.01.
var neuer_arbeitspreis = 0.2612;
var grundpreis = 6.40;

var instance    = '0';
var instanz     = 'javascript.' + instance + '.';

// Pfad innerhalb der Instanz
var pfad        = 'Strom.';

// persönliche Blacklist: Diese Teile werden aus den Homematic Gerätenamen entfernt ( aus "Waschmaschine Küche:2.ENERGY_COUNTER" wird "Waschmaschine", aus "Kühlschrank Strommessung.METER" wird "Kühlschrank")
var blacklist   = [':1', ':2', ':6'];

var AnzahlKommastellenKosten = 2;
var AnzahlKommastellenVerbrauch = 3;
var AnzahlKommastellenZaehlerstand = 3;

// Pushmeldung
function send_message (text) {
    
    // Hier können die Pushmeldung über alle möglichen Wege verschickt werden.
    
    //console.log(text);
    
    sendTelegramToHermann(text);
}

// ++++ ENDE USER ANPASSUNGEN ++++++++++++++++++++++++
//----------------------------------------------------------------------------//

createState(pfad + 'Preis.aktuell.Arbeitspreis', {
    name: 'Strompreis - aktueller Arbeitspreis (brutto)',
    unit: '€/kWh',
    type: 'number',
    def:  parseFloat(arbeitspreis),
    min:  0
});

createState(pfad + 'Preis.aktuell.Grundpreis',  {                           
    name: 'Strompreis - aktueller Grundpreis (brutto)',
    unit: '€/Monat',
    type: 'number',
    def:  parseFloat(grundpreis),
    min: 0
});

//----------------------------------------------------------------------------//

var idStrompreis = instanz + pfad + 'Preis.aktuell.Arbeitspreis';

// Neuer Preis um Mitternacht an Neujahr aktivieren!
schedule("0 0 1 1 *", function() {
    setState(idStrompreis, neuer_arbeitspreis);
});

//----------------------------------------------------------------------------//

var cacheSelectorStateMeter  = $('channel[state.id=*.METER]');
var cacheSelectorStateEnergyCounter  = $('channel[state.id=*.ENERGY_COUNTER$]');

//----------------------------------------------------------------------------//

function parseObjects(id) {
    var obj = getObject(id);

    return entferneDatenpunkt(obj.common.name);
}

function setRecognizedChange(type) {
    cacheSelectorStateMeter.each(function (id, i) {
        var geraetename = parseObjects(id);
        
        setState(pfad + geraetename + '.config.' + type, true);
    });

    cacheSelectorStateEnergyCounter.each(function (id, i) {
        var geraetename = parseObjects(id);

        setState(pfad + geraetename + '.config.' + type, true);
    });    
}

//----------------------------------------------------------------------------//

// Tageswechsel
schedule("0 0 * * *", function() {
    setRecognizedChange('Tag');
});

// Wochenwechsel
schedule("0 0 * * 1", function() {
    setRecognizedChange('Woche');
});

// Monatswechsel
schedule("0 0 1 * *", function() {
    setRecognizedChange('Monat');
});

// Quartalswechsel
schedule("0 0 */3 * *", function() {
    setRecognizedChange('Quartal');
});

// Jahreswechsel
schedule("0 0 1 1 *", function() {
    setRecognizedChange('Jahr');
});

//----------------------------------------------------------------------------//

// Einlesen der aktuellen Daten vom Zähler
function run(obj) {

    if (logging) {   
        log('-------- Strommesser ---------');
        log('RegExp-Funktion ausgelöst');
        log('Gewerk:       ' + obj.role);   // undefined
        log('Beschreibung: ' + obj.desc);   // undefined
        log('id:           ' + obj.id);
        log('Name:         ' + obj.common.name);   // Waschmaschine Küche:2.ENERGY_COUNTER !!!!! Mac mini Strommessung.METER
        log('channel ID:   ' + obj.channelId);     // hm-rpc.0.MEQ0170864.2
        log('channel Name: ' + obj.channelName);   // Waschmaschine Küche:2
        log('device ID:    ' + obj.deviceId);      // hm-rpc.0.MEQ0170864
        log('device name:  ' + obj.deviceName);    // Küche Waschmaschine
        log('neuer Wert:   ' + obj.newState.val);  // 16499.699982
        log('alter Wert:   ' + obj.oldState.val);  // 16499.699982
        log('Einheit:      ' + obj.common.unit);   // Wh
    }
    
    // Gerätenamen erstellen
    if (logging) log('vor der Aufbereitung: ' + obj.common.name); 
    
    var geraetename = entferneDatenpunkt(obj.common.name); // .METER oder .ENERGY_COUNTER
    
    //log('nach entferne Datenpunkt: ' + geraetename);
    //geraetename = geraetename.replace(/\s/g, ""); // per Regexp Leerzeichen entfernen
    //geraetename = checkBlacklist(geraetename);  // Wenn man keine Blacklist braucht, kann man diesen Teil auskommentieren
    
    if (logging) log('Nach der Aufbereitung: ' + geraetename); 
    
    //------------------------------------------------------------------------//
    
    // States erstellen (CreateStates für dieses Gerät)
    erstelleStates(geraetename);
    
    //------------------------------------------------------------------------//
    
    // Schreiben der neuen Werte

    // prüfe und schreibe Daten   
    var idKumuliert =  instanz + pfad + geraetename + '.Zaehlerstand.kumuliert',
        idBackup =     instanz + pfad + geraetename + '.Zaehlerstand.Backup';
    
    var allesOK = false;
    var NeustartDesGeraetesErkannt = false;
    
    // neuer Wert größer alter wert -> alles gut
    // Fall 1
    if (obj.newState.val >= obj.oldState.val) {
        
        allesOK = true;
        
        if(getState(pfad + geraetename + '.config.NeustartErkannt').val) {
            
            //Es wird 1 Wert übersprungen. Danach wird der alte Wert mit dem neuesten Wert geprüft.
            //Ist der neue Wert kleiner als der alte Wert, dann muss davon ausgegangen werden, dass das Gerät neugestartet wurde.
            //Ansonsten die CCU neugestartet.
            
            if(obj.newState.val < getState(pfad + geraetename + '.config.NeustartErkanntAlterWert').val) {
                
                if(logging) {
                    var message6 =  geraetename + '\n'
                                    + 'Neustart des Gerät sehr wahrscheinlich erkannt.\n'
                                    + 'obj.newState.val:' + obj.newState.val + '\n'
                                    + 'NeustartErkanntAlterWert:' + getState(pfad + geraetename + '.config.NeustartErkanntAlterWert').val;
                    
                    send_message(message6);
                }
                
                allesOK = false;
                
                NeustartDesGeraetesErkannt = true;
                
            } else {
                
                setState(pfad + geraetename + '.config.NeustartErkannt', false);
            }
        }
        
    } else {
        
        // Fall 2 oder 3
        // Irgendetwas läuft außerplanmäßig. Wert wird sicherheitshalber gespeichert
        setState(pfad + geraetename + '.config.NeustartErkannt', true);
        setState(pfad + geraetename + '.config.NeustartErkanntAlterWert', obj.oldState.val);
    }

    if(allesOK) {
        
        // Kumulierten Wert mit Ist-Wert (inkl. Backup) synchronisieren
        var newValueKumuliert = parseFloat(obj.newState.val + getState(idBackup).val);

        setState(idKumuliert, newValueKumuliert);
        
    } else {

        // Fall 2 (Zähler im Gerät übergelaufen oder genullt)
        if(NeustartDesGeraetesErkannt) {

            // Differenz berechnen
            var differenz = obj.oldState.val - obj.newState.val;                        
            
            // Differenz und Backup addieren "und den Werteabriss ausgleichen"
            setState(idBackup, parseFloat(getState(idBackup).val + differenz));                     
            
            // damit neuer kumulierter Wert stetig weiter wächst
            setState(idKumuliert, parseFloat(obj.newState.val + getState(idBackup).val));   
            
            // zurücksetzen der Variable
            setState(pfad + geraetename + '.config.NeustartErkannt', false);
            setState(pfad + geraetename + '.config.NeustartErkanntAlterWert', 0);
            
            //----------------------------------------------------------------//

            var meldung = 'Achtung!\n\n' 
                    + 'Der Stromzählerstand (' + geraetename + ') ist übergelaufen oder gelöscht worden (ggf. Stromausfall).\n'
                    + 'Der letzte Zählerstand vor dem Reset wird nun zum Neuen addiert. Bitte unbedingt die Werte prüfen. \n\n'
                    + 'newState:' + obj.newState.val + '\n' 
                    + 'oldState:' + obj.oldState.val + '\n'
                    + 'differenz:' + differenz + '\n'
                    + 'idBackup:' + parseFloat(obj.newState.val + getState(idBackup).val) + '\n'
                    + 'idKumuliert:' + parseFloat(obj.newState.val + getState(idBackup).val);

            send_message(meldung);
            
        } else {
            
            // Fall 3 (Eventuell CCU neugestartet worden)
            if(logging) {
                var message3 =  geraetename + '\n'
                                + 'Entweder die CCU oder der Zähler wurden zurückgesetzt/neugestartet.\n'
                                + 'Dieser Wert wird einmal ignoriert und auf den nächsten Wert gewartet.';

                send_message(message3);
            }
        }
    }
    
    //------------------------------------------------------------------------//
    
    // aktualisiere den Verbrauch und die Kosten
    _zaehler    = (getState(idKumuliert).val / 1000).toFixed(AnzahlKommastellenKosten);
    _preis      = getState(idStrompreis).val;
    
    berechneVerbrauchUndKosten(geraetename, _zaehler, _preis); // in kWh
   
    //------------------------------------------------------------------------//
    // Zurücksetzen der Werte
   
    if(getState(pfad + geraetename + '.config.Tag').val) {
        
        if (logging) send_message("Tageswechsel wurde erkannt. (" + geraetename + ")");
        
        setState(pfad + geraetename + '.config.Tag', false);
       
        resetVerbrauchUndKosten(geraetename, 'Tag');

        schreibeZaehlerstand(geraetename, 'Tag');
    }
    
    if(getState(pfad + geraetename + '.config.Woche').val) {
        
        if (logging) send_message("Wochenwechsel wurde erkannt. (" + geraetename + ")");
        
        setState(pfad + geraetename + '.config.Woche', false);
       
        resetVerbrauchUndKosten(geraetename, 'Woche');
        
        schreibeZaehlerstand(geraetename, 'Woche');
    }
    
    if(getState(pfad + geraetename + '.config.Monat').val) {
        
        if (logging) send_message("Monatswechsel wurde erkannt. (" + geraetename + ")");
        
        setState(pfad + geraetename + '.config.Monat', false);
       
        resetVerbrauchUndKosten(geraetename, 'Monat');

        schreibeZaehlerstand(geraetename, 'Monat');
    }
    
    if(getState(pfad + geraetename + '.config.Quartal').val) {
        
        if (logging) send_message("Quartalswechsel wurde erkannt. (" + geraetename + ")");
        
        setState(pfad + geraetename + '.config.Quartal', false);
        
        resetVerbrauchUndKosten(geraetename, 'Quartal');

        schreibeZaehlerstand(geraetename, 'Quartal');
    }
    
    if(getState(pfad + geraetename + '.config.Jahr').val) {
        
        if (logging) send_message("Jahreswechsel wurde erkannt. (" + geraetename + ")");
        
        setState(pfad + geraetename + '.config.Jahr', false);
       
        resetVerbrauchUndKosten(geraetename, 'Jahr');

        schreibeZaehlerstand(geraetename, 'Jahr');
    }

    //------------------------------------------------------------------------//
    
    if (logging) log('------------ ENDE ------------');
}

cacheSelectorStateMeter.on(function(obj) {
   run(obj);
});

cacheSelectorStateEnergyCounter.on(function(obj) {
   run(obj);
});

//----------------------------------------------------------------------------//

function entferneDatenpunkt(geraet) {
    
    var rueckgabe;
    
    // ":2.ENERGY_COUNTER" --> ".ENERGY_COUNTER"
    if (geraet.indexOf(".ENERGY_COUNTER") != -1) {
        rueckgabe = geraet.substring(0, geraet.indexOf(".ENERGY_COUNTER"));
    
        
    } else if (geraet.indexOf(".METER") != -1) {
        rueckgabe = geraet.substring(0, geraet.indexOf(".METER"));
    }
    
    if (logging) log('entferneDatenpunkt - rueckgabe1:' + rueckgabe);

    // Rückgabe sollte keine Sonderzeichen oder Leerzeichen enthalten. Wenn doch, werden die entfernt oder ersetzt
    // Wenn man keine Blacklist braucht, kann man diesen Teil auskommentieren
    rueckgabe = checkBlacklist(rueckgabe);                                      

    if (logging) log('entferneDatenpunkt - rueckgabe2:' + rueckgabe);
    
    if (rueckgabe.charAt(rueckgabe.length - 1) == "-") rueckgabe = rueckgabe.substr(0, rueckgabe.length - 1);
    if (rueckgabe.charAt(rueckgabe.length - 1) == "\\") rueckgabe = rueckgabe.substr(0, rueckgabe.length - 1);
    if (rueckgabe.charAt(rueckgabe.length - 1) == ":") rueckgabe = rueckgabe.substr(0, rueckgabe.length - 1);
    
    if (logging) log('entferneDatenpunkt - rueckgabe3:' + rueckgabe);

    // per Regexp Leerzeichen entfernen
    rueckgabe = rueckgabe.replace(/\s/g, "");
    
    if (logging) log('entferneDatenpunkt - rueckgabe4:' + rueckgabe);

    // todo
    return rueckgabe;
}

function checkBlacklist(name) {
    
    if (blacklist.length > 0) {

      for(var i = 0; i < blacklist.length; i++) {
          
            if (name.indexOf(blacklist[i]) != -1) {
                
                // Zeichenketten, die in der Blacklist stehen, aus dem Namen löschen
                return( name.substring(0, name.indexOf(blacklist[i])) );
            } 
        }
    
    } else return (name);
}

function schreibeZaehlerstand(geraet, zeitraum) { 
    
    var idKumuliert =    instanz + pfad + geraet + '.Zaehlerstand.kumuliert',
        idZaehlerstand = instanz + pfad + geraet + '.Zaehlerstand.' + zeitraum;
    
    // Zählerstand für übergebene Zeitraum und das Gerät in Wh auslesen 
    // und in kWh speichern (also durch 1000)
    setState(idZaehlerstand, parseFloat( (getState(idKumuliert).val / 1000).toFixed(AnzahlKommastellenZaehlerstand)) );  

    if (logging) log('Zählerstände für das Gerät ' + geraet + ' (' + zeitraum + ') in Objekten gespeichert');
} 

function resetVerbrauchUndKosten(geraet, zeitraum) { 
    
    // Reset der Stromkosten für den übergebenen Zeitraum
    // Reset des Stromverbrauchs für den übergebenen Zeitraum 
    setState(instanz + pfad + geraet + '.Kosten.' + zeitraum, 0);     
    setState(instanz + pfad + geraet + '.Verbrauch.' + zeitraum, 0);
    
    if (logging) log('Stromkosten und Stromverbrauch für das Gerät ' + geraet + ' (' + zeitraum + ') zurückgesetzt');
} 

function berechneVerbrauchUndKosten(geraet, zaehler, preis) {                      
    
    // bei jedem eingehenden Wert pro Gerät
    
    // Tag [Verbrauchskosten = (Zähler_ist - Zähler_Tagesbeginn) * Preis ] --- zaehler muss immer größer sein als Tages, Wochen, etc.-Wert
    setState(instanz + pfad + geraet + '.Verbrauch.Tag',     parseFloat(  (zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Tag').val).toFixed(AnzahlKommastellenVerbrauch) ) );           // Verbrauch an diesem Tag in kWh
    setState(instanz + pfad + geraet + '.Kosten.Tag',        parseFloat( ((zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Tag').val) * preis).toFixed(AnzahlKommastellenKosten) ) );  // Kosten an diesem Tag in €
    
    // Woche    
    setState(instanz + pfad + geraet + '.Verbrauch.Woche',   parseFloat(  (zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Woche').val).toFixed(AnzahlKommastellenVerbrauch) ) );
    setState(instanz + pfad + geraet + '.Kosten.Woche',      parseFloat( ((zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Woche').val) * preis).toFixed(AnzahlKommastellenKosten) ) );
    
    // Monat    
    setState(instanz + pfad + geraet + '.Verbrauch.Monat',   parseFloat(  (zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Monat').val).toFixed(AnzahlKommastellenVerbrauch) ) );
    setState(instanz + pfad + geraet + '.Kosten.Monat',      parseFloat( ((zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Monat').val) * preis).toFixed(AnzahlKommastellenKosten) ) );
    
    // Quartal    
    setState(instanz + pfad + geraet + '.Verbrauch.Quartal', parseFloat(  (zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Quartal').val).toFixed(AnzahlKommastellenVerbrauch) ) );
    setState(instanz + pfad + geraet + '.Kosten.Quartal',    parseFloat( ((zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Quartal').val) * preis).toFixed(AnzahlKommastellenKosten) ) );
    
    // Jahr    
    setState(instanz + pfad + geraet + '.Verbrauch.Jahr',    parseFloat(  (zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Jahr').val).toFixed(AnzahlKommastellenVerbrauch) ) );
    setState(instanz + pfad + geraet + '.Kosten.Jahr',       parseFloat( ((zaehler - getState(instanz + pfad + geraet + '.Zaehlerstand.Jahr').val) * preis).toFixed(AnzahlKommastellenKosten) ) );  
    
    if (logging) log('Stromverbrauch und -kosten (' + geraet + ') aktualisiert');
}

function erstelleStates (geraet) {
    
    // Kumulierter Zählerstand (wird nie kleiner)
    createState(pfad + geraet + '.Zaehlerstand.kumuliert', 0, {name: 'Kumulierter Zählerstand (' + geraet + ') inkl. Backups', type: 'number', unit:'Wh'});
            
    // Zählerstand
    createState(pfad + geraet + '.Zaehlerstand.Tag',     0, {name: 'Zählerstand Tagesbeginn ('       + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Zaehlerstand.Woche',   0, {name: 'Zählerstand Wochenbeginn ('      + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Zaehlerstand.Monat',   0, {name: 'Zählerstand Monatsbeginn ('      + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Zaehlerstand.Quartal', 0, {name: 'Zählerstand Quartalsbeginn ('    + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Zaehlerstand.Jahr',    0, {name: 'Zählerstand Jahresbeginn ('      + geraet + ')', type: 'number', unit:'kWh'});
            
    // Backup Zählerstand
    createState(pfad + geraet + '.Zaehlerstand.Backup',  0, {
        name: 'Zählerstand Backup ('+ geraet + '), Differenz aus altem und neuem Wert nach Überlauf oder Reset',
        desc: 'wird beim Umspringen des Original-Zählerstandes (' + geraet + ') zu diesem addiert',
        type: 'number',
        unit: 'Wh'});
        
    // Verbrauch 
    createState(pfad + geraet + '.Verbrauch.Tag',        0, {name: 'Verbrauch seit Tagesbeginn ('    + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Verbrauch.Woche',      0, {name: 'Verbrauch seit Wochenbeginn ('   + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Verbrauch.Monat',      0, {name: 'Verbrauch seit Monatsbeginn ('   + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Verbrauch.Quartal',    0, {name: 'Verbrauch seit Quartalsbeginn (' + geraet + ')', type: 'number', unit:'kWh'});
    createState(pfad + geraet + '.Verbrauch.Jahr',       0, {name: 'Verbrauch seit Jahresbeginn ('   + geraet + ')', type: 'number', unit:'kWh'});
            
    // Stromkosten
    createState(pfad + geraet + '.Kosten.Tag',           0, {name: 'Stromkosten heute ('             + geraet + ')', type: 'number', unit:'€'  });
    createState(pfad + geraet + '.Kosten.Woche',         0, {name: 'Stromkosten Woche ('             + geraet + ')', type: 'number', unit:'€'  });
    createState(pfad + geraet + '.Kosten.Monat',         0, {name: 'Stromkosten Monat ('             + geraet + ')', type: 'number', unit:'€'  });
    createState(pfad + geraet + '.Kosten.Quartal',       0, {name: 'Stromkosten Quartal ('           + geraet + ')', type: 'number', unit:'€'  });
    createState(pfad + geraet + '.Kosten.Jahr',          0, {name: 'Stromkosten Jahr ('              + geraet + ')', type: 'number', unit:'€'  });
    
    // day, week, month, quartar, year change
    createState(pfad + geraet + '.config.Tag', false, {
        read: true,
        write: true,
        type: "boolean",
        def: false
    });

    createState(pfad + geraet + '.config.Woche', false, {
        read: true,
        write: true,
        type: "boolean",
        def: false
    });
    
    createState(pfad + geraet + '.config.Monat', false, {
        read: true,
        write: true,
        type: "boolean",
        def: false
    });
    
    createState(pfad + geraet + '.config.Quartal', false, {
        read: true,
        write: true,
        type: "boolean",
        def: false
    });
    
    createState(pfad + geraet + '.config.Jahr', false, {
        read: true,
        write: true,
        type: "boolean",
        def: false
    });

    // Neustart des Zählers oder der CCU erkannt
    createState(pfad + geraet + '.config.NeustartErkannt', false, {
        read: true,
        write: true,
        type: "boolean",
        def: false
    });
    
    createState(pfad + geraet + '.config.NeustartErkanntAlterWert', 0);

    if (logging) log('States in der Instanz ' + instanz + pfad + ' erstellt');   
}

//----------------------------------------------------------------------------//
