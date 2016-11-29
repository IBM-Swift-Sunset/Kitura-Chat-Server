/*
 Copyright IBM Corporation 2016

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
(function() {

var displayMessage = function($scope, displayName, messageText) {
    messageText = messageText.replace(/\n/g, '<br>');
    var date = new Date();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var time = date.getHours() + ':' + (minutes < 10 ? '0' : '') + minutes +
                    ':' + (seconds < 10 ? '0' : '') + seconds;

    var localUser = displayName == $scope.displayName;
    var borderSpace = localUser ? 0 : 4;

    var messageBox =
        '<div class="' + (localUser ? 'messagelocalUserBox' : 'messageRemoteUserBox') + '"' +
              ' style="width:' + ($('.messagesArea').width()-36-borderSpace) + 'px;"' + '>' +
          '<div>' +
            '<div class="messageDisplayName">' + displayName + '</div>' +
            '<div class="messageTime">' + time + '</div>' +
          '</div>' +
          '<div class="messageText">' + messageText + '</div>' +
        '</div>';

    var initialsCircle =
        '<div class="messageCircle ' + (localUser ? 'localUserText' : 'remoteUserText') + '"' +
                   'style="' + (localUser ? 'margin-right: 6px;' : 'margin-left: 6px;' ) + '"' +
                   '>' + $scope.participantInitials[displayName] + '</div>'

    var snippet =
        '<div class="messageLine">' +
          (localUser ? (initialsCircle + messageBox) : (messageBox + initialsCircle)) +
        '</div>';

    var messagesArea = $('.messagesArea');
    messagesArea.html(messagesArea.html() + snippet);

    $scope.hasMessages = true;
};

var initials = function(name) {
    var parts = name.split(' ');
    var result;
    if (parts.length > 1) {
        result = parts[0].substring(0, 1) + parts[1].substring(0, 1);
    }
    else {
        result = parts[0].substring(0, 2);
    }
    return result.toUpperCase()
};

var participantConnected = function($scope, displayName) {
    if (displayName != $scope.displayName) {
        var displayNameInitials = initials(displayName);
        $scope.participantInitials[displayName] = displayNameInitials;
        $scope.participants.push({displayName: displayName, initials: displayNameInitials, typing: false});
        $scope.participants.sort(function(a, b) {
            if (a.displayName > b.displayName) {
                return 1
            }
            else if (a.displayName < b.displayName) {
                return -1
            }
            else {
                return 0
            }
        });
        $scope.$apply();
    }
};

var participantDisconnected = function($scope, displayName) {
    for (var i=0  ;  i < $scope.participants.length  ;  i++) {
        if (displayName == $scope.participants[i].displayName) {
            $scope.participants.splice(i, 1);
            $scope.$apply();
            break;
        }
    }
};

var updateTypingState = function($scope, displayName, state) {
    if (displayName != $scope.displayName) {
        for (var i=0  ;  i < $scope.participants.length  ;  i++) {
            if (displayName == $scope.participants[i].displayName) {
                $scope.participants[i].typing = state;
                $scope.$apply();
                break;
            }
        }
    }
};

var setupWebSocketClient = function($scope) {
    var wsProtocol = location.protocol == 'http:' ? 'ws' : 'wss'
    var client = new WebSocket(wsProtocol + '://' + location.host + '/kitura-chat', 'chat');

    client.onerror =  function(error) {
        alert('Connect Error: ' + error.toString());
    };

    client.onopen = function() {
        client.send('C:'+ $scope.displayName)
    };

    client.onclose = function() {
        alert('Chat closed')
    };

    client.onmessage = function(event) {
        var parts = event.data.split(':');
        if (parts.length > 1) {
            switch(parts[0]) {
                case 'C':
                    participantConnected($scope, parts[1]);
                    break;

                case 'D':
                    participantDisconnected($scope, parts[1]);
                    break;

                case 'M':
                    displayMessage($scope, parts[1], parts[2]);
                    break;

                case 'S':
                    updateTypingState($scope, parts[1], false);
                    break;

                case 'T':
                    updateTypingState($scope, parts[1], true);
                    break;
            }
        }
    };

    return client;
};


var app = angular.module('chat-client', []);

app.controller("chat-controller", function($scope) {
    $scope.participants = [];
    $scope.participantInitials = {};
    $scope.displayName = "";
    $scope.hasMessages = false;
    $scope.initials = "";
    $scope.isTyping = 0;

    $scope.displayNameEntered = function() {
        $('.coverFrame').hide();
        $('.displayNameArea').hide();
        $scope.initials = initials($scope.displayName);
        $scope.participantInitials[$scope.displayName] = $scope.initials;

        try {
            $scope.client = setupWebSocketClient($scope);
        }
        catch(error) {}
    };

    var typingStopped = function() {
        $scope.client.send('S:' + $scope.displayName);
        clearTimeout($scope.isTyping);
        $scope.isTyping = 0;
    };

    $scope.inputAreaInput = function(event) {
        if ((event.key == 'Enter' || event.keyCode == 13) && !event.cntrlKey && !event.shiftKey) {
            typingStopped();
            var inputAreaField = $('#inputAreaField');
            var text = inputAreaField.val();
            $scope.client.send('M:' + $scope.displayName + ':' + text);
            event.preventDefault();
            inputAreaField.val('');
        }
        else {
            if ($scope.isTyping) {
                clearTimeout($scope.isTyping);
            }
            else {
                $scope.client.send('T:' + $scope.displayName)
            }
            $scope.isTyping = setTimeout(typingStopped, 5000);
        }
    }
})

app.directive("chatUi", function() {
    return {
        restrict: "E",
        templateUrl: "templates/chatUi.html",
        link: function(scope, element, attrs, controller) {
            utilities.resizeUI();
        }
    }
});

})()
