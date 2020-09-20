/**
 * Responsible for rendering the list of perons
 */
'use strict';
/* global odkTables, util, odkCommon, odkData, odkSurvey */

function display() {
    window.adateHelper = getAdateHelper();

    console.log("Setting up display");

    $("#btnSearch").on("click", function() {
        doSearch($("#txtCodigo").val())
        return false;
    });
}

function showNotFound() {
    alert("Computer says no!");
}

function doSearch(codigo)  {    
    if (!codigo || codigo.length<2) return;

    var successFn = function( result ) {                
        console.log("Found " + result.getCount() + " persons");

        if (result.getCount() != 1) {
            showNotFound();
            return;
        }

        var id_formsQPS = result.getData(0, "_id");
        var id_paciente = result.getData(0, "id_paciente");
        var nome =  result.getData(0, "nome");
        var nome_casa =  result.getData(0, "nome_casa");
        var sexo =  result.getData(0, "sexo");
        var dn =  result.getData(0, "dn");
        var ano =  result.getData(0, "ano");
        var mes =  result.getData(0, "mes");
        var af =  result.getData(0, "AF");
        
        var p = {
            id_formsQPS,
            id_paciente,
            nome,
            nome_casa,
            sexo,
            dn,
            ano,
            mes,
            af
        }          

        addPersonForm(p);
        return;
    }

    var failureFn = function( errorMsg ) {
        console.error('Failed to get persons from database: ' + errorMsg);
        alert(errorMsg);
    }

    var fields = '_id, dn, sexo, nome, ano, mes, nome_casa, id_paciente, AF';
    var sql = 'SELECT ' + fields + ' FROM QPS WHERE id_paciente = "' + codigo + '" COLLATE NOCASE';         
    codigo = codigo.trim().replace(/"/g,'').toUpperCase().replace(/O/g,'0').replace(/L/g,'1').replace(/I/g,'1');
    console.log("Querying database for: " + sql);
    odkData.arbitraryQuery('QPS', sql, null, null, null, successFn, failureFn);
}

function addPersonForm(person) {
    var tableId = "ronda";
    var formId = "ronda"; 
    var dispatchStruct = null;
    var screenPath = null;
    var jsonMap = getJsonMap(person);
    odkTables.addRowWithSurvey(dispatchStruct,tableId, formId, screenPath, jsonMap);

}
function getJsonMap(person) {
    console.log("Sending following data:");
    console.log(person);      

    return person;
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
    },
    diffInDays: function(aDateA, aDateB) {
        var a = this.getMoment(aDateA);
        var b = this.getMoment(aDateB);
        if (!a || !b) {
            return -9999;
        }
        return b.diff(a,'days');
    }            
}};

