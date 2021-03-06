'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');
const Q = require('q');

describe('The channel controller', function() {

  let lib, err, result;

  beforeEach(function() {
    err = undefined;
    result = undefined;
    lib = {
      members: {
        getMembers: sinon.spy(function(collaboration) {
          return Q.when(collaboration.members || []);
        })
      },
      conversation: {
        getById: sinon.spy(function(id, callback) {
          return callback(err, result);
        }),
        getConversationByCommunityId: sinon.spy(function(id, callback) {
          return callback(err, result);
        }),
        getForConversation: sinon.spy(function(channel, options, callback) {
          return callback(err, result);
        }),
        getChannels: sinon.spy(function(options, callback) {
          return callback(err, result);
        }),
        create: sinon.spy(function(options, callback) {
          return callback(err, result);
        }),
        find: sinon.spy(function(options, callback) {
          return callback(err, result);
        }),
        removeMember: sinon.spy(function(channelId, userId, callback) {
          return callback(err, result);
        }),
        addMember: sinon.spy(function(channelId, userId, callback) {
          return callback(err, result);
        }),
        updateTopic: sinon.spy(function(channelId, topic, callback) {
          return callback(err, result);
        })
      }
    };
  });

  function getController(dependencies, lib) {
    return require('../../../../backend/webserver/controllers/channel')(dependencies, lib);
  }

  describe('The getChannels function', function() {
    it('should send back HTTP 500 with error when error is sent back from lib', function(done) {
      err = new Error('failed');
      const controller = getController(this.moduleHelpers.dependencies, lib);

      controller.getChannels({query: {}}, {
        status: function(code) {
          expect(code).to.equal(500);

          return {
            json: function(json) {
              expect(lib.conversation.getChannels).to.have.been.calledWith({});
              expect(json).to.shallowDeepEqual({error: {code: 500}});
              done();
            }
          };
        }
      });
    });

    it('should send back HTTP 200 with the lib.getChannels result', function(done) {
      result = [{id: 1}, {id: 2}];
      const controller = getController(this.moduleHelpers.dependencies, lib);

      controller.getChannels({query: {}}, {
        status: function(code) {
          expect(code).to.equal(200);

          return {
            json: function(json) {
              expect(lib.conversation.getChannels).to.have.been.calledWith({});
              expect(json).to.deep.equal(result);
              done();
            }
          };
        }
      });
    });
  });
});
