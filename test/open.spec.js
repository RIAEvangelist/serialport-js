'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  mockfs = require('mock-fs'),
  path = require('path'),
  sinon = require('sinon'),
  sinonStubPromise = require('sinon-stub-promise'),
  EventEmitter = require('events').EventEmitter,
  should = require('should'),
  open = require('../lib/open'),
  term = require('../lib/term');

describe('Testing open Function', () => {

  const serial = { 'term': term };
  const sandbox = sinon.sandbox.create();
  const rootPath = '/dev';
  const tty = 'tty0';

  before(() => {
    sinonStubPromise(sinon);
  });

  beforeEach(() => {
    mockfs({
      [rootPath]: {
        [tty]: Buffer.from('output')
      }
    })
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    mockfs.restore();
  });

  it('should throw an error if fs.open failed', async () => {
    const expected = 'Some error occured';
    const filePath = path.resolve(rootPath, tty),
      delimiter = '\r\n';

    const stub = sandbox.stub(fs, 'open').callsFake((_path, flags, cb) => {
      cb(new Error(expected), null);
    });

    try {
      const result = await open(filePath, delimiter);
      should.fail(result);
    } catch (error) {
      should.exist(error);
      error.should.have.property('message', expected);
    }
  });

  it('should throw an error if term failed', async () => {
    const expected = 'Some error occured';
    const filePath = path.resolve(rootPath, tty),
      delimiter = '\r\n';

    const stub = sandbox.stub(fs, 'open').callsFake((_path, flags, cb) => {
      cb(null, 'fd');
    });

    let promise = sandbox.stub(serial, 'term').returnsPromise();
    promise.rejects(new Error(expected));

    try {
      const result = await open.bind(serial)(filePath, delimiter);
      should.fail(result);
    } catch (error) {
      should.exist(error);
      error.should.have.property('message', expected);
    }
  });

  it('should call fs.open with the passed file path', async () => {
    const filePath = path.resolve(rootPath, tty),
      delimiter = '\r\n';

    const stub = sandbox.stub(fs, 'open').callsFake((_path, flags, cb) => {
      cb(null, 'fd');
    });

    let promise = sandbox.stub(serial, 'term').returnsPromise();
    promise.resolves();

    try {
      await open.bind(serial)(filePath, delimiter);
      stub.should.have.been.called;

      /* Assert stub parameters */
      let args = stub.getCalls()[0].args;
      should.exist(args);
      args[0].should.eql(filePath);
      args[1].should.equal('r+');

    } catch (error) {
      should.fail(error);
    }
  });

  it('should be able to return the evenEmitter succesfully', async () => {
    const filePath = path.resolve(rootPath, tty),
      delimiter = '\r\n';

    const spy = sandbox.spy(serial, 'term')
    try {
      const eventEmitter = await open.bind(serial)(filePath, delimiter);
      should.exist(eventEmitter);
      eventEmitter.should.be.an.instanceOf(EventEmitter);

      spy.should.have.been.called;

      /* Assert stub parameters */
      let args = spy.getCalls()[0].args;
      should.exist(args);
      args[0].should.eql(filePath);
      args[1].should.equal(delimiter);
      args[2].should.be.an.instanceOf(Object); // fd

    } catch (error) {
      should.fail(error);
    }
  });
});
