## [v0.8.0]
> Aug  4, 2015

* Fix unmounting
* Fix `Dispatcher#off()`
* Fix `Store#unlisten()`

[v0.8.0]: https://github.com/rstacruz/uflux/compare/v0.7.0...v0.8.0

## [v0.7.0]
> Aug  4, 2015

* `Store#listen()` is now fired immediately.

[v0.7.0]: https://github.com/rstacruz/uflux/compare/v0.6.0...v0.7.0

## [v0.6.0]
> Aug  4, 2015

Rework the API. Major breaking change.

* Deprecated: `Dispatcher#wait()` was removed.
* Deprecated: Emitting dispatcher events in stores will now execute them immediately instead of waiting for changes.
* Implement `Dispatcher#emitAfter()` to make emits that are at the end of the event stack.
* Rename afterEmit() to `Dispatcher#defer()`
* `Dispatcher#defer()` now doesn't take a key argument.

[v0.6.0]: https://github.com/rstacruz/uflux/compare/v0.5.0...v0.6.0

## [v0.5.0]
> Aug  3, 2015

* Add `Store#id` as a unique identifier for stores.

[v0.5.0]: https://github.com/rstacruz/uflux/compare/v0.4.0...v0.5.0

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
