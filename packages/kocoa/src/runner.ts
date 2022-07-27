import { Adapter, AdapterPlugin, Constructor, IDisposable } from '@kocoa/core';

import { SuiteAnnotation, TestAnnotation, TestDataAnnotation } from './annotations.js';
import { getConfiguration } from './configuration.js';
import { annotationsEvents } from './metadata/index.js';
import { Spec } from './spec.js';

export class Runner implements IDisposable {
    private constructor(private readonly adapter: Adapter) {
        annotationsEvents.on(SuiteAnnotation, 'Added', (target) => this.addSuite(target));
    }

    public static async create(configurationFile?: string): Promise<Runner> {
        const configuration = await getConfiguration(configurationFile);
        if (!configuration.adapter) {
            throw new Error('No test runner adapter specified.');
        }

        const { default: module }: { default: AdapterPlugin } = await import(configuration.adapter);

        return new Runner(module.adapter);
    }

    public dispose() {
        annotationsEvents.off(SuiteAnnotation, 'Added', this.addSuite);
    }

    private static getSpecAnnotations(target: object) {
        const properties = Object.getOwnPropertyDescriptors((target as any).prototype);
        return Object.keys(properties)
            .map((property) => TestAnnotation.get(target, property))
            .filter((annotation): annotation is TestAnnotation => annotation !== null);
    }

    private static getSpecDataAnnotations(spec: TestAnnotation, target: object): (readonly unknown[])[] {
        const specDataAnnotations = TestDataAnnotation.get(target, spec.method);
        if (specDataAnnotations.length === 0) {
            return [[]];
        }

        return specDataAnnotations.flatMap((specData) => Array.from(specData.args()));
    }

    public addSuite(target: object) {
        const suiteAnnotation = SuiteAnnotation.get(target);
        if (!suiteAnnotation) {
            throw new Error(`Failed to retrieve suite for ${target}`);
        }

        const suite = this.adapter.create({
            name: suiteAnnotation.name,
            skip: suiteAnnotation.options.skip
        });

        const specsAnnotation = Runner.getSpecAnnotations(target);
        for (const spec of specsAnnotation) {
            const specDatas = Runner.getSpecDataAnnotations(spec, target);
            for (const data of specDatas) {
                suite.add({
                    name: spec.name,
                    skip: spec.options.skip,
                    init: () => new Spec(target as Constructor<any>, spec.method, data)
                });
            }
        }
    }
}
