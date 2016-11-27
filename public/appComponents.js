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
                    $scope.participants.push({displayName: parts[1], typing: false});
                    $scope.$apply();
                    break;

                case 'M':
                    var snippet =
                        '<div>' +
                          '<div class="messageDisplayName">' + parts[1] + '</div>' +
                          '<div class="messageText">' + parts[2] + '</div>' +
                        '</div>';
                    var messagesArea = $('.messagesArea');
                    messagesArea.html(messagesArea.html() + snippet);
                    break;
            }
        }
    };

    return client;
}


var app = angular.module('chat-client', []);

app.controller("chat-controller", function($scope) {
    $scope.participants = [ {displayName: "Shmuel", typing: true} ];
    $scope.displayName = "";

    $scope.displayNameEntered = function() {
        $('.coverFrame').hide();
        $('.displayNameArea').hide();

        $scope.client = setupWebSocketClient($scope);
    };

    $scope.inputAreaInput = function(event) {
        var key = event.key || event.keyCode;
        if (key == 'Enter' && !event.cntrlKey && !event.shiftKey) {
            var inputAreaField = $('#inputAreaField');
            var text = inputAreaField.val();
            $scope.client.send('M:' + $scope.displayName + ':' + text);
            inputAreaField.val('');
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
})

app.directive("chatParticipants", function() {
    return {
        restrict: "E",
        templateUrl: "templates/chatParticipants.html"
    }
})

})()
