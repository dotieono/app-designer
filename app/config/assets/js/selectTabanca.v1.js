/**
 * Responsible for rendering the select region/sector/tabanca screen.
 */
'use strict';
/* global odkTables, util, odkCommon, odkData */

var selRegion, selSector, selTabanca, btnGo;

function display() {
    var v = "v1";
    alert(v);
    console.log(v);

    doSanityCheck();
    hookUp();

    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/bafata.jpg)');

    
}
function hookUp() {
    selRegion = $('#selRegion');
    selSector = $('#selSector');
    selTabanca = $('#selTab');
    btnGo = $('#btnGo');

    selSector.on('change', selSectorChange);
    selRegion.on('change', selRegionChange);
    selTabanca.on('change', selTabChange);
    btnGo.on('click', goToList);
}

function selRegionChange() {
    resetSelects();
    var region = selRegion.val();
    var sectors = getSectors(region);
    populateSelect(selSector, sectors);
    selSector.removeAttr("disabled");
}


function getSectors(region) {
    console.log("Querying database");
    var successFn = function( result ) {
        console.log("Got results " + result.getCount());
        var sectors = [];
        for (var row = 0; row < result.getCount(); row++) {
            sectors.push(result.getData(row,"sector"));
        }
        return sectors;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get regions from database: ' + errorMsg);
    }
    odkData.arbitraryQuery('QPS', "SELECT DISTINCT sector FROM QPS WHERE region = '" + selRegion.val() + "' COLLATE NOCASE", null, null, null, successFn, failureFn);
}
function getTabancas(region, sector) {
    console.log("Getting tabancas from db");
    var successFn = function( result ) {
        var tabancas = [];
        for (var row = 0; row < result.getCount(); row++) {
            tabancas.push(result.getData(row,"tabanca"));
        }
        return tabancas;
    }
    var failureFn = function( errorMsg ) {
        console.error('Failed to get tabancas from database: ' + errorMsg);
    }
    odkData.arbitraryQuery('QPS', "SELECT DISTINCT tabanca FROM QPS WHERE region = '" + selRegion.val() + "' AND sector = '" + sector + "' COLLATE NOCASE", null, null, null, successFn, failureFn);
}

function selSectorChange() {
    var region = selRegion.val();
    var sector = selSector.val();
    var tabancas = getTabancas(region, sector);
    populateSelect(selTabanca, tabancas);
    selTabanca.removeAttr("disabled");
}

function selTabChange() {
    console.log("Go ahead with " + selTabanca.val());
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
    selSector.empty();
    selTabanca.empty();
    btnGo.attr("disabled","disabled");
    selSector.attr("disabled","disabled");
    selTabanca.attr("disabled","disabled");
}

function goToList() {
    var selected_region = selRegion.val();
    var selected_sector = selSector.val();
    var selected_tabanca = selTabanca.val();
    
    odkCommon.setSessionVariable("selected_region", selected_region);
    odkCommon.setSessionVariable("selected_sector", selected_sector);
    odkCommon.setSessionVariable("selected_tabanca", selected_tabanca);

    var queryParam = util.getKeysToAppendToColdChainURL(selected_region, selected_sector, selected_tabanca);
    odkTables.launchHTML(null,'config/assets/listPersons.html' + queryParam);
}


function doSanityCheck() {
    console.log("Checking things");
    console.log(odkData);
}