'use strict';

angular.module('linagora.esn.chat')
.config(function($stateProvider, routeResolver) {
  $stateProvider
    .state('chat', {
      url: '/chat',
      templateUrl: '/chat/views/index',
      controller: 'chatRootController',
      resolve: {
        domain: routeResolver.session('domain'),
        user: routeResolver.session('user')
      },
      deepStateRedirect: {
        default: 'chat.channels-views',
        fn: function() {
          return { state: 'chat.channels-views' };
        }
      }
    })
    .state('chat.channels-views', {
      url: '/channels/view/:id',
      views: {
        'main@chat': {
          template: '<sub-header><chat-conversation-subheader/></sub-header><chat-conversation-view/>'
        }
      },
      onEnter: function($stateParams, chatLocalStateService) {
        if (!$stateParams.id) {
          chatLocalStateService.setActive(chatLocalStateService.channels[0]._id);
        } else {
          chatLocalStateService.setActive($stateParams.id);
        }
      }
    })
    .state('chat.groups-add', {
      url: '/groups/add',
      views: {
        'main@chat': {
          templateUrl: '/chat/views/channels/group-add.html',
          controller: 'chatAddGroupController'
        }
      }
    })
    .state('chat.channels-add', {
      url: '/channels/add',
      views: {
        'main@chat': {
          templateUrl: '/chat/views/channels/channel-add.html',
          controller: 'chatAddChannelController'
        }
      }
    });
});
