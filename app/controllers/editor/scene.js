import Ember from 'ember';

export default Ember.Controller.extend({
  pilas: Ember.inject.service(),
  remodal: Ember.inject.service(),
  currentActor: '',
  currentWorkspace: '', // Almacena el workspace mientras se modifica. El valor
                        // de esta propiedad sustituirá a currentActor.workspaceXMLCode
                        // cuando se guarde, ejecute o cambie de actor.
                        //
                        // (ver el método sincronizarWorkspaceAlActorActual)

  blocksForCurrentActor: Ember.computed.alias('currentActor.class.blocks'),
  workspaceFromCurrentActor: Ember.computed.alias('currentActor.workspaceXMLCode'),

  sincronizarDesdePilasAModelos() {
    // Guarda en el modelo de datos de ember todos los atributos de cada actor.
    // (esta sincronización realiza antes de guardar el proyecto)
    this.model.get('actors').forEach((actor) => {
      let objetoActor = this.obtenerObjectoActorDesdePilas(actor);
      actor.set('x', objetoActor.x);
      actor.set('y', objetoActor.y);
    });
  },

  obtenerObjectoActorDesdePilas(registroActor) {
    let actorId = registroActor.get('actorId');
    return this.get('pilas').evaluar(`pilas.obtener_actor_por_id("${actorId}")`);
  },

  crearActor(claseDeActor) {
    let clase = claseDeActor.get('className');
    let actor = this.get("pilas").evaluar(`
      var actor = new pilas.actores['${clase}'];
      actor;
    `);

    let actorId = actor.id;
    let data = actor.serializar();

    let record = this.store.createRecord('actor', {
      class: claseDeActor,
      actorId: actorId,
      x: data.x,
      y: data.y,
      workspaceXMLCode: '<xml xmlns="http://www.w3.org/1999/xhtml"><block type="al_empezar_a_ejecutar" id="aF,i.tK-O(jDm1^GT4bP" deletable="false" x="90" y="40"></block></xml>',
      scene: this.model
    });

    record.save().then(() => {
      claseDeActor.get('actors').pushObject(record);
      claseDeActor.save();

      this.send('onSelect', record);
    });
  },

  sincronizarWorkspaceAlActorActual() {
    if (this.get('currentActor') && ! this.get('currentActor').get('isDeleted')) {
      this.set('currentActor.workspaceXMLCode', this.get('currentWorkspace'));
    }
  },

  eliminarActor(actor) {
    let objetoActor = this.obtenerObjectoActorDesdePilas(actor);
    objetoActor.eliminar();
    return actor.destroyRecord();
  },

  preSeleccionarPrimerActor() {
    this.store.findAll('actor').then(actores => {
      let primerActor = actores.get('firstObject');

      if (primerActor) {
        this.send('onSelect', primerActor);
      } else {
        this.set('currentActor', null);
        this.set('currentWorkspace', '');
      }
    });
  },

  actions: {

    onReady(/*pilas*/) {
      this.get("pilas").sustituirFondo(this.model.get('background'));

      this.model.get('actors').then((data) => {
        data.forEach((actor) => {

          actor.get("class").then(() => {
            let data = actor.getProperties("class.className", "x", "y", "actorId");
            let className = actor.get("class.className");

            this.get("pilas").evaluar(`
              actor = new pilas.actores['${className}']();
              actor.x = ${data.x};
              actor.y = ${data.y};
              actor.id = '${data.actorId}';
            `);
          });
        });

        this.get("pilas").evaluar(`pilas.definir_modo_edicion(true);`);
      });


      this.get("pilas").on('comienzaAMoverUnActor', (evento) => {
        this.store.findAll('actor').then((actores) => {
          actores.forEach((actor) => {
            if (actor.get('actorId') === evento.actorID) {
              this.set('currentActor', actor);
            }
          });
        });
      });
    },

    abrirModalFondo() {
      this.get('remodal').open('pilas-modal-fondo');
    },

    abrirModalActores() {
      this.get('remodal').open('pilas-modal-actores');
    },

    cuandoSeleccionaFondo(fondo) {
      let nombreCompletoDelFondo = fondo.get('fullName');

      this.get("pilas").sustituirFondo(nombreCompletoDelFondo);
      this.model.set('background', nombreCompletoDelFondo);
      this.get('remodal').close('pilas-modal-fondo');
    },

    cuandoSeleccionaActor(claseDeActor) {
      this.sincronizarWorkspaceAlActorActual();
      this.crearActor(claseDeActor);
      this.get('remodal').close('pilas-modal-actores');
    },

    onSelect(actor) {
      this.sincronizarWorkspaceAlActorActual();
      this.get("pilas").descatarAlActorPorId(actor.get('actorId'));
      this.set('currentActor', actor);
    },

    onRemove(actor) {
      this.eliminarActor(actor).then(() => {
        this.preSeleccionarPrimerActor();
      });
    },

    onChangeWorkspace(workspace) {
      this.set('currentWorkspace', workspace);
    },

  }
});
