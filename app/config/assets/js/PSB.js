'use strict';
/* global $, odkTables */
/* exported display */

/**
 * Responsible for rendering the home screen.
 */
function display() {
	
    var body = $('#main');
    // Set the background to be a picture.
    body.css('background-image', 'url(img/logo_psb.jpg)');

    var verFormularioButton = $('#abrir-formularios');
    verFormularioButton.on(
        'click',
        function()  {
            odkTables.addRowWithSurvey(null,
                'Avaliacao_qps',
                'Avaliacao_qps',
                null,
                null);

        }
    );

    var sendDataButton = $('#enviar-dados');
    sendDataButton.on(
        'click',
        function() {
            odkCommon.doAction(null, "org.opendatakit.services.sync.actions.activities.SyncActivity", {"componentPackage": "org.opendatakit.services", "componentActivity": "org.opendatakit.services.sync.actions.activities.SyncActivity"});
            {
                document.getElementById("wrapper").appendChild(sendDataButton)
            }
        }
    );

    var editarButton = $('#editar');
    editarButton.on(
        'click',
        function() {
            odkTables.openTableToListView(
				null,
                'Avaliacao_qps',
                'Avaliacao_qps',
                null,
                null,
                'config/tables/Avaliacao_qps/html/Avaliacao_qps_list.html');
        }
    );
}
