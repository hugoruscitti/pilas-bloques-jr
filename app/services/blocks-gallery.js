import Ember from 'ember';

export default Ember.Service.extend({

  start() {
    this._definirBloques();
    this._generarLenguaje();
  },

  _definirBloques() {

    Blockly.Blocks['decir'] = {
      init: function() {
        this.jsonInit({
          "message0": 'Decir %1',
          "args0": [
            {
              "type": "input_value",
              "name": "mensaje",
              "check": "String"
            }
          ],
          "previousStatement": true,
          "nextStatement": true,
          "colour": 160
        });
      }
    };

    Blockly.Blocks['esperar'] = {
      init: function() {
        this.jsonInit({
          "message0": 'Esperar %1 segundos',
          "args0": [
            {
              "type": "input_value",
              "name": "segundos",
              "check": "Number"
            }
          ],
          "previousStatement": true,
          "nextStatement": true,
          "colour": 160
        });
      }
    };

    Blockly.Blocks['saltar'] = {
      init: function() {
        this.jsonInit({
          "message0": 'Saltar',
          "previousStatement": true,
          "nextStatement": true,
          "colour": 160
        });
      }
    };

    Blockly.Blocks['consumir'] = {
      init: function() {
        this.jsonInit({
          "message0": 'Consumir',
          "previousStatement": true,
          "nextStatement": true,
          "colour": 160
        });
      }
    };

    Blockly.Blocks['al_empezar_a_ejecutar'] = {
      init: function() {
        this.setColour(200);

        this.appendDummyInput().appendField('Al empezar a ejecutar');

        this.appendStatementInput('program');
        this.setDeletable(false);

        this.setEditable(false);
        this.setMovable(false);
      }
    };


    Blockly.Blocks['caminar_hacia_la_derecha'] = {
      init: function() {
        this.jsonInit({
          "message0": 'CaminarHaciaLaDerecha',
          "previousStatement": true,
          "nextStatement": true,
          "colour": 160
        });
      }
    };

    Blockly.Blocks['decir_posicion'] = {
      init: function() {
        this.jsonInit({
          "message0": 'DecirPosicion',
          "previousStatement": true,
          "nextStatement": true,
          "colour": 160
        });
      }
    };

  },

  _generarLenguaje() {

    Blockly.MyLanguage = Blockly.JavaScript;

    Blockly.MyLanguage['decir'] = function(block) {
      let mensaje = Blockly.MyLanguage.valueToCode(block, 'mensaje') || null;

      if (!mensaje) {
        console.warn("No se especificó el mensaje, mostrando 'Sin mensaje ...'");
        mensaje = "'Sin mensaje ...'";
      }

      return `hacer(actor_id, "DecirMensaje", {mensaje: ${mensaje}});`;
    };

    Blockly.MyLanguage['esperar'] = function(block) {
      var segundos = Blockly.MyLanguage.valueToCode(block, 'segundos') || null;

      if (!segundos) {
        console.warn("No se especificó la cantidad de segundos a esperar, aplicando el valor por omisión 1.");
        segundos = '1';
      }

      return `hacer(actor_id, "EsperarSegundos", {segundos: ${segundos}});`;
    };

    Blockly.MyLanguage['saltar'] = function(/*block*/) {
      return `hacer(actor_id, "SaltarNuevo", {});`;
    };

    Blockly.MyLanguage['consumir'] = function() {
      return `hacer(actor_id, "Consumir", {});`;
    };

    Blockly.MyLanguage['caminar_hacia_la_derecha'] = function() {
      return `hacer(actor_id, "CaminarHaciaLaDerecha", {});`;
    };

    Blockly.MyLanguage['decir_posicion'] = function() {
      return `hacer(actor_id, "DecirPosicion", {});`;
    };

    Blockly.MyLanguage['al_empezar_a_ejecutar'] = function(block) {
      let programa = Blockly.JavaScript.statementToCode(block, 'program');
      let codigo = `${programa}`;

      return codigo;
    };

    // Blockly.MyLanguage.STATEMENT_PREFIX = 'highlightBlock(%1);\n';
    // Blockly.MyLanguage.addReservedWords('highlightBlock');
  }

});
