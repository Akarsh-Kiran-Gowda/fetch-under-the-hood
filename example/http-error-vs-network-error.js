fetch("/missing-resource")
  .then((response) => {
    // HTTP errors still resolve the promise
    if (!response.ok) {
      console.error("HTTP error:", response.status);
      return;
    }
    return response.text();
  })
  .then((text) => {
    if (text !== undefined) {
      console.log(text);
    }
  })
  .catch((error) => {
    // Rejection occurs when no Response can be produced
    console.error("Request failed:", error);
  });
