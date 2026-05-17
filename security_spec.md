# Security Specification - FITCO STUDIO

## Data Invariants
1. A user can only access their own fitness data, coach history, and profile.
2. Premium features (like specialized coach feedback or advanced analytics) might be restricted to `isPremium: true` users in the future, but for now, we enforce self-ownership.
3. Users cannot modify their own `isPremium` status directly (it should be set via a server/admin flow, but for this prototype we'll monitor it).
4. Timestamps must be validated to prevent future-dating logs.

## The "Dirty Dozen" Payloads (Red Team Tests)
1. **Identity Theft**: User A tries to read User B's `/users/userB/foodLogs`.
2. **Goal Spoofing**: User A tries to update User B's `dailyKcalGoal`.
3. **Privilege Escalation**: User A tries to set `isPremium: true` on their own profile.
4. **ID Poisoning**: User tries to create a food log with a document ID that is 2MB of junk text.
5. **Timestamp Fraud**: User tries to set `updatedAt` to a date in 2030.
6. **Shadow Fields**: User tries to add a `role: "admin"` field to their food log entry to bypass logic.
7. **Type Mismatch**: User tries to send `kcal: "A LOT"` (string instead of number).
8. **Orphaned Writes**: User tries to log food for a `userId` that doesn't match their auth UID.
9. **Bulk Scrape**: User tries to list all documents in the top-level `/users` collection.
10. **Malicious ID Char**: User tries to use `../` or special chars in a document ID.
11. **Immutability Breach**: User tries to change their `uid` field in an existing profile.
12. **Null Injection**: User sends `kcal: null` for a required field.

## Verification
All these payloads must receive `PERMISSION_DENIED`.
