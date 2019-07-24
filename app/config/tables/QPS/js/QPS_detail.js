/**
 * The file for displaying a detail view.
 */
/* global $, odkTables, odkData */
'use strict';

var codigoId;

function createFormLauncherForEdit(tableId, formId, rowId, label, element) {
    var formLauncher = document.createElement('p');
    formLauncher.setAttribute('class', 'forms');
    formLauncher.innerHTML = label;
    formLauncher.onclick = function() {
        odkTables.editRowWithSurvey(
				null,
                tableId,
                rowId,
                formId,
                null);
    };
    element.appendChild(formLauncher);
}

function createFormLauncherForAdd(tableId, formId, elementKeyToValueMap, label, element) {
    var formLauncher = document.createElement('p');
    formLauncher.setAttribute('class', 'forms');
    formLauncher.innerHTML = label;
    formLauncher.onclick = function() {
        odkTables.addRowWithSurvey(
				null,
                tableId,
                formId,
                null,
                elementKeyToValueMap);
    };
    element.appendChild(formLauncher);
}

// Displays details about client and links to various forms
function display(result) {

    // Details - Client id, age, randomization arm
    codigoId = result.get('id_paciente');
    document.getElementById('title').innerHTML =codigoId;
    document.getElementById('nome').innerHTML = result.get('nome');
    document.getElementById('mae').innerHTML = result.get('mae')
    // var armText = result.get('randomization');
    // if(armText === '1') {
    //     armText = 'HOPE';
    // } else if(armText === '2') {
    //     armText = 'odkTables';
    // }
    // document.getElementById('arm').innerHTML = armText;

    // Creates key-to-value map that can be interpreted by the specified
    // Collect form - to prepopulate forms with client id
    var elementKeyToValueMapMaleId = {id_paciente: codigoId};

    // Create item that displays links to all female forms when clicked
    var fItem = document.createElement('p');
    fItem.innerHTML = 'QPS';
    fItem.setAttribute('class', 'heading');

    var fContainer = document.createElement('div');
    fContainer.setAttribute('class', 'detail_container');

    var homeLocator = document.createElement('p');
    homeLocator.setAttribute('class', 'forms');
    homeLocator.innerHTML = 'Home Locator';
    // When we open the geopoints file, we want to communicate the client id so
    // that the file will know whose data it is displaying. We're going to do
    // this using a hash.
    console.log('in this particularly XXXXXXXXX file!');
    $(homeLocator).click(function() {
        console.log('In homeLocator click id is ' + codigoId);
        odkTables.openTableToListView(
			null,
            'geopoints',
            'id = ?',
            ['' + codigoId],
            'config/tables/geopoints/html/geopoints_list.html#' + codigoId);
    });
    fContainer.appendChild(homeLocator);

    var rowId = result.getRowId(0);
    console.log('rowId: ' + rowId);
    createFormLauncherForEdit(
            'QPS',
            'inscricao',
            rowId,
            'Inscricao QPS',
            fContainer);
    createFormLauncherForEdit(
            'QPS',
            'ronda_1',
            rowId,
            'Primeira ronda',
            fContainer);
    createFormLauncherForEdit(
            'QPS',
            'ronda_2',
            rowId,
            'Segunda Ronda',
            fContainer);
    createFormLauncherForEdit(
            'QPS',
            'ronda_3',
            rowId,
            'Terceira Ronda',
            fContainer);
    createFormLauncherForEdit(
            'QPS',
            'ronda_4',
            rowId,
            'Quarta Ronda',
            fContainer);
    $(fContainer).hide();
    $(fItem).click(function() {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $(this).addClass('selected');
        }
        $(this).next(fContainer).slideToggle('slow');
    });

    // Create item that displays links to all male forms when clicked
    // var mItem = document.createElement('p');
    // mItem.innerHTML = 'Partner Forms';
    // mItem.setAttribute('class', 'heading');

    // var mContainer = document.createElement('div');
    // mContainer.setAttribute('class', 'detail_container');
    // createFormLauncherForAdd(
    //         'maleClients',
    //         'screenPartner',
    //         elementKeyToValueMapMaleId,
    //         'Partner Screening',
    //         mContainer);
    // // TODO: this should be passing the rowId of the entry in the client table,
    // // as filtered by the clientId.
    // createFormLauncherForEdit(
    //         'maleClients',
    //         'partner6Month',
    //         codigoId,
    //         'Six Month Follow-Up',
    //         mContainer);

    // $(mContainer).hide();
    // $(mItem).click(function() {
    //     if ($(this).hasClass('selected')) {
    //         $(this).removeClass('selected');
    //     } else {
    //         $(this).addClass('selected');
    //     }
    //     $(this).next(mContainer).slideToggle('slow');
    // });

    document.getElementById('wrapper').appendChild(fItem);
    document.getElementById('wrapper').appendChild(fContainer);

    // document.getElementById('wrapper').appendChild(mItem);
    // document.getElementById('wrapper').appendChild(mContainer);

}

function cbSuccess(result) {
    display(result);
}

function cbFailure(error) {
    console.log('QPS_detail: failed with error: ' + error);
}

// handles events from html page
function setup() {
    odkData.getViewData(cbSuccess, cbFailure);
}

$(document).ready(setup);


