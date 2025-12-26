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
