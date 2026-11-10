import assert from "node:assert/strict";
import { test } from "node:test";

import { getAuthenticatedUser } from "./authMiddleware";

test("getAuthenticatedUser forwards the bearer token to Supabase", async () => {
  const fakeClient = {
    auth: {
      getUser: async (jwt?: string) => {
        assert.equal(jwt, "abc123");
        return {
          data: {
            user: { id: "user-123", email: "user@example.com" },
          },
          error: null,
        };
      },
    },
  } as any;

  const response = await getAuthenticatedUser("abc123", fakeClient);

  assert(response.data.user);
  assert.equal(response.data.user?.id, "user-123");
  assert.equal(response.data.user?.email, "user@example.com");
  assert.equal(response.error, null);
});
