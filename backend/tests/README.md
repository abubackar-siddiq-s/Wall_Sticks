# Backend tests

Run with:
```
npm install
npm test
```

Uses `mongodb-memory-server`, which downloads a small MongoDB binary the first time you run tests
(cached after that — subsequent runs are fast). This needs normal internet access; it will not run
in network-sandboxed environments that block `fastdl.mongodb.org`.

## Coverage
- `auth.test.js` — admin login validation, wrong password/email, JWT issuance, password hash never leaks in the response
- `products.test.js` — auth-gated writes, price validation, filtering, sort validation
- `payment-flow.test.js` — the highest-stakes path end to end:
  - order creation validation (empty items, missing shipping phone)
  - **a submitted payment never auto-verifies an order** — this is the core business rule from the spec, and it's asserted directly
  - unauthenticated requests cannot verify/reject payments
  - a verified payment correctly cascades to `order.status = 'verified'`
  - a rejected payment correctly cascades to `order.status = 'rejected'`
  - the full status ladder (printing → packed → shipped → delivered) advances correctly and is recorded in `statusHistory`
  - bogus status values are rejected
