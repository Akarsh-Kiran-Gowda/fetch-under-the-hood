# fetch() under the hood

This repository explores design decisions and edge cases of the Fetch API,
with a focus on error handling, `Response` semantics, and body consumption.

It is intended for developers who want to understand *why* `fetch()` behaves
the way it does, not just how to use it.

## HTTP error responses and rejection

The `fetch()` promise does not reject for HTTP error status codes such as
404 or 500. In these cases, the promise resolves successfully with a
`Response` object whose `ok` property is set to `false`.

Rejection occurs when the browser is unable to produce a `Response`
object at all, for example due to network failures, request abortion,
or other browser-level errors. As a result, HTTP error handling must be
performed explicitly by checking the `Response` object.

```js
fetch("/missing-resource")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    return response.text();
  })
  .then((text) => {
    console.log(text);
  })
  .catch((error) => {
    console.error("Fetch failed:", error);
  });
```

## Why fetch() resolves on HTTP error status codes

From the perspective of the Fetch API, receiving an HTTP response—regardless
of its status code—means the request was successfully completed at the
protocol level. As a result, HTTP error responses such as 404 or 500 do not
cause the `fetch()` promise to reject.

This design allows applications to inspect the response metadata, headers,
and body even when the server indicates an error. Treating these cases as
rejections would prevent access to useful information, such as error payloads
returned in the response body.

Instead, `fetch()` exposes the success or failure of the HTTP response through
the `Response` object, most notably via the `ok` and `status` properties.

## When does fetch() actually reject?

**The common misconception**
A widely repeated statement is:
> “`fetch()` only rejects on network errors.”

This is **directionally useful**, but **technically incomplete**.

Understanding *why* it’s incomplete requires separating HTTP semantics from promise semantics.

## HTTP errors vs Promise rejection

An HTTP response like `404`, `401`, or `500`:

* **Is a valid HTTP response**

* Produces a valid `Response` object

* Resolves the `fetch()` promise successfully

```js
fetch("/missing-resource")
  .then((response) => {
    console.log(response.status); // 404
    console.log(response.ok);     // false
  });
```

From the Fetch API’s perspective:
*The network request succeeded
*The server responded correctly
*The error is application-level, not transport-level

## So when does `fetch()` reject?

`fetch()` rejects when it **cannot produce a Response at all.**

This includes (but is not limited to):

* Network connectivity failures
* DNS resolution failures
* Connection timeouts
* TLS / certificate errors
* Requests blocked by the browser (e.g. certain CORS failures)
* Aborted requests (AbortController)

```js
try {
  await fetch("https://invalid-domain.example");
} catch (err) {
  // No Response object exists here
  console.error(err);
}
```

In these cases:

* There is no status code
* There is no headers object
* There is no body
* There is no Response
The promise rejects because the Fetch algorithm cannot complete.

## Why `response.ok` exists

Because HTTP errors resolve successfully, the API provides:

* `response.ok`
* `response.status`

This makes error handling **explicit**, not implicit.

```js
const response = await fetch(url);

if (!response.ok) {
  throw new Error(`HTTP error: ${response.status}`);
}
```

This design:
* Prevents silent failures
* Forces developers to decide what “error” means for their application
* Keeps transport errors separate from application errors

## Why this matters

Confusing HTTP errors with promise rejection leads to:

* Missing error handling
* Incorrect `catch()` usage
* Assumptions that break when moving from `axios` or XHR

Understanding this distinction is essential to writing **correct Fetch-based code**, not just working code.

## Key takeaway

> `fetch()` rejects when the browser cannot obtain a response.
> HTTP error statuses still resolve, because a response exists.

This separation is intentional and foundational to the Fetch API design.
