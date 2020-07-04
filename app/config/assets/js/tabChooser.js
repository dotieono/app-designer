
/* global $, odkTables, odkCommon */
/* exported display */
"use strict";
var storedTab = localStorage.getItem("selTab");
var currentTab = /^[-]?\d+$/.test(storedTab) ? parseInt(storedTab, 10) : 1;
setTimeout(function() {
    // Update indices in database
    console.log("Creating indices in database");
    var sql = 'CREATE INDEX IF NOT EXISTS ix_codigo ON inclusao (codigo_lamina) --'; // the "--" at the end is important, since that will evade the automatically appended "LIMIT 1" that odkData insists on.. (probably we should not use arbitraryQuery for this...)
    var sql2 = 'CREATE INDEX IF NOT EXISTS ix_inc_cs ON inclusao (cs) --';
    var sql3 = 'CREATE INDEX IF NOT EXISTS ix_codigoSeg ON seguimento (codigo_lamina) --';
    var sql4 = 'CREATE INDEX IF NOT EXISTS ix_inc_estudoid ON inclusao (id_estudo) --';
    odkData.arbitraryQuery('inclusao', sql , [],null, null,idxSuccess,idxFailure);
    odkData.arbitraryQuery('inclusao', sql2 , [],null, null,idxSuccess,idxFailure);
    odkData.arbitraryQuery('seguimento', sql3 , [],null, null,idxSuccess,idxFailure);
    odkData.arbitraryQuery('inclusao', sql4 , [],null, null,idxSuccess,idxFailure);
},1000);

function idxFailure(er) { console.log("Failed to create index: " + er)}
function idxSuccess() { console.log("Created index")}

function display() { 
    updateForTab(currentTab);
    $('#centroTab').on('click', function() {
        currentTab = 0;
        updateForTab(currentTab);
    });
    $('#visitaTab').on('click', function() {
        currentTab = 1;
        updateForTab(currentTab);
    });
   $('#labTab').on('click', function() {
        currentTab = 2;
        updateForTab(currentTab);
    });

    $('#launch-button').on(
            'click',
            function() {
                if (currentTab === 0) {
                    odkTables.launchHTML(null, 'config/assets/centro.html');
                } else if (currentTab === 1) {
                    odkTables.launchHTML(null, 'config/assets/visita.html');
                } else if (currentTab === 2) {
                    odkTables.launchHTML(null, 'config/assets/lab.html');
                } else {
                    console.error('trouble, unrecognized tab');
                }
            });
}

function updateForTab(tab) {
    localStorage.setItem("selTab", tab);
    var fileUri;
    var tabItem;
    var descriptionDiv = $('#description');
    // Remove all the active-tab classes.
    $('.tab-item').removeClass('active');

    // Now add the current tab to active and update the description.
    if (tab === 0) {
        fileUri = odkCommon.getFileAsUrl('config/assets/img/centro.JPG');
        descriptionDiv.text('Exclusiva para CENTROS DE SAUDE');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#centroTab');
    } else if (tab === 1) {
        fileUri = odkCommon.getFileAsUrl('config/assets/img/lab.jpg');
        descriptionDiv.text('Para agente de saude comunitaria ou pessoais de saude que vao fazer seguimento de casos.');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#visitaTab');
    }  else if (tab === 2) {
        fileUri = odkCommon.getFileAsUrl('config/assets/img/lab.JPG');
        descriptionDiv.text('Para introducao de resultados de laboratorio.');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#labTab');
    } else {
        alert('unrecognized tab index: ' + tab);
    }
    $('#content-table').css('background-image', 'url(' + fileUri + ')');
    
    tabItem.addClass('active');
}
