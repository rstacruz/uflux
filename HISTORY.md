## [v0.4.0]
> Aug  3, 2015

* Store `change` events are now debounced. If a chain of dispatcher events will modify the store through many steps (by dispatching more events), the `change` event will now only happen once instead of multiple times.
* Implemented `Dispatcher#isEmitting()` to check if the dispatcher is currently in the middle of an event handler.
* Implemented `Dispatcher#emitDepth` to check how deep the stack is of event handlers.
* Implemented `Dispatcher#afterEmit()` to execute something after event handlers have finished processing.

[v0.4.0]: https://github.com/rstacruz/uflux/compare/v0.3.0...v0.4.0

## [v0.3.0]
> Jul 31, 2015

* Allow usage in the browser without precompilation (`dist/index.js`).

[v0.3.0]: https://github.com/rstacruz/uflux/compare/v0.2.0...v0.3.0

## [v0.2.0]
> Jul 31, 2015

* Implement `Store.dup()` to allow testing stores.
* Refactors `Store` internals.

[v0.2.0]: https://github.com/rstacruz/uflux/compare/v0.1.0...v0.2.0

## v0.1.0
> Jul 31, 2015

* Initial release.
