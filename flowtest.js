'use strict';

const flow = require('./lib/flow.js');
const assert = require('assert');
const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
chai.should();
chai.use(sinonChai);


describe('Flow tests', function () {
    describe('Serial tests', function () {
        it('should work with empty empty functions list', function () {
            var callback = sinon.spy();
            flow.serial([], callback);
            callback.should.have.been.called;
        });

        it('should run functions in series', function () {
            var callback = sinon.spy();
            var firstFunc = sinon.spy(function (next) {
                    next(null, [1]);
                });
            var secondFunc = sinon.spy(function (arr, next) {
                    arr.push(2);
                    next(null, arr);
                });
            var thirdFunc = sinon.spy(function (arr, next) {
                    arr.push(3);
                    next(null, arr);
                });
            var functions = [
                firstFunc,
                secondFunc,
                thirdFunc
            ];
            flow.serial(functions, callback);
            firstFunc.should.have.been.calledOnce;
            secondFunc.should.have.been.calledOnce;
            thirdFunc.should.have.been.calledOnce;
            callback.should.have.been.calledWithExactly(null, [1, 2, 3]);
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
            callback.should.have.been.calledWith('error', null);
        });

        it('should stop after error', function () {
            shouldNotWork.should.have.not.been.called;
        });
    });

    describe('Parallel tests', function () {
        it('should work with empty empty functions list', function () {
            var callback = sinon.spy();
            flow.parallel([], callback);
            callback.should.have.been.called;
        });

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
            callback.should.have.been.calledWithExactly(null, [1, 2, 3]);
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
            callback.should.have.been.called.Once;
            callback.should.have.been.calledWith('error');
        });

        it('should work with empty functions list', function () {
            var callback = sinon.spy();
            flow.parallel([], callback);
            callback.should.have.been.calledWithExactly(null, []);
        });
    });

    describe('Map tests', function () {
        it('should call callback with correct results', function () {
            var callback = sinon.spy();
            var func = function (number, localCallback) {
                localCallback(null, number + 1);
            };
            flow.map([1, 2], func, callback);
            callback.should.have.been.calledWithExactly(null, [2, 3]);
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
            callback.should.have.been.calledWith('error');
        });

        it('should work with empty values list', function () {
            var callback = sinon.spy();
            flow.map([], function () {}, callback);
            callback.should.have.been.calledWithExactly(null, []);
        });
    });
});
