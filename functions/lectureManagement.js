const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const firebase = require('firebase');

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.addLecture = addLecture;

function addLecture(agent) {
    let personalPlan = agent.getContext('personalplan');
    let aLectures, sLectureToAdd;

    if (personalPlan != null) {
        aLectures = personalPlan.parameters.lectures;
        if (aLectures == null) aLectures = '';
    } else {
        aLectures = '';
    }

    if (personalPlan != null) {
        agent.add('DEBUG: ' + typeof aLectures + ' ' + aLectures.toString());
        agent.add(personalPlan.parameters.toString());
    } else {
        agent.add('alecture is undefined');
    }

    sLectureToAdd = agent.parameters['Vorlesung'];

    if (sLectureToAdd != null && sLectureToAdd !== '') {
        aLectures += ',' + sLectureToAdd;
        agent.add(sLectureToAdd + ' hinzugefügt. (Muss beim fertigstellen gespeichert werden)');
    }


    let context = {
        name: 'personalplan',
        lifespan: 100,
        parameters: {}
    };

    context.parameters['lectures'] = aLectures;

    agent.setContext(context);


    agent.add('Aktueller Plan: ' + aLectures);
    agent.add('Folgende Möglichkeiten: Speichern, Vorlesung hinzufügen (Vorlesung kann mit gwünschter vorlesung ersetzt werden), Abbrechen (und alles verwerfen)');
    agent.add(new Suggestion('Speichern'));
    agent.add(new Suggestion('Programmieren 1 Hinzufügen'));
    agent.add(new Suggestion('Abbrechen'));
}
