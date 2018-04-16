/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// cd c:\users\Neuer\PhpstormProjects\untitled1
// gcloud beta functions deploy vorlesungsplanBot --stage-bucket vorlesungsplanbot.appspot.com --trigger-http

'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const firebase = require('firebase');

var config = {
    apiKey: "AIzaSyADFmL3IGmwvD6kRto6bHWfZy1dcQtBL2w",
    authDomain: "vorlesungsplanbot.firebaseapp.com",
    databaseURL: "https://vorlesungsplanbot.firebaseio.com",
    projectId: "vorlesungsplanbot",
    storageBucket: "vorlesungsplanbot.appspot.com",
    messagingSenderId: "604550375890"
};
firebase.initializeApp(config);

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

// Wikipedia link and image URLs
const wikipediaTemperatureUrl = 'https://en.wikipedia.org/wiki/Temperature';
const wikipediaTemperatureImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/2/23/Thermally_Agitated_Molecule.gif';
const wikipediaCelsiusUrl = 'https://en.wikipedia.org/wiki/Celsius';
const wikipediaCelsiusImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Celsius_original_thermometer.png';
const wikipediaFahrenheitUrl = 'https://en.wikipedia.org/wiki/Fahrenheit';
const wikipediaFahrenheitImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Fahrenheit_small.jpg';
const wikipediaKelvinUrl = 'https://en.wikipedia.org/wiki/Kelvin';
const wikipediaKelvinImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a0/Lord_Kelvin_photograph.jpg';
const wikipediaRankineUrl = 'https://en.wikipedia.org/wiki/Rankine_scale';
const wikipediaRankineImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/5/58/Rankine_William_signature.jpg';

