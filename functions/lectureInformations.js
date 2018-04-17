const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const firebase = require('firebase');

const index = require('./index.js');

Object.defineProperty(exports, "__esModule", {
    value:true
});

exports.askForDate = askForDate;
exports.getLectures = getLectures;
exports.askForSemester = askForSemester;
exports.askForCourse = askForCourse;

function getLectures(agent) {
    let lectureInfos = new Map();

    let studiengang = '';
    let semester = '';
    let date = '';

    let parastudiengang = agent.parameters.studiengang;
    let parasemester = agent.parameters.semester;
    let paradate = agent.parameters.date;

    if (parastudiengang !== undefined) studiengang = parastudiengang;
    if (parasemester !== undefined) semester = parasemester;
    if (paradate !== undefined) date = paradate;

    let infoContext = agent.getContext('collectedinfos');

    if (infoContext !== null) {
        let contextstudiengang = infoContext.parameters.studiengang;
        let contextsemester = infoContext.parameters.semester;
        let contextdate = infoContext.parameters.date;

        if (contextstudiengang !== '' && contextstudiengang !== undefined) studiengang = contextstudiengang;
        if (contextsemester !== ''  && contextsemester !== undefined) semester = contextsemester;
        if (contextdate !== ''  && contextdate !== undefined) date = contextdate;
    }
    //
    // if(studiengang === undefined) studiengang = '';
    // if(semester === undefined) semester = '';
    // if(date === undefined) date = '';

    agent.add('preIfDATA: ');
    agent.add(typeof studiengang + ' studiengang: ' + studiengang);
    agent.add(typeof semester + ' semester: ' + semester);
    agent.add(typeof date + ' date: ' + date);

    lectureInfos.set('studiengang', studiengang);
    lectureInfos.set('semester', semester);
    lectureInfos.set('date', date);

    if (studiengang === '') {
        agent.add('Welcher Vorlesungsplan soll gesucht werden?');
        agent.add(new Suggestion('Informatik'));
        agent.add(new Suggestion('E-Commerce'));
        agent.add(new Suggestion('Wirtschafts Informatik'));
        agent.add(new Suggestion('Persönlicher Plan'));
    } else if (semester === '') {
        agent.add('Welches Semester?');
        agent.add(new Suggestion('1'));
        agent.add(new Suggestion('2'));
        agent.add(new Suggestion('3'));
        agent.add(new Suggestion('4'));
        agent.add(new Suggestion('5'));
        agent.add(new Suggestion('6'));
    } else if (date === '') {
        agent.add('Für welchen Tag?');
        agent.add(new Suggestion('Heute'));
        agent.add(new Suggestion('Morgen'));
        agent.add(new Suggestion('Übermorgen'));
        agent.add(new Suggestion('Montag'));
        agent.add(new Suggestion('Dienstag'));
        agent.add(new Suggestion('Mittwoch'));
        agent.add(new Suggestion('Donnerstag'));
        agent.add(new Suggestion('Freitag'));
        agent.add(new Suggestion('Samstag'));
        agent.add(new Suggestion('Sonntag'));
    } else {
        agent.add('Folgende infos extrahiert:');
        agent.add('Vorlesungsplan: ' + studiengang + typeof studiengang);
        agent.add('Semester: ' + semester);
        agent.add('Date: ' + date);
        agent.clearOutgoingContexts();
    }

    agent.setContext({
        name: 'collectedinfos',
        lifespan: 10,
        parameters: lectureInfos
    });
}

function askForCourse(agent) {
    let context = agent.getContext('collectedinfos');
    let lectureInfos = new Map();

    if (context !== null) {
        let date = context.parameters.date;
        let semester = context.parameters.semester;

        lectureInfos.set('date', date);
        lectureInfos.set('semester', semester);
    } else {
        lectureInfos.set('date', '');
        lectureInfos.set('semester', '');
    }

    let studiengang = agent.parameters.studiengang;
    lectureInfos.set('studiengang', studiengang);

    agent.setContext({
        name: 'collectedinfos',
        lifespan: 10,
        parameters: lectureInfos
    });
    getLectures(agent);
}

function askForSemester(agent) {
    let context = agent.getContext('collectedinfos');
    let lectureInfos = new Map();

    if (context !== null) {
        let date = context.parameters.date;
        let studiengang = context.parameters.studiengang;

        lectureInfos.set('date', date);
        lectureInfos.set('studiengang', studiengang);
    } else {
        lectureInfos.set('date', '');
        lectureInfos.set('studiengang', '');
    }

    let semester = agent.parameters.semester;
    lectureInfos.set('semester', semester);

    agent.setContext({
        name: 'collectedinfos',
        lifespan: 10,
        parameters: lectureInfos
    });

    getLectures(agent);
}

function askForDate(agent) {
    let context = agent.getContext('collectedinfos');
    let lectureInfos = new Map();

    if (context !== null) {
        let studiengang = context.parameters.studiengang;
        let semester = context.parameters.semester;

        lectureInfos.set('studiengang', studiengang);
        lectureInfos.set('semester', semester);
    } else {
        lectureInfos.set('stuidengang', '');
        lectureInfos.set('semester', '');
    }

    let date = agent.parameters.date;
    lectureInfos.set('date', date);

    agent.setContext({
        name: 'collectedinfos',
        lifespan: 10,
        parameters: lectureInfos
    });
    getLectures(agent);
}