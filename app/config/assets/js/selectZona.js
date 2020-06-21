/**
 * Responsible for rendering the select region/centro saude/tabanca/zona screen.
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */

var selRegion, selCentro, selTabanca, selZona, btnGo;

function display() {
    doSanityCheck();
    hookUp();

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/bafata.jpg)');

}

function hookUp() {
    selRegion = $('#selRegion');
    selCentro = $('#selCentro');
    selTabanca = $('#selTab');
    selZona = $('#selZona')
    btnGo = $('#btnGo');

    selRegion.on('change', getCentros);
    selCentro.on('change', getTabancas);
    selTabanca.on('change', getZonas);
    selZona.on('change', selZonaChange);
    btnGo.on('click', goToList);
}

function getCentros() {
    resetSelects();
    var region = selRegion.val();
    var selectElement = selCentro;
    var tableName = "inclusao";
    var columnName = "cs";
    var sqlCmd = "SELECT DISTINCT " + columnName + " FROM " + tableName + " WHERE region = '" + region + "' COLLATE NOCASE ORDER BY " + columnName;
    
    console.log("Querying database for centros de saude using SQL: ", sqlCmd);

    var successFn = function( result ) {
        console.log("Got results " + result.getCount());
        var results = [];
        for (var row = 0; row < result.getCount(); row++) {
            var resultData = result.getData(row, columnName);
            console.log("Got = " + resultData);
            if (resultData) {
                results.push(resultData);
            }
        }
        
        populateSelect(selectElement, results);        
        console.log("Returning " + results.length + " results");
        selectElement.removeAttr("disabled");
        return results;
    }

    var failureFn = function( errorMsg ) {
        console.error('Failed to get regions from database: ' + errorMsg);
    }
    odkData.arbitraryQuery(tableName, sqlCmd, null, null, null, successFn, failureFn);
}


function getTabancas() {
    var region = selRegion.val();
    var centro = selCentro.val();    
    var selectElement = selTabanca;
    var tableName = "inclusao";
    var columnName = "tab_bairro";
    var sqlCmd = "SELECT DISTINCT " + columnName + " FROM " + tableName + " WHERE region = '" + region + "' COLLATE NOCASE AND cs = '" + centro + "' COLLATE NOCASE ORDER BY " + columnName;
    
    console.log("Querying database for tabancas/bairros using SQL: ", sqlCmd);
    
    var successFn = function( result ) {
        console.log("Got results " + result.getCount());
        var results = [];
        for (var row = 0; row < result.getCount(); row++) {
            var resultData = result.getData(row, columnName);
            console.log("Got = " + resultData);
            if (resultData) {
                results.push(resultData);
            }
        }
        
        populateSelect(selectElement, results);        
        console.log("Returning " + results.length + " results");
        selectElement.removeAttr("disabled");
        return results;
    }

    var failureFn = function( errorMsg ) {
        console.error('Failed to get regions from database: ' + errorMsg);
    }
    odkData.arbitraryQuery(tableName, sqlCmd, null, null, null, successFn, failureFn);
}

function getZonas() {    
    var region = selRegion.val();
    var centro = selCentro.val();
    var tabanca = selTabanca.val();        
    var selectElement = selZona;
    var tableName = "inclusao";
    var columnName = "zona";
    var sqlCmd = "SELECT DISTINCT " + columnName + " FROM " + tableName + " WHERE region = '" + region + "' COLLATE NOCASE AND cs = '" + centro + "' COLLATE NOCASE AND tab_bairro = '" + tabanca + "' COLLATE NOCASE ORDER BY " + columnName;
    
    console.log("Querying database using SQL: ", sqlCmd);
    
    var successFn = function( result ) {
        console.log("Got results " + result.getCount());
        var results = [];
        for (var row = 0; row < result.getCount(); row++) {
            var resultData = result.getData(row, columnName);
            console.log("Got = " + resultData);
            if (resultData) {
                results.push(resultData);
            }
        }
        
        populateSelect(selectElement, results);        
        console.log("Returning " + results.length + " results");
        selectElement.removeAttr("disabled");
        return results;
    }

    var failureFn = function( errorMsg ) {
        console.error('Failed to get zonas from database: ' + errorMsg);
    }
    odkData.arbitraryQuery(tableName, sqlCmd, null, null, null, successFn, failureFn);
}

function selZonaChange() {
    console.log("Go ahead with zona: " + selTabanca.val());
    btnGo.removeAttr("disabled");
}

function populateSelect(sel, list) {
    console.log("Populating with...");
    console.log(list);
    console.log("that");
    sel.append($("<option />").val("").text("-")); // Add empty option
    $.each(list, function() {
        sel.append($("<option />").val(this).text(this));
    });
}

function resetSelects() {
    selCentro.empty();
    selTabanca.empty();
    selZona.empty();
    btnGo.attr("disabled","disabled");
    selCentro.attr("disabled","disabled");
    selTabanca.attr("disabled","disabled");
    selZona.attr("disabled","disabled");
}

function goToList() {
    var selected_region = selRegion.val();
    var selected_sector = selCentro.val();
    var selected_tabanca = selTabanca.val();

    // This is not retained between pageloads
    // odkCommon.setSessionVariable("selected_region", selected_region);
    // odkCommon.setSessionVariable("selected_sector", selected_sector);
    // odkCommon.setSessionVariable("selected_tabanca", selected_tabanca);
    alert('problem ahead');
    var queryParams = util.setQuerystringParams(selected_region, selected_sector, selected_tabanca);
    odkTables.launchHTML(null,'config/assets/listPersons.html' + queryParams);
}


function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}