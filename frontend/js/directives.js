'use strict';

angular.module('linagora.esn.chat')
  .directive('chatApplicationMenu', function(applicationMenuTemplateBuilder) {
    return {
      restrict: 'E',
      replace: true,
      template: applicationMenuTemplateBuilder('/#/chat', 'mdi-facebook-messenger', 'Chat')
    };
  })

  .directive('chatUserTyping', function(_, $q, ChatMessageAdapter) {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: '/chat/views/partials/user-typing.html',
      link: function(scope) {

        scope.typing = {};
        scope.$on('chat:message:user_typing', function(evt, message) {
          scope.typing[message.user] = message.state;
          var areTyping = _.map(scope.typing, function(value, key) {
            if (value && scope.channel._id === message.channel) {
              return key;
            }
          }).filter(function(element) {
            return element !== undefined;
          });

          $q.all(areTyping.map(function(element) {
            return ChatMessageAdapter.getUser(element);
          })).then(function(results) {
            scope.usersTyping = results.map(function(result) {
              if (result.firstname || result.lastname) {
                return (result.firstname || '') + ' ' + (result.lastname || '');
              } else {
                return result.emails[0];
              }
            });
          });

        });
      }
    };
  })

  .directive('chatSidebar', function(localStorageService) {
    return {
      restrict: 'E',
      templateUrl: '/chat/views/aside/sidebar.html',
      link: function(scope) {
        scope.toggleNotification = function() {
          var newState = !scope.isNotificationEnabled;
          localStorageService.getOrCreateInstance('linagora.esn.chat').setItem('isNotificationEnabled', newState.toString()).then(function() {
            scope.isNotificationEnabled = newState;
          });
        };
      }
    };
  })

  .directive('chatFooter', function() {
    return {
      restrict: 'E',
      templateUrl: '/chat/views/channels/channel-footer.html'
    };
  })

  .directive('chatChannelItem', function() {
    return {
      restrict: 'E',
      scope: {
        item: '='
      },
      controller: function($scope, $rootScope, $q, _, CHAT_EVENTS, userState, session) {
        $scope.allUsersConnected = true;
        var userToConnected = {};

        function computeIsConnected() {
          $scope.allUsersConnected = _(userToConnected).values().every();
        }

        session.ready.then(function(session) {
          var statesPromises = _.chain($scope.item.members)
            .reject({_id: session.user._id})
            .map(function(member) {
              return userState.get(member._id).then(function(state) {
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
        });
      },
      templateUrl: '/chat/views/aside/channel-item.html'
    };
  })

  .directive('chatMessage', function() {
    return {
      restrict: 'E',
      scope: {
        message: '='
      },
      templateUrl: '/chat/views/messages/message.html'
    };
  })

  .directive('chatChannelSubheader', function() {
    return {
      restrict: 'E',
      scope: true,
      templateUrl: '/chat/views/subheaders/channel.html',
      controller: 'chatChannelSubheaderController'
    };
  })

  .directive('chatChannelView', function() {
    return {
      restrict: 'E',
      templateUrl: '/chat/views/channels/channel-view.html'
    };
  })

  .directive('chatMessageCompose', function($log, deviceDetector, ChatScroll, messageService) {
    return {
      restrict: 'E',
      templateUrl: '/chat/views/messages/message-compose.html',
      link: function(scope, element) {
        messageService.connect();
        var timer = null;

        scope.typing = false;
        scope.text = '';

        function sendUserTyping(state) {
          var message = {
            state: state,
            user: scope.user._id,
            channel: scope.channel._id,
            date: Date.now()
          };

          messageService.sendUserTyping(message).then(function(result) {
            $log.debug('Message ACK', result);
          }, function(err) {
            $log.error('Error while sending message', err);
          });
        }

        element.on('keydown', function(event) {
          if (!deviceDetector.isMobile() && event.keyCode === 13) {
            if (!event.shiftKey) {
              event.preventDefault();
              scope.sendMessage();
            }
          }
        });

        scope.onTextChanged = function() {
          if (!scope.typing) {
            sendUserTyping(true);
          }
          scope.typing = true;
          clearTimeout(timer);
          timer = setTimeout(function() {
            scope.typing = false;
            sendUserTyping(false);
          }, 2000);
        };

        function buildCurrentMessage() {
          return {
            type: 'text',
            text: scope.text,
            user: scope.user._id,
            channel: scope.channel._id,
            date: Date.now()
          };
        }

        scope.sendMessage = function() {
          if (!scope.text) {
            $log.debug('Can not send message');
            return;
          }

          var message = buildCurrentMessage();
          scope.newMessage(message);
          scope.text = '';

          // hack to reset autoSize
          $('textarea')[0].style.height = '56px';
          ChatScroll.scrollDown();

          messageService.sendMessage(message).then(function(result) {
            $log.debug('Message ACK', result);
          }, function(err) {
            $log.error('Error while sending message', err);
          });
        };

        scope.onFileSelect = function(files) {
          $log.debug('Sending message with attachments', files);
          messageService.sendMessageWithAttachments(buildCurrentMessage(), files).then(function(response) {
            scope.newMessage(response);
            scope.text = '';
          }, function(err) {
            $log.error('Error while uploading message', err);
          });
        };
      }
    };
  });
