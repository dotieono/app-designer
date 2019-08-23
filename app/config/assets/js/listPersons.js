/**
 * Responsible for rendering the list of perons
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */


function display() {
    console.log("Hello");

    var region = util.getQueryParameter("region")
    var sector  = util.getQueryParameter("sector")
    var tabanca = util.getQueryParameter("tabanca")

    listPersons(region, sector, tabanca);
    var theList = $("#theList");
    theList.text("Region = " + region + ", Sector = " + sector + ", Tabanca = " + tabanca);

}

function listPersons(region, sector, tabanca) {
    console.log("Querying database...");
    var successFn = function( result ) {
        console.log("Found " + result.getCount() + " persons");
        var persons = [];
        for (var row = 0; row < result.getCount(); row++) {
            var id_paciente = result.getData(row,"id_paciente");
            var nome =  result.getData(row,"nome");
            var nome_casa =  result.getData(row,"nome_casa");
            var sexo =  result.getData(row,"sexo");
            var dn =  result.getData(row,"dn");
            var ano =  result.getData(row,"ano");
            var mes =  result.getData(row,"mes");
            var af =  result.getData(row,"AF");
            var p = {
                id_paciente,
                nome,
                nome_casa,
                sexo,
                dn,
                ano,
                mes,
                af
            }
            console.log("Se mor jeg har fanget en frakkel: ");
            console.log(p);
            persons.push(p);
        }
        
        return;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get persons from database: ' + errorMsg);
    }
    var sql = 'SELECT id_paciente, nome, nome_casa, sexo, dn, ano, mes, af FROM QPS WHERE region = "' + region + '" COLLATE NOCASE AND sector = "' + sector + '" COLLATE NOCASE AND tabanca = "' + tabanca + '" COLLATE NOCASE ORDER BY id_paciente';
    odkData.arbitraryQuery('QPS', sql, null, null, null, successFn, failureFn);
}

function populateList(listOfPersons) {
    console.log("Populating list with " + listOfPersons.length + " persons");
    console.log("TODO");
}