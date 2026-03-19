# Data Integrity Migration Plan

## Goal
Refactor schema and architecture safely without losing existing database records.

## Mandatory prerequisites
1. Use MongoDB Atlas in production.
2. Enable Atlas automated backups and point-in-time restore (PITR).
3. Take an on-demand snapshot before running any migration.
4. Validate `.env` includes `MONGO_URI` and `JWT_SECRET`.

## Deployment sequence
1. Deploy non-destructive schema changes:
   - `Booking.amountValue`
   - `Booking.statusHistory`
   - `Booking.prescriptionId`
   - `Prescription.bookingObjectId`
2. Deploy application code that writes canonical + compatibility fields.
3. Run:
   - `npm run migrate:data-integrity`
4. Verify:
   - Revenue reports still return expected totals.
   - Existing prescriptions resolve by booking.
   - Existing bookings return status history.
5. Observe for one release window before removing deprecated read fallbacks.

## Validation checklist
- Booking creation rejects null/undefined required inputs.
- Auth registration/login rejects malformed payloads.
- Location writes reject invalid coordinate order/range.
- Socket events are emitted from a single initialized instance.
- No record count drops across bookings/prescriptions before vs after migration.

## Rollback
1. Stop app writes.
2. Restore Atlas snapshot/PITR to pre-migration timestamp.
3. Redeploy previous app version.
4. Re-run smoke tests before reopening traffic.
