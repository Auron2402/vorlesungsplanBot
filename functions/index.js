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

'use strict';

//Import refactorised methods (extracted them for debugging purpose)
const lectureInformations = require("./lectureInformations");
const lectureManagement = require("./lectureManagement");

//Import Library to make things easier (make shure they are in every refactorised file)
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');
const firebase = require('firebase');

//get Firebase up and running
const config = {
    apiKey: "AIzaSyADFmL3IGmwvD6kRto6bHWfZy1dcQtBL2w",
    authDomain: "vorlesungsplanbot.firebaseapp.com",
    databaseURL: "https://vorlesungsplanbot.firebaseio.com",
    projectId: "vorlesungsplanbot",
    storageBucket: "vorlesungsplanbot.appspot.com",
    messagingSenderId: "604550375890"
};
firebase.initializeApp(config);

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

exports.vorlesungsplanBot = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({request, response});
    // console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers, undefined, 2));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body, undefined, 2));

    function addLecture(agent) {
       lectureManagement.addLecture(agent);
    }

    function getLectures(agent) {
        lectureInformations.getLectures(agent);
    }

    function askForCourse(agent) {
        lectureInformations.askForCourse(agent);
    }

    function askForSemester(agent) {
        lectureInformations.askForSemester(agent);
    }

    function askForDate(agent) {
        lectureInformations.askForDate(agent);
    }

    let intentMap = new Map(); // Map functions to Dialogflow intent names
    intentMap.set('getLectures', getLectures);
    intentMap.set('addLecture', addLecture);
    intentMap.set('askForCourse', askForCourse);
    intentMap.set('askForSemester', askForSemester);
    intentMap.set('askForDate', askForDate);
    agent.handleRequest(intentMap);
});
