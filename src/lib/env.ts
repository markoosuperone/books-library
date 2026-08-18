import "server-only";

/**
 * Server-side environment variables, validated once when this module is first
 * imported. A misconfigured deploy then fails immediately with a message that
 * names the offending variable, instead of surfacing later as an opaque
 * connection error or a 400 from an upstream API.
 *
 * `server-only` keeps these values out of the client bundle: importing this
 * file from a Client Component is a build error rather than a leaked secret.
 */

type Rule = {
  description: string;
  /** Returns a problem description, or null when the value looks valid. */
  check: (value: string) => string | null;
};

const SPEC = {
  MONGODB_URI: {
    description: "MongoDB Atlas connection string",
    check: (value) =>
      /^mongodb(\+srv)?:\/\//.test(value)
        ? null
        : 'must start with "mongodb://" or "mongodb+srv://"',
  },
  API_KEY: {
    description: "Google Books API key",
    check: (value) =>
      value.startsWith("AIza")
        ? null
        : 'does not look like a Google API key (expected it to start with "AIza")',
  },
} satisfies Record<string, Rule>;

type EnvKey = keyof typeof SPEC;

const loadEnv = (): Record<EnvKey, string> => {
  const values = {} as Record<EnvKey, string>;
  const problems: string[] = [];

  for (const key of Object.keys(SPEC) as EnvKey[]) {
    const { description, check } = SPEC[key];
    const value = process.env[key]?.trim();

    if (!value) {
      problems.push(`${key} is missing - ${description}`);
      continue;
    }

    const problem = check(value);
    if (problem) {
      problems.push(`${key} ${problem}`);
      continue;
    }

    values[key] = value;
  }

  if (problems.length > 0) {
    throw new Error(
      [
        "Invalid environment configuration:",
        ...problems.map((problem) => `  - ${problem}`),
        "",
        "Copy .env.example to .env.local and fill in the values.",
      ].join("\n")
    );
  }

  return values;
};

export const env = loadEnv();
