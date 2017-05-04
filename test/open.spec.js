'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  mockfs = require('mock-fs'),
  path = require('path'),
  sinon = require('sinon'),
  should = require('should'),
  open = require('../lib/open'),
  term = require('../lib/term');

describe('Testing open Function', () => {
  const serial = { 'term': term };
  const sandbox = sinon.sandbox.create();
  const rootPath = '/dev';
  const tty = 'tty0';

  beforeEach(() => {
    mockfs({
      [rootPath]: {
        [tty]: 'output'
      }
    })
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    mockfs.restore();
  });

  it('should throw an error if no callback was passed', () => {
    const filePath = path.resolve(rootPath, tty),
      callback = null,
      delimiter = '\r\n';

    should(() => {
      open(filePath, callback, delimiter);
    }).throw('Undefined parameter callback');
  });
  
  it('should throw an error if fs.open failed', () => {
    const expected = 'Some error occured';
    const filePath = path.resolve(rootPath, tty),
      callback = function () {},
      delimiter = '\r\n';

    const stub = sandbox.stub(fs, 'open').callsFake((_path, flags, cb) => {
      cb(new Error(expected), null);
    });

    should(() => {
      open(filePath, callback, delimiter);
    }).throw(expected);
  });
  
  it('should call fs.open with the passed file path', () => {
    const filePath = path.resolve(rootPath, tty),
      callback = function () {},
      delimiter = '\r\n';

    const stub = sandbox.stub(fs, 'open');

    open(filePath, callback, delimiter);

    stub.should.have.been.called;

    /* Assert stub parameters */
    let args = stub.getCalls()[0].args;
    should.exist(args);
    args[0].should.eql(filePath);
    args[1].should.equal('r+');
    args[2].should.be.an.instanceOf(Function);
  });

  it('should call the callback when succesfully', () => {
    const filePath = path.resolve(rootPath, tty),
      callback = sinon.spy(),
      delimiter = '\r\n';

    const stub1 = sandbox.stub(fs, 'open').callsFake((_path, flags, cb) => {
      cb(null, 'fd');
    });

    const stub2 = sandbox.stub(serial, 'term').callsFake((path, delimiter, callback, fd) => {
      callback();
    });

    open.bind(serial)(filePath, callback, delimiter);

    callback.should.have.been.called;
  });
});
