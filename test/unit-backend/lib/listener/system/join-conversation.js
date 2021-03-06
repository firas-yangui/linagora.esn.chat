'use strict';

const sinon = require('sinon');
const expect = require('chai').expect;
const CONSTANTS = require('../../../../../backend/lib/constants');

describe('The join conversation system message handler', function() {

  let deps, dependencies, newMessageTopic, membershipTopic, domainId, userId, conversationId, timestamp;

  beforeEach(function() {
    dependencies = function(name) {
      return deps[name];
    };

    domainId = '123';
    userId = '456';
    conversationId = '789';
    timestamp = Date.now();

    newMessageTopic = {
      subscribe: sinon.spy(),
      publish: sinon.spy()
    };

    membershipTopic = {
      subscribe: sinon.spy(),
      publish: sinon.spy()
    };

    deps = {
      logger: {
        /*eslint no-console: ["error", { allow: ["log"] }] */
        error: console.log,
        info: console.log,
        debug: console.log
      },
      pubsub: {
        local: {
          topic: function(name) {
            if (name === CONSTANTS.NOTIFICATIONS.MESSAGE_RECEIVED) {
              return newMessageTopic;
            } else if (name === CONSTANTS.NOTIFICATIONS.MEMBERSHIP_EVENTS) {
              return membershipTopic;
            }
          }
        }
      }
    };
  });

  describe('The start function', function() {
    it('should subscribe to MEMBERSHIP_EVENTS topic', function() {
      const module = require('../../../../../backend/lib/listener/system/join-conversation')(dependencies);

      module.start();
      expect(membershipTopic.subscribe).to.have.been.calledOnce;
    });

    it('should publish event on MESSAGE_RECEIVED topic when event is MEMBERSHIP_ACTION.JOIN', function(done) {
      let handler;

      membershipTopic.subscribe = function(callback) {
        handler = callback;
      };

      const conv = {
        domain: domainId
      };
      const conversation = {
        getById: sinon.spy(function(id, callback) {
          conv._id = id;

          callback(null, conv);
        })
      };
      const event = {
        type: CONSTANTS.MEMBERSHIP_ACTION.JOIN,
        userId: userId,
        conversationId: conversationId,
        timestamp: timestamp
      };
      const module = require('../../../../../backend/lib/listener/system/join-conversation')(dependencies, {conversation});

      module.start();
      handler(event).then(() => {
        expect(newMessageTopic.publish).to.have.been.calledWith({
          room: domainId,
          message: {
            text: '@' + userId + ' has joined the conversation.',
            type: 'text',
            subtype: CONSTANTS.MESSAGE_SUBTYPE.CONVERSATION_JOIN,
            creator: userId,
            channel: conversationId,
            user_mentions: [userId],
            timestamps: {creation: timestamp}
          }
        });
        done();
      }, done);
    });

    it('should not publish event on MESSAGE_RECEIVED topic when event is not MEMBERSHIP_ACTION.JOIN', function(done) {
      let handler;

      membershipTopic.subscribe = function(callback) {
        handler = callback;
      };

      const conv = {
        domain: domainId
      };
      const conversation = {
        getById: sinon.spy(function(id, callback) {
          conv._id = id;

          callback(null, conv);
        })
      };
      const event = {
        type: CONSTANTS.MEMBERSHIP_ACTION.JOIN + 'foo',
        userId: userId,
        conversationId: conversationId
      };
      const module = require('../../../../../backend/lib/listener/system/join-conversation')(dependencies, {conversation});

      module.start();
      handler(event).then(() => {
        expect(newMessageTopic.publish).to.not.have.beenCalled;
        done();
      }, done);
    });

  });
});
