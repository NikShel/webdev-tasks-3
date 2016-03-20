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
        it('should work with empty empty functions list', function (done) {
            var callback = sinon.spy(() => {
                callback.should.have.been.called;
                done();
            });
            flow.serial([], callback);
        });

        it('should run functions in series', function (done) {
            var firstFunc = sinon.spy(function (next) {
                    setTimeout(() => {
                        next(null, [1]);
                    }, 0);
                });
            var secondFunc = sinon.spy(function (arr, next) {
                    setTimeout(() => {
                        arr.push(2);
                        next(null, arr);
                    }, 0);
                });
            var thirdFunc = sinon.spy(function (arr, next) {
                    setTimeout(() => {
                        arr.push(3);
                        next(null, arr);
                    }, 0);
                });
            var functions = [
                firstFunc,
                secondFunc,
                thirdFunc
            ];
            var callback = sinon.spy(function (err, arr) {
                firstFunc.should.have.been.calledOnce;
                secondFunc.should.have.been.calledOnce;
                thirdFunc.should.have.been.calledOnce;
                callback.should.have.been.calledWithExactly(null, [1, 2, 3]);
                done();
            });
            flow.serial(functions, callback);
        });

        it('should stop after error and call callback', function (done) {
            var shouldNotWork = sinon.spy();
            var functions = [
                function (next) {
                    setTimeout(() => {
                        next(null, null);
                    });
                },
                function (data, next) {
                    setTimeout(() => {
                        next('error', null);
                    });
                },
                shouldNotWork
            ];
            var callback = sinon.spy(function (err, data) {
                callback.should.have.been.calledWith('error', null);
                shouldNotWork.should.have.not.been.called;
                done();
            });
            flow.serial(functions, callback);
        });
    });

    describe('Parallel tests', function () {
        it('should work with empty empty functions list', function (done) {
            var callback = sinon.spy(() => {
                callback.should.have.been.called;
                done();
            });
            flow.parallel([], callback);
        });

        it('should call callback with correct results', function (done) {
            var func1 = sinon.spy(function (localCallback) {
                    setTimeout(() => {
                        localCallback(null, 1);
                    });
                });
            var func2 = sinon.spy(function (localCallback) {
                    setTimeout(() => {
                        localCallback(null, 2);
                    });
                });
            var func3 = sinon.spy(function (localCallback) {
                    setTimeout(() => {
                        localCallback(null, 3);
                    });
                });
            var functions = [
                func1,
                func2,
                func3
            ];
            var callback = sinon.spy(function (err, data) {
                func1.should.have.been.calledOnce;
                func2.should.have.been.calledOnce;
                func3.should.have.been.calledOnce;
                callback.should.have.been.calledWithExactly(null, [1, 2, 3]);
                done();
            });
            flow.parallel(functions, callback);
        });

        it('should call callback with error if needed', function (done) {
            var functions = [
                function (localCallback) {
                    setTimeout(() => {
                        localCallback('error', 1);
                    });
                },
                function (localCallback) {
                    setTimeout(() => {
                        localCallback(null, 2);
                    });
                }
            ];
            var callback = sinon.spy(function (err, data) {
                callback.should.have.been.called.Once;
                callback.should.have.been.calledWith('error');
                done();
            });
            flow.parallel(functions, callback);
        });

        it('should work with empty functions list', function () {
            var callback = sinon.spy();
            flow.parallel([], callback);
            callback.should.have.been.calledWithExactly(null, []);
        });
    });

    describe('Map tests', function () {
        it('should call callback with correct results', function (done) {
            var func = sinon.spy(function (number, localCallback) {
                setTimeout(() => {
                    localCallback(null, number + 1);
                });
            });
            var callback = sinon.spy(function (err, data) {
                callback.should.have.been.calledWithExactly(null, [2, 3]);
                func.should.have.callCount(2);
                done();
            });
            flow.map([1, 2], func, callback);
        });

        it('should call callback with error if needed', function (done) {
            var func = function (number, localCallback) {
                if (number === 1) {
                    setTimeout(() => {
                        localCallback('error', null);
                    });
                } else {
                    setTimeout(() => {
                        localCallback(null, number + 1);
                    });
                }
            };
            var callback = sinon.spy(function (err, data) {
                callback.should.have.been.calledWith('error');
                done();
            });
            flow.map([1, 2], func, callback);
        });

        it('should work with empty values list', function (done) {
            var callback = sinon.spy(function (err, data) {
                callback.should.have.been.calledWithExactly(null, []);
                done();
            });
            flow.map([], function () {}, callback);
        });
    });
});
