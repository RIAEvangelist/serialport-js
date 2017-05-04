'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  tty = require('tty'),
  events = require('events'),
  mockfs = require('mock-fs'),
  path = require('path'),
  sinon = require('sinon'),
  should = require('should'),
  term = require('../lib/term');

describe('Testing term Function', () => {

  const sandbox = sinon.sandbox.create();
  const rootPath = '/dev';
  const tty0 = 'tty0';

  beforeEach(() => {
    mockfs({
      [rootPath]: {
        [tty0]: 'output'
      }
    })
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    mockfs.restore();
  });

  it('should return a events.EventEmitter() object', (done) => {

    const ttyPath = path.resolve(rootPath, tty0),
      delimiter = '\r\n',
      callback = function (event) {
        should.exist(event);
        event.should.be.an.instanceOf(events.EventEmitter);
        event.should.have.property('serialPort', ttyPath);
        event.should.have.property('send').and.be.an.instanceOf(Function);
        event.should.have.property('close').and.be.an.instanceOf(Function);
        done();
      };

    const stub = sandbox.stub(tty, 'ReadStream').callsFake(function() {
      // Stub the tty readstream
      return fs.createReadStream(ttyPath);
    });

    fs.open(ttyPath, 'r+', function(error, fd){
      if (error) {
        should.fail(error);
      }

      term(ttyPath, delimiter, callback, fd);
    });
  });


});
