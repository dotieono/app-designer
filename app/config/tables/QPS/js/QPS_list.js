/**
 * This is the file that will be creating the list view.
 */
/* global $, odkTables, odkData, odkCommon */
/*exported display, handleClick, getResults */
'use strict';

var codigo = {};

/** Handles clicking on a list item. Applied via a string. */
function handleClick(index) {
    if (!$.isEmptyObject(codigo)) {
        odkTables.openDetailView(null,
            codigo.getTableId(),
            index,
            'config/tables/QPS/html/QPS_detail.html');
    }

}

function cbSRSuccess(searchData) {
    console.log('cbSRSuccess data is' + searchData);
    if(searchData.getCount() > 0) {
        // open filtered list view if client found
        var rowId = searchData.getRowId(0);
        odkTables.openTableToListView(null,
                'QPS',
                '_id = ?',
                [rowId],
                'config/tables/QPS/html/QPS_list.html');
    } else {
        document.getElementById("search").value = "";
        document.getElementsByName("query")[0].placeholder="Paciente nao encontrado";
    }
}

function cbSRFailure(error) {
    console.log('QPS_list: cbSRFailure failed with error: ' + error);
}

// filters list view by client id entered by user
function getResults() {
    var searchText = document.getElementById('search').value;

    odkData.query('QPS', 'id_paciente = ?', [searchText], 
        null, null, null, null, null, null, true, cbSRSuccess, cbSRFailure);
}
var listQuery = 'SELECT * FROM QPS';
function resumeFunc(state) {
    if (state === 'init') {
        // set the parameters for the list view
        listViewLogic.setTableId('QPS');
        listViewLogic.setFormId('inscricao');
        listViewLogic.setFormId('ronda_1');
        listViewLogic.setFormId('ronda_2');
        listViewLogic.setFormId('ronda_3');
        listViewLogic.setFormId('ronda_4');
        listViewLogic.setListQuery(listQuery);
        listViewLogic.setListElement('#list');
        listViewLogic.setSearchTextElement('#search');
        listViewLogic.setLimitElement('#limitDropdown');
        listViewLogic.setPrevAndNextButtons('#prevButton', '#nextButton');
        listViewLogic.setNavTextElements('#navTextLimit', '#navTextOffset', '#navTextCnt');
        listViewLogic.showEditAndDeleteButtons(false);
     
        listViewLogic.setColIdsToDisplayInList(null, 'id_paciente',
        		'Região', 'region', null, 'RELA1NOME', 
        		'Sector', 'sector', null, 'RELA2NOME',
        		'Tabanca', 'local', 'Casa', 'af', 'Nome da mae', 'mae');
    }

    listViewLogic.resumeFn(state);
}
// displays list view of clients
function render() {

    // create button that adds enrolled client to the system - launches mini
    // 'add client' form
    var inscricao = document.createElement('p');
    inscricao.onclick = function() {
        odkTables.addRowWithSurvey(null,
                'QPS',
                'inscricao',
                null,
                null);
    };
    inscricao.setAttribute('class', 'launchForm');
    inscricao.innerHTML = 'inscricao';
    document.getElementById('searchBox').appendChild(inscricao);

    /* create button that launches graph display */
//     var graphView = document.createElement('p');
//     graphView.onclick = function() {
//         odkTables.openTableToListView(null,
//                 'femaleClients',
//                 null,
//                 null,
//                 'config/tables/QPS/html/graph_view.html');
//     };
//     graphView.setAttribute('class', 'launchForm');
//     graphView.innerHTML = 'Graph View';
//     document.getElementById('searchBox').appendChild(graphView);

    {for (var i = 0; i < QPS.getCount(); i++) {

        var codigoId = QPS.getData(i, 'id_paciente');
        var nomeEntered = QPS.getData(i, 'nome');
        var sexo = QPS.getData(i, 'sexo');

        // make list entry only if client id, age, randomization arm exists
        if (codigoId !== null &&
            codigoId !== '' &&
            nomeEntered !== null &&
            nomeEntered !== '' &&
            sexo !== null &&
            sexo !== '') {
            /*    Creating the item space    */
            var item = document.createElement('li');
            item.setAttribute('class', 'item_space');
            item.setAttribute(
                    'onClick',
                    'handleClick("' + codigo.getRowId(i) + '")');
            item.innerHTML = codigoId;
            document.getElementById('list').appendChild(item);

            // var chevron = document.createElement('img');
            // chevron.setAttribute(
            //         'src',
            //         odkCommon.getFileAsUrl('config/assets/img/little_arrow.png'));
            // chevron.setAttribute('class', 'chevron');
            // item.appendChild(chevron);

            // create sub-list in item space
            //  Age information
            // var age = document.createElement('li');
            // age.setAttribute('class', 'detail');
            // age.innerHTML = 'Age: ' + ageEntered;
            // item.appendChild(age);

            //  Randomization Arm
            // var arm = document.createElement('li');
            // arm.setAttribute('class', 'detail');
            // if(armText === '1') {
            //     armText = 'HOPE';
            // } else if(armText === '2') {
            //     armText = 'Control';
            // }
            // arm.innerHTML = 'Randomization: ' + armText;
            // item.appendChild(arm);
                }
            }
        }
    }

function cbSuccess(result) {
    QPS = result;
    render();
}

function cbFailure(error) {
    console.log('QPS_list: failed with error: ' + error);
}

function display() {
    odkData.getViewData(cbSuccess, cbFailure);
}
