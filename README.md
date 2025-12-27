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
