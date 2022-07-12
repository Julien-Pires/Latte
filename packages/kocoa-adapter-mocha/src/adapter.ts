import * as Mocha from 'mocha';

import { Adapter, Spec, Suite } from '@kocoa/core';

import { MochaSpec } from './spec.js';
import { MochaSuite } from './suite.js';

/**
 * Adapter class for Mocha library.
 */
export class MochaAdapter implements Adapter {
    private readonly _rootSuite: Mocha.Suite;

    /**
     * Constructor of MochaAdapter class.
     */
    constructor() {
        this._rootSuite = describe('', () => {
            return;
        });
    }

    /**
     * Adds a test suite to the current Mocha run.
     * @param suite Test suite informations.
     * @param specs List of specs contained in the test suite.
     * @param target Prototype of the class that owns the test suite.
     */
    public addSuite<TTarget extends object>(
        suite: Suite,
        specs: Spec<Exclude<keyof TTarget, number>>[],
        target: TTarget
    ): void {
        const newSuite = new MochaSuite(suite);
        for (const spec of specs) {
            newSuite.addTest(new MochaSpec(spec, target));
        }

        this._rootSuite.addSuite(newSuite);
    }
}
