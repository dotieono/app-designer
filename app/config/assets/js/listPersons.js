/**
 * Responsible for rendering the list of perons
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */


function display() {
    window.adateHelper = getAdateHelper();
    
    // Hook up scan button
    $("#btnOpenScan").on("click", function() {
        odkTables.launchHTML(null, 'config/assets/scanQR.html');
    });

    var region = util.getQueryParameter("region")
    var sector  = util.getQueryParameter("sector")
    var tabanca = util.getQueryParameter("tabanca")
    
    $("#theHeader").html("Region = " + region + "<br/>Sector = " + sector + "<br/>Tabanca = " + tabanca);
    listPersons(region, sector, tabanca);
}


function listPersons(region, sector, tabanca) {
    console.log("Querying database...");
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " persons");
        var persons = [];
        for (var row = 0; row < result.getCount(); row++) {
            var id = result.getData(row,"_id"); // or _row_etag
            var id_paciente = result.getData(row,"id_paciente");
            var nome =  result.getData(row,"nome");
            var nome_casa =  result.getData(row,"nome_casa");
            var sexo =  result.getData(row,"sexo");
            var dn =  result.getData(row,"dn");
            var ano =  result.getData(row,"ano");
            var mes =  result.getData(row,"mes");
            var af =  result.getData(row,"AF");
            var numRondas = result.getData(row, 'numero_rondas')
            var p = {
                id,
                id_paciente,
                nome,
                nome_casa,
                sexo,
                dn,
                ano,
                mes,
                af,
                numRondas
            }
            console.log(p);
            persons.push(p);
        }
        populateList(persons);
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get persons from database: ' + errorMsg);
    }
    var sql = 'SELECT count(ronda.id_paciente) as numero_rondas, QPS._id, QPS.  id_paciente, nome, nome_casa, sexo, dn, ano, mes, af'
    sql = sql + ' FROM QPS INNER JOIN ronda ON QPS.id_paciente = ronda.id_paciente'
    sql = sql + ' WHERE region = "' + region + '" COLLATE NOCASE AND sector = "' + sector + '" COLLATE NOCASE AND tabanca = "' + tabanca + '" COLLATE NOCASE'
    sql = sql + ' GROUP BY ronda.id_paciente ORDER BY QPS.id_paciente';
    odkData.arbitraryQuery('QPS', sql, null, null, null, successFn, failureFn);
}

function populateList(listOfPersons) {
    var theList = $("#theList");
    console.log("Populating list with " + listOfPersons.length + " persons");
    listOfPersons.forEach(person => {
        addPersonDiv(person);
    });
}

function getSexoString(sexo) {
    if (sexo == "1" || 1) return "M";
    if (sexo == "2" || 2) return "F";
    return "?";
}

function getAgeString(person) {
    var theAdate = person.dn;
    if (!theAdate) {
        var res = (person.ano) ? person.ano : "0";
        if (person.mes) res = res + ("." + person.mes);
        return res;
    }    
    return "" + adateHelper.ageInYears(theAdate) + "." + (adateHelper.ageInMonths(theAdate) % 12);
}

function addPersonDiv(p) {    
    var nome = (p.nome_casa && p.nome_casa.length) ? nome = p.nome + " (" + p.nome_casa + ")" : p.nome;        
    $('#theList tr:last').after("<tr class='numron" + p.numRondas + "'><td>" + p.id_paciente + "</td><td>" + nome + "</td><td>" + getSexoString(p.sexo) + "</td><td>" + getAgeString(p) + "</td><td>" + p.af + "</td><td><input onclick='openPersonForm(\"" + p.id + "\")' type='button' value='&gt;&gt;'></input></td></tr>");
}

function openPersonForm(rowId) {
    var tableId = "QPS";
    var rowId = rowId;
    var formId = "QPS"; 
    odkTables.editRowWithSurvey(null, tableId, rowId, formId, null, null);
}

/* adate helper */
function getAdateHelper() {return {
    getMoment: function(aDate) {
        if (!aDate || aDate.length<4 || this.yearUnknown(aDate)) {
            return false;
        }
        aDate = aDate.toUpperCase().replace('D:NS','D:15').replace('M:NS','M:5');
        var d = moment(aDate, '\\D:DD,\\M:MM,\\Y:YYYY');
        if (d.isValid()) {
            return d;
        }
        return false;
    },
    hasUncertainty: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('NS')>-1;   
    },
    yearUnknown: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('Y:NS')>-1;
    },
    monthUnkown: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('M:NS')>-1;   
    },
    dayUnkown: function(aDate) {
        return !aDate || aDate.toUpperCase().indexOf('D:NS')>-1;
    },
    ageIn: function(aDate, strUnit) {
        var a = this.getMoment(aDate);
        if (!a) {
            return -9999;
        }
        return moment().diff(a,strUnit);
    },
    ageInYears: function(aDate) {
        return this.ageIn(aDate, 'years');
    },
    ageInMonths: function(aDate) {
        return this.ageIn(aDate, 'months');
    },
    ageInDays: function(aDate) {
        return this.ageIn(aDate, 'days');
    },
    diffInYears: function(aDateA, aDateB) {
        var a = this.getMoment(aDateA);
        var b = this.getMoment(aDateB);
        if (!a || !b) {
            return -9999;
        }
        return b.diff(a,'years');
    }
}};