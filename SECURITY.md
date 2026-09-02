# Security Policy

## Supported Versions

This package follows [Semantic Versioning](https://semver.org/). Only the
latest published major version receives security fixes.

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

Report vulnerabilities privately via
[GitHub Private Vulnerability Reporting](https://github.com/rumbor-io/crane-sdk-node/security/advisories/new):
open the repository's **Security** tab → **Report a vulnerability**. This
creates a private advisory visible only to maintainers until a fix is
coordinated and disclosed.

Include, where possible:
- Affected version(s) of `@rumbor/crane-sdk-node`.
- Steps to reproduce or a proof of concept.
- Impact assessment (what an attacker can do, and prerequisites).

## Response

Maintainers acknowledge new reports and coordinate a fix and disclosure
timeline through the private advisory thread. Once resolved, the advisory
is published and, where applicable, a patched version is released and a
`GHSA` identifier is issued.

## Scope

This repository ships an HTTP client SDK. It has no server-side runtime and
does not process untrusted input beyond what callers pass into its request
parameters. Vulnerabilities in the vendored OpenAPI contract
(`openapi/crane-engine.yaml`) or in the upstream Rumbor Crane Engine itself
are out of scope here — report those through the appropriate private
channel, as `rumbor-io/rumbor-crane-engine` is a private repository.
