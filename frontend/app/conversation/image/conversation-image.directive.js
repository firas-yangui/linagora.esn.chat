(function() {
  'use strict';

  angular
    .module('linagora.esn.chat')
    .directive('chatConversationImage', chatConversationImage);

  function chatConversationImage() {
    var directive = {
      restrict: 'E',
      scope: {
        conversation: '='
      },
      controller: ChatConversationImageController,
      controllerAs: 'vm',
      templateUrl: '/chat/app/conversation/image/conversation-image.html',
      bindToController: true
    };

    return directive;
  }

  function ChatConversationImageController(session, _) {
    var self = this;

    session.ready.then(sessionReady);

    function sessionReady(session) {
      self.getMembers = function() {
        var members = self.conversation && self.conversation.members ? self.conversation.members : [];

        members = members.length === 1 ? members : _.reject(members, {_id: session.user._id});

        return members.slice(0, 4);
      };
    }
  }
})();
