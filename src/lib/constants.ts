/**
 * Cover art shown when a volume has none of its own. Google Books omits
 * `imageLinks` for a sizeable share of results, so this is a normal path
 * rather than an error case.
 */
export const FALLBACK_COVER_SRC = "/DefaultBookAvatar.jpg";

/**
 * Same-origin GraphQL endpoint.
 *
 * Deliberately relative: these requests are issued by the browser, so an
 * absolute `http://localhost:3000` would resolve against the *visitor's*
 * machine once deployed.
 */
export const GRAPHQL_ENDPOINT = "/api/graphql";
