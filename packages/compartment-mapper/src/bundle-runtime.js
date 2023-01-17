// @ts-check
/** @typedef {import('ses').RedirectStaticModuleInterface} RedirectStaticModuleInterface */

import { link } from './link.js';
import {
  makeArchiveImportHookMaker,
} from './import-archive.js';

const textEncoder = new TextEncoder();

export function loadApplication(
  compartmentMap,
  moduleRegistry,
  moduleFunctors,
  archiveLocation,
  // can be undefined
  computeSha512,
  computeSourceLocation,
  options,
) {
  const { globals, modules, transforms, __shimTransforms__, Compartment } =
    options || {};

  const lookupModule = moduleLocation =>
    textEncoder.encode(JSON.stringify(moduleRegistry[moduleLocation]));

  const {
    compartments: compartmentDescriptors,
    entry: { module: moduleSpecifier },
  } = compartmentMap;

  const archiveMakeImportHook = makeArchiveImportHookMaker(
    lookupModule, // <-- this is our get function
    compartmentDescriptors,
    archiveLocation,
    computeSha512,
    computeSourceLocation,
  );

  const makeImportHook = (
    packageLocation, packageName
  ) => {
    const archiveImportHook = archiveMakeImportHook(packageLocation, packageName);
    const { modules: moduleDescriptors } = compartmentDescriptors[packageLocation];
    const importHook = async (moduleSpecifier) => {
      /* this is actually a RedirectStaticModuleInterface */
      const staticModuleRecord = await archiveImportHook(moduleSpecifier);
      // archiveImportHook always setups on an alias record
      // loadRecord will read the alias so use that
      const aliasModuleRecord = staticModuleRecord.record;
      // put precompiledFunctor on the staticModuleRecord
      const moduleDescriptor = moduleDescriptors[moduleSpecifier];
      const moduleLocation = `${packageLocation}/${moduleDescriptor.location}`;
      const makeModuleFunctor = moduleFunctors[moduleLocation];
      aliasModuleRecord.__precompiledFunctor__ = makeModuleFunctor()
      return staticModuleRecord;
    };
    return importHook;
  }

  const { compartment, compartments } = link(compartmentMap, {
    makeImportHook,
    // parserForLanguage,
    undefined,
    globals,
    modules,
    transforms,
    __shimTransforms__,
    Compartment,
  });


  /** @type {ExecuteFn} */
  const execute = () => {
    // eslint-disable-next-line dot-notation
    return compartment['import'](moduleSpecifier);
  };

  return { execute, compartments };
}


/*

NOTES


// we want to approximately create an archive compartmentMap with functors
// and then link the compartmentMap into an application via a custom importHook that uses getFunctor

// link turns a compartmentMap (CompartmentDescriptors) into an application (Compartments)
// - actual module sources are loaded via `get`
//   -> get could be replaced with getFunctor <----------------------
// - makeArchiveImportHookMaker/importHook creates the records via the parser and `get` and `compartmentMap`
//   -> can call getFunctor and put it on the record
// - parser creates a functor via compartment.evaluate
//   -> could provide custom compartments that when evaluate is called refer to a precompile
//   -> parser could pull module functor off of compartment

// can make an alternate parser for language that pulls the functors out from somewhere


application.execute
  ses/src/compartment-shim import
    ses/src/module-load load
      memoizedLoadWithErrorAnnotation
        loadWithoutErrorAnnotation
          importHook (via makeArchiveImportHookMaker) returns { record, specifier: moduleSpecifier } as staticModuleRecord
            parse (via parserForLanguage) returns { record }
          loadRecord assumes record is an alias, returns moduleRecord wrapping record
    compartmentImportNow
      ses/src/module-link link()
        ses/src/module-link instantiate()
          if(isPrecompiled)
            makeModuleInstance  <-- COULD call our functor
              compartmentEvaluate
          else
            makeThirdPartyModuleInstance
              staticModuleRecord.execute <-- calls our execute


  moduleRecord <- from loadRecord
    staticModuleRecord <- from importHook
      record <- from parserForLanguage[language].parse

if(isPrecompiled)
  makeModuleInstance
    sets execute: __precompiledFunctor__
else
  makeThirdPartyModuleInstance
    sets execute: staticModuleRecord.execute
      execute (via parserForLanguage) from parse-pre-cjs.js

>>>>>>>>> questions

import-archive always invokes module record aliases - is this intentional?

makeModuleInstance + makeThirdPartyModuleInstance
  dont rhyme as much as I'd like

<<<<<<<<<<< TODO

'pre-cjs-json' calls evaluate

*/