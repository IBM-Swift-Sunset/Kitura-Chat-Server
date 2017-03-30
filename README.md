# Kitura-Chat-Server
A sample chat server built using Kitura-WebSocket and Kitura.

## Description
Kitura-Chat-Server enables multiple users to participate in a single group chat. A Web
UI is served by Kitura-Chat-Server that in addition to displaying the messages from the
chat also displays the list of people in the chat and an indication for each user who is
currently typing. In addition messages are added to the chat history indicating users who
join or leave the chat.

Kitura-Chat-Server uses the Kitura-WebSocket APIs to receive a variety of messages from
the various connected users and then forwards them, in most cases, to all connected users.
When the Kitura-WebSocket API indicates to  the server that a user has disconnected, a
message indicating this is forwarded to all of the remaining connected users.

## Getting started

### Running the server locally
To run the the server locally, simply:

  1. Run `swift build`, to build the server.
  2. Run `.build/debug/KituraChatServer`, to execute the server.

Once the server starts you can access the UI from a browser by going to the URL
http://<b>hostname</b>:8080, where <b>hostname</b> is the host your server is running on.

### Working with the Kitura-Chat-Server's UI
When the Web UI first loads, it asks for a display name that will be used as your identity in
the chat.

As other users join the chat you will see their display names on the left side of the screen.
To send messages, simply type in the input area in the bottom of the screen and press enter.
In the area on the left with the display names of the other users, you will see from time to time
an icon next to one or more of the display names indicating that that user is typing a message
to be sent. The icons will disappear when the users have sent their messages or have paused typing
for a while.

Messages sent by users are shown in the upper area on the right. Each message is displayed with
an indication of who sent it and when it was sent.

## Running on Bluemix
Bluemix is a hosting platform from IBM that makes it easy to deploy your app to the cloud. On Bluemix
one can deploy Swift servers in several ways. In this section I will describe deploying on Bluemix
using the Runtime for Swift Cloud Foundry build pack. In the next section I will describe deploying
on Bluemix using a Docker Container.

1. If needed:

  a. Get an account for [Bluemix](https://console.ng.bluemix.net/registration/)

  b. Download and install the [Cloud Foundry tools](https://new-console.ng.bluemix.net/docs/starters/install_cli.html)

2. Login to Bluemix, by running:
   ```
   cf api https://api.ng.bluemix.net
   cf login
   ```

   Be sure to run this in the directory where the manifest.yml file is located.

3. Run `cf push`   

   **Note** This step will take 3-5 minutes

   You will see output from the deployment as it proceeds, when it is successful you will see:

   ```
   1 of 1 instances running

   App started
   ```
   In the deployment out you will also see the URL to access your instance of Kitura-Chat-Server.

## Deploying as a Docker container on the IBM Bluemix Container Service
The IBM Bluemix Container Service enables you to run applications as Docker containers in the cloud. The container to be run can be built on the cloud as well.

1. If needed:

  a. Get an account for [Bluemix](https://console.ng.bluemix.net/registration/)

  b. Download and install the [Cloud Foundry tools](https://new-console.ng.bluemix.net/docs/starters/install_cli.html)

  c. Install the CloudFoundry plugin for the IBM Bluemix Container Service by running:
  ```
  cf install-plugin https://static-ice.ng.bluemix.net/ibm-containers-mac
  ```

  d. Set a namespace for your account (note that this can't be changed once set), running:
  ```
  cf ic namespace set namespacename
  ```
  **Where** _namespacename_ is the name space name you have chosen.
2. Login to Bluemix, by running:
```
cf api https://api.ng.bluemix.net
cf login
cf ic login
```
 Be sure to run this in the directory where the manifest.yml file is located.

3. Build the container for the Kitura-Chat-Server, by running the command:
```
cf ic build -t registry.ng.bluemix.net/namespacename/kitura-chat-server:latest --force-rm .
```
 **Where** _namespacename_ is the name space name you chose for your account.

 4. Create a container group to run your container, by running the command:
```
cf ic group create -m 128 -desired 1 --name kitura-chat-server -p 8080 -n hostname -d mybluemix.net registry.ng.bluemix.net/namespacename/kitura-chat-server
```
**Where:**
  - _namespacename_ is the name space name you chose for your account
  - _hostname_ is the virtual host name you want for your container group

Once the container in the container group has started you can point a browser at http://hostname.mybluemix.net, where hostname is the host name you specified in the previous command.

## License
This library is licensed under Apache 2.0. Full license text is available in [LICENSE](LICENSE.txt).
