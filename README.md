# vorlesungsplanBot
temporary home of nodejs scripts for vorlesungsplanBot


HowToWorkLocal


Have nodejs and npm installed

checkout from git

run "npm install" to get package dependency from json file

run "firebase serve --only functions"

-> link should be something like localhost:5000 <-- need that port later

download ngrok

run "ngrok http 5000" <-- put the port from link in there 

ngrok should show https link -> copy it

go to console.dialogflow.com and into fulfillment menu

paste copied  link into url field of webhook and add "/vorlesungsplanBot"

click save

you should be ready to go debugging local should work now but dont forget there is a timeout of 5 sec from dialogflow. That means when you set breakpoints, the answer will most likely always get a timeout.