exports.vorlesungsplanBot = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({request, response});
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers, undefined, 2));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body, undefined, 2));

    function welcome(agent) {
        agent.add(`Welcome to the temperature converter!`);
        agent.add(new Card({
                title: `Vibrating molecules`,
                imageUrl: wikipediaTemperatureImageUrl,
                text: `Did you know that temperature is really just a measure of how fast molecules are vibrating around?! 😱`,
                buttonText: 'Temperature Wikipedia Page',
                buttonUrl: wikipediaTemperatureUrl
            })
        );
        agent.add(`I can convert Celsuis to Fahrenheit and Fahrenheit to Celsius!`);
        agent.add(`What temperature would you like to convert?`);
        agent.add(new Suggestion(`27° Celsius`));
        agent.add(new Suggestion(`-40° Fahrenheit`));
        agent.add(new Suggestion(`Cancel`));
    }

    function convertFahrenheitAndCelsius(agent) {
        // Get parameters from Dialogflow to convert
        const temperature = agent.parameters.temperature;
        const unit = agent.parameters.unit;
        console.log(`User requested to convert ${temperature}° ${unit}`);

        let convertedTemp, convertedUnit, temperatureHistory;
        if (unit === `Celsius`) {
            convertedTemp = temperature * (9 / 5) + 32;
            convertedUnit = `Fahrenheit`;
            temperatureHistory = new Card({
                title: `Fahrenheit`,
                imageUrl: wikipediaFahrenheitImageUrl,
                text: `Daniel Gabriel Fahrenheit, invented the Fahrenheit scale (first widely used, standardized temperature scale) and the mercury thermometer.`,
                buttonText: 'Fahrenheit Wikipedia Page',
                buttonUrl: wikipediaFahrenheitUrl
            });
        } else if (unit === `Fahrenheit`) {
            convertedTemp = (temperature - 32) * (5 / 9);
            convertedUnit = `Celsius`;
            temperatureHistory = new Card({
                title: `Celsius`,
                imageUrl: wikipediaCelsiusImageUrl,
                text: `The original Celsius thermometer had a reversed scale, where 100 is the freezing point of water and 0 is its boiling point.`,
                buttonText: 'Celsius Wikipedia Page',
                buttonUrl: wikipediaCelsiusUrl
            });
        }

        // Sent the context to store the parameter information
        // and make sure the followup Rankine
        agent.setContext({
            name: 'temperature',
            lifespan: 1,
            parameters: {temperature: temperature, unit: unit}
        });

        // Compile and send response
        agent.add(`${temperature}° ${unit} is  ${convertedTemp}° ${convertedUnit}`);
        agent.add(temperatureHistory);
        agent.add(`Would you like to know what this temperature is in Kelvin or Rankine?`);
        agent.add(new Suggestion(`Kelvin`));
        agent.add(new Suggestion(`Rankine`));
        agent.add(new Suggestion(`Cancel`));
    }

    function convertRankineAndKelvin(agent) {
        const secondUnit = agent.parameters.absoluteTempUnit;
        const tempContext = agent.getContext('temperature');
        const originalTemp = tempContext.parameters.temperature;
        const originalUnit = tempContext.parameters.unit;

        // Convert temperature
        let convertedTemp, convertedUnit, temperatureHistoryText, temperatureHistoryImage;
        if (secondUnit === `Kelvin`) {
            convertedTemp = originalTemp === 'Celsius' ? originalTemp + 273.15 : (originalTemp - 32) * (5 / 9) + 273.15;
            convertedUnit = `Kelvin`;
            temperatureHistoryText = new Text('Here is a picture of the namesake of the Rankine unit, William John Macquorn Rankine:');
            temperatureHistoryImage = new Image(wikipediaKelvinImageUrl);
        } else if (secondUnit === `Rankine`) {
            convertedTemp = originalTemp === 'Fahrenheit' ? originalTemp + 459.67 : originalTemp * (9 / 5) + 32 + 459.67;
            convertedUnit = `Rankine`;
            temperatureHistoryText = new Text('Here is a picture of the namesake of the Kelvin unit, Lord Kelvin:');
            temperatureHistoryImage = new Image(wikipediaRankineImageUrl);
        }

        // Set `temperature` context lifetime to zero
        // to reset the conversational state and parameters
        agent.setContext({name: 'temperature', lifespan: 0});

        // Compile and send response
        agent.add(`${originalTemp}° ${originalUnit} is  ${convertedTemp}° ${convertedUnit}`);
        agent.add(temperatureHistoryText);
        agent.add(new Image(temperatureHistoryImage));
        agent.add(`Go ahead and say another temperature to get the conversion.`);
        agent.add(new Suggestion(`27° Celsius`));
        agent.add(new Suggestion(`-40° Fahrenheit`));
        agent.add(new Suggestion(`Cancel`));
    }

    function addLecture(agent) {
        let personalPlan = agent.getContext('personalPlan');
        let i, aLectures, sLectureToAdd;

        if (personalPlan !== null) {
            i = personalPlan.parameters.i;
            aLectures = personalPlan.parameters.lectures;
        } else {
            i = 0;
            aLectures = [];
        }

        sLectureToAdd = agent.parameters.Vorlesung;

        if (sLectureToAdd !== null) {
            aLectures.push(sLectureToAdd);

        }
        let parameterMap = new Map();
        parameterMap.set('i', i);
        parameterMap.set('lectures', aLectures);

        agent.setContext({
            name: 'personalPlan',
            lifespan: 100,
            parameters: parameterMap
        });

        agent.add(sLectureToAdd + ' hinzugefügt. (Muss beim fertigstellen gespeichert werden)');
    }

    function getLectures(agent) {
        let lectureInfos = new Map();

        let course = agent.parameters.studiengang;
        let semester = agent.parameters.semester;
        let date = agent.parameters.date;

        let infoContext = agent.getContext('collectedinfos');
        
        if(infoContext !== null) {
            if (course === '') course = infoContext.parameters.studiengang;
            if (semester === '') semester = infoContext.parameters.semester;
            if (date === '') date = infoContext.parameters.date;
        }

        lectureInfos.set('course', course);
        lectureInfos.set('semester', semester);
        lectureInfos.set('date', date);





        if (course === '') {
            agent.add('Welcher Vorlesungsplan soll gesucht werden?');
            agent.add(new Suggestion('Informatik'));
            agent.add(new Suggestion('E-Commerce'));
            agent.add(new Suggestion('Wirtschafts Informatik'));
            agent.add(new Suggestion('Persönlicher Plan'));
            // agent.setFollowupEvent('askForCourse');
        } else if (semester === '') {
            agent.add('Welches Semester?');
            agent.add(new Suggestion('1'));
            agent.add(new Suggestion('2'));
            agent.add(new Suggestion('3'));
            agent.add(new Suggestion('4'));
            agent.add(new Suggestion('5'));
            agent.add(new Suggestion('6'));
            // agent.setFollowupEvent('askForSemester');
        } else if ( date === '') {
            agent.add('Für welchen Tag?');
            agent.add(new Suggestion(getVarDate()));
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

            // agent.setFollowupEvent('askForDate');

        } else {
            agent.add('Folgende infos extrahiert:');
            agent.add('Vorlesungsplan: ' + course + typeof course);
            agent.add('Semester: ' + semester);
            agent.add('Date: ' + date);
        }

        agent.setContext({
            name: 'collectedinfos',
            lifespan: 2,
            parameters: lectureInfos
        });
    }

    function askForCourse(agent) {
        let context = agent.getContext('collectedinfos');
        let date = context.parameters.date;
        let semester = context.parameters.semester;
        let course = agent.parameters.studiengang;

        let lectureInfos = new Map();
        lectureInfos.set('date', date);
        lectureInfos.set('semester', semester);
        lectureInfos.set('course', course);

        agent.clearOutgoingContexts();
        agent.setContext({
            name: 'collectedinfos',
            lifespan: 2,
            parameters: lectureInfos
        });

        agent.setFollowupEvent('getLectures');
    }

    function askForSemester(agent) {
        let context = agent.getContext('collectedinfos');
        let date = context.parameters.date;
        let semester = agent.parameters.semester;
        let course = context.parameters.studiengang;

        let lectureInfos = new Map();
        lectureInfos.set('date', date);
        lectureInfos.set('semester', semester);
        lectureInfos.set('course', course);

        agent.clearOutgoingContexts();
        agent.setContext({
            name: 'collectedinfos',
            lifespan: 2,
            parameters: lectureInfos
        });

        agent.setFollowupEvent('getLectures');
    }

    function askForDate(agent) {
        let context = agent.getContext('collectedinfos');
        let date = agent.parameters.date;
        let semester = context.parameters.semester;
        let course = context.parameters.studiengang;

        let lectureInfos = new Map();
        lectureInfos.set('date', date);
        lectureInfos.set('semester', semester);
        lectureInfos.set('course', course);

        agent.clearOutgoingContexts();

        agent.setContext({
            name: 'collectedinfos',
            lifespan: 2,
            parameters: lectureInfos
        });

        agent.setFollowupEvent('getLectures');
    }

    function fallback(agent) {
        agent.add(`Woah! Its getting a little hot in here.`);
        agent.add(`I didn't get that, can you try again?`);
    }

    let intentMap = new Map(); // Map functions to Dialogflow intent names
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Convert Fahrenheit and Celsius', convertFahrenheitAndCelsius);
    intentMap.set('Convert Rankine and Kelvin', convertRankineAndKelvin);
    intentMap.set('Default Fallback Intent', fallback);
    intentMap.set('getLectures', getLectures);
    intentMap.set('addLecture', addLecture);
    intentMap.set('askForCourse', askForCourse);
    intentMap.set('askForSemester', askForSemester);
    intentMap.set('askForDate', askForDate);
    agent.handleRequest(intentMap);
});
