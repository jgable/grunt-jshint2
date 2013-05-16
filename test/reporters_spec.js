var path = require("path"),
    util = require("util");

var grunt = require("grunt"),
    should = require("should"),
    sinon = require("sinon"),
    xml2js = require("xml2js");

var DefaultReporter = require("../lib/reporters/default"),
    CheckStyleReporter = require("../lib/reporters/checkstyle"),
    XmlStyleReporter = require("../lib/reporters/xml"),
    reporterResolver = require("../lib/reporterResolver");

describe("Reporters", function() {

    // TODO: if we use sinon stubs any more we should just go ahead and make a module level sandbox and restore it after every test.

    var testReporterInterface = function(ReporterClass) {
        should.exist(ReporterClass);

        should.exist(new ReporterClass());

        var reporter = new ReporterClass();

        should.exist(reporter.start);
        should.exist(reporter.finish);
        should.exist(reporter.success);
        should.exist(reporter.error);
    };

    // Example lintResults for testing reporters
    var filePath = path.join(process.cwd(), "test/res/bad-3.js"),
    lintResult = {
        errors: [{
                id: '(error)',
                raw: 'Missing semicolon.',
                code: 'W033',
                evidence: '\tvar thing = 1',
                line: 2,
                character: 18,
                scope: '(main)',
                a: undefined,
                b: undefined,
                c: undefined,
                d: undefined,
                reason: 'Missing semicolon.'
        }],
        data: {
            functions: [{
                    name: '"anonymous"',
                    param: undefined,
                    line: 1,
                    character: 11,
                    last: 3,
                    lastcharacter: 2
            }],
            options: {
                indent: 4,
                maxerr: 50
            },
            errors: [{
                    id: '(error)',
                    raw: 'Missing semicolon.',
                    code: 'W033',
                    evidence: '\tvar thing = 1',
                    line: 2,
                    character: 18,
                    scope: '(main)',
                    a: undefined,
                    b: undefined,
                    c: undefined,
                    d: undefined,
                    reason: 'Missing semicolon.'
            }],
            unused: [{
                    name: 'thing',
                    line: 2,
                    character: 14
            }]
        }
    };

    describe("DefaultReporter", function() { 
        it("implements start, finish, success and error", function() {
            testReporterInterface(DefaultReporter);
        });

        it("reports successful totals when all files done", function() {
            var reporter = new DefaultReporter();

            var sandbox = sinon.sandbox.create();

            sandbox.stub(grunt.verbose, "write");
            sandbox.stub(grunt.verbose, "ok");
            sandbox.stub(grunt.log, "writeln");
            sandbox.stub(grunt.log, "error");

            var okStub = sandbox.stub(grunt.log, "ok");

            reporter.start();
            
            reporter.success("testfile1.js", false);
            reporter.success("testfile2.js", false);
            reporter.success("testfile3.js", false);
            
            reporter.finish(["testfile1.js", "testfile2.js", "testfile3.js"]);

            sandbox.restore();

            okStub.calledWith("3 files lint free.").should.equal(true);
        });

        it("does not report files linted successfully if error", function() {
            var reporter = new DefaultReporter();

            var sandbox = sinon.sandbox.create();

            sandbox.stub(grunt.verbose, "write");
            sandbox.stub(grunt.verbose, "ok");
            sandbox.stub(grunt.log, "writeln");
            sandbox.stub(grunt.log, "error");

            var okStub = sandbox.stub(grunt.log, "ok");

            reporter.start();
            
            reporter.success("testfile1.js", false);
            reporter.error("testfile2.js", [], {});
            reporter.error("testfile3.js", [], {});
            
            reporter.finish(["testfile1.js", "testfile2.js", "testfile3.js"]);

            sandbox.restore();

            okStub.called.should.equal(false);
        });
    });

    describe("CheckStyleReporter", function() { 
        it("implements start, finish, success and error", function() {
            testReporterInterface(CheckStyleReporter);
        });

        it("outputs xml when errors happen", function(done) {
            var reporter = new CheckStyleReporter({
                dest: "test/res/checkStyleOutput.xml"
            });

            reporter.start([filePath]);
            reporter.error(filePath, lintResult.errors, lintResult.data);
            reporter.finish([filePath]);

            var output = grunt.file.read(reporter.options.dest);
            
            should.exist(output);

            xml2js.parseString(output, function(err, result) {
                if(err) {
                    throw err;
                }

                should.exist(result.checkstyle);
                result.checkstyle.$.version.should.equal('4.3');
                result.checkstyle.file.length.should.equal(1);
                result.checkstyle.file[0].error.length.should.equal(2);

                // TODO: More in depth attribute checking?

                done();
            });

        });
    });

    describe("XmlStyleReporter", function() { 
        it("implements start, finish, success and error", function() {
            testReporterInterface(XmlStyleReporter);
        });

        it("outputs xml when errors happen", function(done) {
            var reporter = new XmlStyleReporter({
                dest: "test/res/xmlStyleOutput.xml"
            });

            reporter.start([filePath]);
            reporter.error(filePath, lintResult.errors, lintResult.data);
            reporter.finish([filePath]);

            var output = grunt.file.read(reporter.options.dest);
            
            should.exist(output);

            xml2js.parseString(output, function(err, result) {
                if(err) {
                    throw err;
                }

                should.exist(result.jslint);
                result.jslint.file.length.should.equal(1);
                result.jslint.file[0].issue.length.should.equal(1);

                // TODO: More in depth attribute checking?

                done();
            });

        });
    });

    describe("ReporterResolver", function() {

        it("resolves strings", function() {
            var resolved = reporterResolver.resolve("default", {}),
                expected = new DefaultReporter();

            should.exist(resolved);

            resolved.constructor.should.equal(expected.constructor, "default");

            resolved = reporterResolver.resolve("checkstyle", {});
            expected = new CheckStyleReporter();

            should.exist(resolved);

            resolved.constructor.should.equal(expected.constructor, "checkstyle");   

            resolved = reporterResolver.resolve("xml", {});
            expected = new XmlStyleReporter();

            should.exist(resolved);

            resolved.constructor.should.equal(expected.constructor, "xml");            
        });

        it("resolves classes", function() {
            var resolved = reporterResolver.resolve(DefaultReporter, {}),
                expected = new DefaultReporter();

            should.exist(resolved);

            resolved.constructor.should.equal(expected.constructor);
        });

        it("resolves objects", function() {
            var resolved = reporterResolver.resolve({ test: 1 }, { option: true});

            should.exist(resolved);

            resolved.test.should.equal(1);

            should.exist(resolved.options);

            resolved.options.option.should.equal(true);
        });
    });
});