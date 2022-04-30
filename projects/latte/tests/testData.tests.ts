import chai from 'chai';
import chaiSubset from 'chai-subset';

import { test, testData, TestDataAnnotation, testDataSymbol, suite } from '../index.js';
import { TestDataFixture } from './testData.fixtures.js';
import * as Reflect from '../src/annotations/reflect.js';

const { expect } = chai;

chai.use(chaiSubset);

@suite('@testData')
export class TestDataDecoratorTests {
    @test
    @testData({ testName: 'should contains test data metadata when target has one annotation' })
    public shouldAddSingleTestDataMetadata() {
        const actual = Reflect.getAllMetadata<TestDataAnnotation>(
            testDataSymbol,
            TestDataFixture.prototype,
            TestDataFixture.prototype.singleTestData.name
        );

        expect(actual).to.not.be.undefined;
        expect(actual).to.be.of.length(1);
    }

    @test
    @testData({ testName: 'should contains multiple test data metadata when target has multiple annotation' })
    public shouldAddMultipleTestDataMetadata() {
        const actual = Reflect.getAllMetadata<TestDataAnnotation>(
            testDataSymbol,
            TestDataFixture.prototype,
            TestDataFixture.prototype.multipleTestData.name
        );

        expect(actual).to.not.be.undefined;
        expect(actual).to.be.of.length(3);
    }

    @test
    @testData({ testName: 'should not contains fixtures when no fixtures has been specified' })
    public shouldNotContainsTestFixtures() {
        const actual = Reflect.getAllMetadata<TestDataAnnotation>(
            testDataSymbol,
            TestDataFixture.prototype,
            TestDataFixture.prototype.singleTestData.name
        );

        expect(actual).to.have.deep.members([{ args: [] }]);
    }

    @test
    @testData({ testName: 'should contains test fixtures when multiple fixtures have been specified' })
    public shouldContainsTestFixtures() {
        const actual = Reflect.getAllMetadata<TestDataAnnotation>(
            testDataSymbol,
            TestDataFixture.prototype,
            TestDataFixture.prototype.multipleTestData.name
        );

        expect(actual).to.containSubset([{ args: [1, 2] }, { args: [100, 200] }, { args: [1000, 2000] }]);
    }

    @test
    @testData(1, 2, 3)
    @testData(100, 200, 300)
    @testData(9999, 1, 10000)
    public shouldPassTestFixturesToTestFunction(n1: number, n2: number, expected: number) {
        expect(n1 + n2).to.equals(expected);
    }

    @test
    @testData({ testName: 'should not have test name when name is not specified' })
    public shouldNotHaveTestName() {
        const actual = Reflect.getAllMetadata<TestDataAnnotation>(
            testDataSymbol,
            TestDataFixture.prototype,
            TestDataFixture.prototype.singleTestData.name
        );

        expect(actual[0]).to.not.have.property('testName');
    }

    @test
    @testData({ testName: 'should have test name when one is specified' })
    public shouldHaveTestName() {
        const actual = Reflect.getAllMetadata<TestDataAnnotation>(
            testDataSymbol,
            TestDataFixture.prototype,
            TestDataFixture.prototype.multipleTestData.name
        );

        expect(actual).to.containSubset([
            { name: '1 plus 2 should return 3' },
            { name: '100 plus 200 should return 300' },
            { name: '1000 plus 2000 should return 3000' }
        ]);
    }
}
