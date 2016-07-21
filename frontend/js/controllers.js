'use strict';

angular.module('linagora.esn.chat')

  .controller('chatRootController', function($scope, $rootScope, CHAT_EVENTS, chatNotification, chatLocalStateService) {
    $scope.isEnabled = function() {
      return chatNotification.isEnabled();
    };

    $scope.chatLocalStateService = chatLocalStateService;
    if (!chatLocalStateService.activeRoom._id) {
      chatLocalStateService.setActive(chatLocalStateService.channels[0]._id);
    }
  })

  .controller('chatAddChannelController', function($scope, CHAT_CONVERSATION_TYPE, $state, conversationsService, chatLocalStateService) {
    $scope.addChannel = function() {
      var channel = {
        name: $scope.channel.name,
        type: CHAT_CONVERSATION_TYPE.CHANNEL,
        topic: $scope.channel.topic || '',
        purpose: $scope.channel.purpose || ''
      };

      conversationsService.addChannels(channel).then(function(response) {
        chatLocalStateService.addChannel(response.data);
        $state.go('chat.channels-views', {id: response.data._id});
      });
    };
  })

  .controller('chatConversationItemController', function($scope, $rootScope, $q, _, CHAT_EVENTS, CHAT_CONVERSATION_TYPE, chatUserState, session) {
    $scope.channelState = $scope.channelState || 'chat.channels-views';
    $scope.allUsersConnected = true;
    var userToConnected = {};

    function computeIsConnected() {
      $scope.allUsersConnected = _(userToConnected).values().every();
    }

    session.ready.then(function(session) {
      $scope.otherUsers = _.reject($scope.item.members, {_id: session.user._id});
      var statesPromises = $scope.otherUsers.map(function(member) {
          return chatUserState.get(member._id).then(function(state) {
            userToConnected[member._id] = state !== 'disconnected';
          });
        });

      $q.all(statesPromises).then(computeIsConnected);

      var unbind = $rootScope.$on(CHAT_EVENTS.USER_CHANGE_STATE, function(event, data) {
        if (angular.isDefined(userToConnected[data.userId])) {
          userToConnected[data.userId] = data.state !== 'disconnected';
          computeIsConnected();
        }
      });

      $scope.$on('$destroy', unbind);
      $scope.CHAT_CONVERSATION_TYPE = CHAT_CONVERSATION_TYPE;
    });
  })

  .controller('chatAddGroupController', function($scope, $state, conversationsService, _, chatLocalStateService) {
    $scope.members = [];
    $scope.addGroup = function() {
      var group = {
        members: $scope.members
      };

      conversationsService.addPrivateConversation(group).then(function(response) {
        chatLocalStateService.addPrivateConversation(response.data);
        $state.go('chat.channels-views', { id: response.data._id});
      });
    };
  })

  .controller('chatConversationSubheaderController', function($scope, chatLocalStateService) {
    $scope.chatLocalStateService = chatLocalStateService;
  });
