'use strict';

/**
 * Module dependencies.
 */
const fs = require('fs'),
  mockfs = require('mock-fs'),
  path = require('path'),
  sinon = require('sinon'),
  should = require('should'),
  sinonStubPromise = require('sinon-stub-promise'),
  serial = require('../lib/serialport-js');

describe('Testing find Module', () => {

  const sandbox = sinon.sandbox.create();
  const rootPath = serial.paths.linux.serial;
  const serialFileName = 'a-symlink';

  before(() => {
    sinonStubPromise(sinon);  
  });

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

  describe('Testing find Function', () => {
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

  describe('Testing findById Function', () => {

    it('should throw an error if the id parameter is undefined', async () => {

      const expected = 'Undefined parameter id!';
      const id = null;

      try {
        await serial.findById(id);
        should.fail();
      } catch(error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    });

    it('should throw an error if the id parameter is empty', async () => {

      const expected = 'Undefined parameter id!';
      const id = '';

      try {
        await serial.findById(id);
        should.fail();
      } catch(error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    });

    it('should throw an error if find failed', async () => {

      const expected = 'Some error occured!';
      const id = 'foo';

      sandbox.stub(serial, 'find')
        .returnsPromise()
        .rejects(new Error(expected));

      try {
        await serial.findById(id);
        should.fail();
      } catch(error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    })

    it('should return null if no serial port has been found', async () => {

      const expected = 'Undefined parameter id!';
      const id = null;

      sandbox.stub(serial, 'find')
        .returnsPromise()
        .resolves([]);

      try {
        await serial.findById(id);
        should.fail();
      } catch(error) {
        should.exist(error);
        error.should.have.property('message', expected);
      }

    });

    it('should return an object if a serial port has been found', async () => {

      const expected = 'Undefined parameter id!';
      const id = 'a-symlink';

      try {
        const port = await serial.findById(id);
        
        should.exist(port);
        port.should.be.an.instanceOf(Object);
        port.should.have.property('info', serialFileName);
        port.should.have.property('port', path.resolve(rootPath, 'regular-file'));

      } catch(error) {
        console.log(error);
        should.not.exist(error);
      }

    });

  });
});
