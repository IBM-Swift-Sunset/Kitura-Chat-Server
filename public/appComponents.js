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
}

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
                    if (parts[1] != $scope.displayName) {
                        $scope.participants.push({displayName: parts[1], initials: initials(parts[1]), typing: false});
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
                    break;

                case 'D':
                    for (var i=0  ;  i < $scope.participants.length  ;  i++) {
                        if (parts[1] == $scope.participants[i].displayName) {
                            $scope.participants.splice(i, 1);
                            $scope.$apply();
                            break;
                        }
                    }
                    break;

                case 'M':
                    var messageText = parts[2];
                    messageText = messageText.replace(/\n/g, '<br>');
                    var date = new Date()
                    var minutes = date.getMinutes()
                    var seconds = date.getSeconds()
                    var time = date.getHours() + ':' + (minutes < 10 ? '0' : '') + minutes +
                                    ':' + (seconds < 10 ? '0' : '') + seconds
                    var snippet =
                        '<div class="messageLine">' +
                          '<div class="messageDisplayName">' + parts[1] + '</div>' +
                          '<div class="messageText">' + messageText + '</div>' +
                          '<div class="messageTime">' + time + '</div>' +
                        '</div>';
                    var messagesArea = $('.messagesArea');
                    messagesArea.html(messagesArea.html() + snippet);
                    break;

                case 'S':
                    if (parts[1] != $scope.displayName) {
                        for (var i=0  ;  i < $scope.participants.length  ;  i++) {
                            if (parts[1] == $scope.participants[i].displayName) {
                                $scope.participants[i].typing = false;
                                $scope.$apply();
                                break;
                            }
                        }
                    }
                    break;

                case 'T':
                    if (parts[1] != $scope.displayName) {
                        for (var i=0  ;  i < $scope.participants.length  ;  i++) {
                            if (parts[1] == $scope.participants[i].displayName) {
                                $scope.participants[i].typing = true;
                                $scope.$apply();
                                break;
                            }
                        }
                    }
                    break;
            }
        }
    };

    return client;
}


var app = angular.module('chat-client', []);

app.controller("chat-controller", function($scope) {
    $scope.participants = [];
    $scope.participantInitials = {};
    $scope.displayName = "";
    $scope.initials = "";
    $scope.isTyping = 0;

    $scope.displayNameEntered = function() {
        $('.coverFrame').hide();
        $('.displayNameArea').hide();
        $scope.initials = initials($scope.displayName)

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
        var key = event.key || event.keyCode;
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
