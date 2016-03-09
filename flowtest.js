'use strict';

const flow = require('./lib/flow.js');
const assert = require('assert');
const sinon = require('sinon');

describe('Flow tests', function () {
    describe('Serial tests', function () {
        it('should run functions in series', function () {
            var callback = sinon.spy();
            var functions = [
                function (next) {
                    next(null, 1);
                },
                function (data, next) {
                    next(null, data);
                }
            ];
            flow.serial(functions, callback);
            assert.ok(callback.withArgs(null, 1).calledOnce);
        });

        var callback = sinon.spy();
        var shouldNotWork = sinon.spy();
        var functions = [
            function (next) {
                next(null, null);
            },
            function (data, next) {
                next('error', null);
            },
            shouldNotWork
        ];
        flow.serial(functions, callback);

        it('should call callback with error if needed', function () {
            assert.ok(callback.calledWith('error', null));
        });

        it('should stop after error', function () {
            assert.ok(shouldNotWork.notCalled);
        });
    });

    describe('Parallel tests', function () {
        it('should call callback with correct results', function () {
            var callback = sinon.spy();
            var functions = [
                function (localCallback) {
                    localCallback(null, 1);
                },
                function (localCallback) {
                    localCallback(null, 2);
                },
                function (localCallback) {
                    localCallback(null, 3);
                }
            ];
            flow.parallel(functions, callback);
            assert.ok(callback.calledWith(null, [1, 2, 3]));
        });

        it('should call callback with error if needed', function () {
            var callback = sinon.spy();
            var functions = [
                function (localCallback) {
                    localCallback('error', 1);
                },
                function (localCallback) {
                    localCallback(null, 2);
                }
            ];
            flow.parallel(functions, callback);
            assert.ok(callback.calledOnce);
            assert.equal(callback.firstCall.args[0], 'error');
        });

        it('should work with empty functions list', function () {
            var callback = sinon.spy();
            flow.parallel([], callback);
            assert.ok(callback.calledWith(null, []));
        });
    });

    describe('Map tests', function () {
        it('should call callback with correct results', function () {
            var callback = sinon.spy();
            var func = function (number, localCallback) {
                localCallback(null, number + 1);
            };
            flow.map([1, 2], func, callback);
            assert.ok(callback.calledWith(null, [2, 3]));
        });

        it('should call callback with error if needed', function () {
            var callback = sinon.spy();
            var func = function (number, localCallback) {
                if (number === 1) {
                    localCallback('error', null);
                } else {
                    localCallback(null, number + 1);
                }
            };
            flow.map([1, 2], func, callback);
            assert.equal(callback.firstCall.args[0], 'error');
        });

        it('should work with empty values list', function () {
            var callback = sinon.spy();
            flow.map([], function () {}, callback);
            assert.ok(callback.calledWith(null, []));
        });
    });
});
