import { convexTest } from 'convex-test';
import { expect, test } from 'vitest';
import schema from '../convex/schema';
import { api } from '../convex/_generated/api';

const modules = import.meta.glob('../convex/**/*.ts');
const token = 'a'.repeat(64);

test('saves normalized email and optional address; retries do not duplicate records', async () => {
  const t = convexTest(schema, modules);
  await t.mutation(api.invitations.submit, { email: ' Guest@Example.com ', token });
  await t.mutation(api.invitations.submit, { email: 'guest@example.com', token });
  const before = await t.run((ctx) => ctx.db.query('invitations').collect());
  expect(before).toHaveLength(1);
  expect(before[0].email).toBe('guest@example.com');
  expect(before[0].address).toBeUndefined();
  await t.mutation(api.invitations.saveAddress, { token, address: ' 123 Test St\nDelhi, India ' });
  const after = await t.run((ctx) => ctx.db.query('invitations').collect());
  expect(after[0].address).toBe('123 Test St\nDelhi, India');
});

test('rejects invalid inputs and prevents another submission from updating an address', async () => {
  const t = convexTest(schema, modules);
  await expect(t.mutation(api.invitations.submit, { email: 'invalid', token })).rejects.toThrow();
  await expect(t.mutation(api.invitations.submit, { email: 'a@b.com', token: 'short' })).rejects.toThrow();
  await t.mutation(api.invitations.submit, { email: 'guest@example.com', token });
  await expect(t.mutation(api.invitations.submit, { email: 'other@example.com', token })).rejects.toThrow();
  await expect(t.mutation(api.invitations.saveAddress, { token: 'b'.repeat(64), address: 'An address' })).rejects.toThrow();
  for (const address of [' ', 'a'.repeat(2001)]) {
    await expect(t.mutation(api.invitations.saveAddress, { token, address })).rejects.toThrow();
  }
});
