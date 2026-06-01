# Contributing to RealtimeJS

First off, thank you for considering contributing to RealtimeJS! It's people like you that make RealtimeJS such a great tool.

## Where do I go from here?

If you've noticed a bug or have a feature request, make one! It's generally best if you get confirmation of your bug or approval for your feature request via an Issue before starting to code.

## Developing

1. Fork the repo and create your branch from `main` (or `master`).
2. Install dependencies via `npm install`.
3. If you've added code that should be tested, add tests.
4. If you've changed APIs, update the documentation.
5. Ensure the test suite passes by running `npm run build` across the monorepo.
6. Make sure your code complies with our [Engineering Standards](docs/12-engineering-standards.md).

## The Adapter Architecture (Best Way to Contribute!)

RealtimeJS is built on an Adapter Architecture. The absolute best way to contribute to this ecosystem is to build a new adapter!
- **Transports**: Native WebSockets, MQTT, NATS, Kafka.
- **Databases**: Supabase, PostgreSQL, MongoDB, Pocketbase.
- **Cache/PubSub**: Redis, Valkey, RabbitMQ.

Look at `packages/adapters/socketio` for a reference implementation. Make sure your adapter implements the core interfaces defined in `@realtimejs/core/src/adapters/`.

## Pull Request Process

1. Use the provided Pull Request Template.
2. Ensure you have not directly imported an adapter implementation into `@realtimejs/core`. The core must remain framework-agnostic and interface-driven.
3. You may merge the Pull Request in once you have the sign-off of the maintainers.
