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

var utilities = {};
utilities.resizeUI = function() {
        var totalHeight = $(window).height();
        var totalWidth = $(window).width();

        var titleBar = $('.titleBar');
        var participantsArea = $('.participantsArea');
        var splitter = $('.splitter');
        var messagesArea = $('.messagesArea');
        var inputAreaSplitter = $('.inputAreaSplitter');
        var footerBar = $('.footerBar');

        splitter.height(totalHeight - titleBar.height() - footerBar.height() - 30);
        messagesArea.width(totalWidth - participantsArea.width() - splitter.width() - 60);
        messagesArea.height(inputAreaSplitter.offset().top - messagesArea.offset().top - 30);
        $('.inputArea').width(totalWidth - participantsArea.width() - splitter.width() - 60);
        inputAreaSplitter.width(totalWidth-participantsArea.width()-splitter.width() - 40);
    };


(function() {

    $(document).ready(function(){
        $(window).resize(utilities.resizeUI);
    });
})();
