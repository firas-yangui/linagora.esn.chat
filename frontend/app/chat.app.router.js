(function() {
  'use strict';

  angular.module('linagora.esn.chat')
  .config(function($stateProvider, routeResolver) {
    $stateProvider
      .state('chat', {
        url: '/chat',
        templateUrl: '/chat/app/index.html',
        controller: 'ChatController',
        controllerAs: 'root',
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
        }
      })
      .state('chat.groups-add', {
        url: '/groups/add',
        views: {
          'main@chat': {
            template: '<chat-conversation-create-private/>'
          }
        }
      })
      .state('chat.channels-add', {
        url: '/channels/add',
        views: {
          'main@chat': {
            template: '<chat-conversation-create-channel/>'
          }
        }
      });
  });
})();
