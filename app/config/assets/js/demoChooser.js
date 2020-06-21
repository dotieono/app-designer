
/* global $, odkTables, odkCommon */
/* exported display */
"use strict";

var currentTab = 1;

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
        fileUri = odkCommon.getFileAsUrl('config/assets/img/bafata.JPG');
        descriptionDiv.text('Para agente de saude comunitaria ou pessoais de saude que vao fazer seguimento de casos.');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#visitaTab');
    }  else if (tab === 2) {
        fileUri = odkCommon.getFileAsUrl('config/assets/img/lab.JPG');
        descriptionDiv.text('Para introducao de resultados de laboratorio.');
        descriptionDiv.attr('class','description-text-black');
        tabItem = $('#labTab');
    }else {
        console.error('unrecognized tab index: ' + tab);
    }
    $('body').css('background-image', 'url(' + fileUri + ')');
    tabItem.addClass('active');
}
