'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  mockfs = require('mock-fs'),
  path = require('path'),
  sinon = require('sinon'),
  should = require('should'),
  serial = require('../lib/serialport-js');

describe('Testing find Function', () => {
  const sandbox = sinon.sandbox.create();
  const rootPath = serial.paths.linux.serial;
  const serialFileName = 'a-symlink';

  beforeEach(() => {
    mockfs({
      'regular-file': 'file contents',
      [rootPath]: {
        [serialFileName]: mockfs.symlink({
          path: 'regular-file'
        })
      }
    })
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    mockfs.restore();
  });


  it('should throw an error if readdir failed', () => {
    const expected = 'Some error occured';

    const stub = sandbox.stub(fs, 'readdir').callsFake((file, callback) => {
      callback(new Error(expected), null);
    });

    return serial.find()
    .then((list) => {
      should.fail(list);
    })
    .catch((error) => {
      should.exist(error);
      error.should.have.property('message', expected);
    });
  });

  it('should return an empty array when no serial devices are found', () => {
    // Remove file the symlink file
    fs.unlinkSync(rootPath + path.sep + serialFileName);

    return serial.find()
    .then((list) => {
      should.exist(list);
      list.should.be.an.instanceOf(Array).and.have.lengthOf(0);
    })
    .catch((error) => {
      should.fail(error);
    });
  });

  it('should throw an error if readlink failed', () => {
    const expected = 'Some error occured';
    
    const stub = sandbox.stub(fs, 'readlink').callsFake((file, callback) => {
      callback(new Error(expected), null);
    });

    return serial.find()
    .then((list) => {
      should.fail(list);
    })
    .catch((error) => {
      should.exist(error);
      error.should.have.property('message', expected);
    });
  });

  it('should return a list of serial ports succesfully', () => {
    return serial.find()
    .then((list) => {
      should.exist(list);
      list.should.be.an.instanceOf(Array).and.have.lengthOf(1);
      list[0].should.have.property('info', serialFileName);
      list[0].should.have.property('port', path.resolve(rootPath, 'regular-file'));

    })
    .catch((error) => {
      should.fail(error);
    });
  });
});
