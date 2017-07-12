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
  sinonStubPromise = require('sinon-stub-promise'),
  should = require('should'),
  term = require('../lib/term');

describe('Testing term Function', () => {

  const sandbox = sinon.sandbox.create();
  const rootPath = '/dev';
  const tty0 = 'tty0';


  before(() => {
    sinonStubPromise(sinon);
  });

  beforeEach(() => {
    mockfs({
      [rootPath]: {
        [tty0]: Buffer.from('output')
      }
    })
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    mockfs.restore();
  });

  it('should return a events.EventEmitter() object', () => {

    const ttyPath = path.resolve(rootPath, tty0),
      delimiter = '\r\n';

    fs.open(ttyPath, 'r+', async function(error, fd){
      if (error) {
        should.fail(error);
      }

      try {
        const event = await term(ttyPath, delimiter, fd);

        should.exist(event);
        event.should.be.an.instanceOf(events.EventEmitter);
        event.should.have.property('serialPort', ttyPath);
        event.should.have.property('send').and.be.an.instanceOf(Function);
        event.should.have.property('close').and.be.an.instanceOf(Function);

      } catch (error) {
        should.fail(error);
      }
    });
  });

});
