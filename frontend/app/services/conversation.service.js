(function() {
  'use strict';

  angular.module('linagora.esn.chat')
    .factory('chatConversationService', chatConversationService);

    function chatConversationService(ChatRestangular) {
      var service = {
        fetchMessages: fetchMessages,
        get: get,
        getMessage: getMessage,
        join: join,
        leave: leave
      };

      return service;

      function _getBase(id) {
        return ChatRestangular.all('conversations').one(id);
      }

      function _stripResponse(response) {
        return ChatRestangular.stripRestangular(response.data);
      }

      function fetchMessages(id, options) {
        return _getBase(id).all('messages').getList(options).then(_stripResponse);
      }

      function get(id) {
        return _getBase(id).get().then(_stripResponse);
      }

      function getMessage(id) {
        return _getBase(id).get().then(_stripResponse);
      }

      function join(id, userId) {
        return _getBase(id).all('members').one(userId).customPUT().then(_stripResponse);
      }

      function leave(id, userId) {
        return _getBase(id).one('members').one(userId).doDELETE();
      }
    }
})();
