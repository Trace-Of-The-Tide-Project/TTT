# Backend Asks — Writing Room intake (workshops & encounters)

> Scope: the admin **Writing Room** review screens under `/admin/*` (workshops, encounters). The residency review already works end-to-end. The two endpoints below are the only thing missing for workshops + encounters; once they exist, the frontend works with no further changes.
>
> Backend reference: `https://ttt-api-619600614028.europe-west2.run.app/api/docs`.

---

## Current state (verified live against the API)

| Stream | Public submit | List for admin | Approve / Reject |
|---|---|---|---|
| **Residency** | `POST /residency/apply` ✅ | `GET /residency/applications` ✅ | `PATCH /residency/applications/{id}` `{status}` ✅ |
| **Workshops** | `POST /workshops/{id}/apply` ✅ | nested in `GET /workshops/{id}.applications` (used as a workaround) | **❌ MISSING** |
| **Encounters** | `POST /encounters/{id}/book` ✅ | **❌ MISSING** | **❌ MISSING** |

What the frontend does today:

- **Workshops** — aggregates the embedded `applications` arrays from `GET /workshops/admin` + `GET /workshops/{id}`. List works, but approve/reject buttons hit a not-yet-existing endpoint and surface a toast error.
- **Encounters** — calls a not-yet-existing list endpoint, so the screen shows the load-error state.

Both screens are wired against the exact endpoint shape requested below — when the backend ships them, the buttons start working with no UI change.

---

## Ask #1 — Workshop applications (mirrors residency)

```
GET   /workshop-applications                  → list all (admin/editor, bearer)
PATCH /workshop-applications/{id}             → { status: "approved" | "rejected" | "pending" }
```

The application records already exist in the DB (you embed them in `GET /workshops/{id}.applications`). We just need a dedicated list + status update. Field shape from your live response:

```jsonc
{
  "id": "bde149b1-…",
  "workshop_id": "688e00d6-…",
  "name": "aya",
  "email": "algaleesaya@gmail.com",
  "experience_level": "…",
  "status": "pending",
  "createdAt": "2026-05-26T12:54:32.156Z",
  "updatedAt": "2026-05-26T12:54:32.156Z"
}
```

Optionally include the parent workshop title in the list response so the frontend doesn't have to N+1 fetch.

---

## Ask #2 — Encounter bookings (mirrors residency)

```
GET   /encounter-bookings                     → list all bookings (admin/editor, bearer)
PATCH /encounter-bookings/{id}                → { status: "approved" | "rejected" | "pending" }
```

Booking submissions arrive via `POST /encounters/{id}/book` with fields `{name, email, message}`. They're not retrievable today (`GET /encounters/{id}` returns only `schedule`, no bookings array). Expected booking record:

```jsonc
{
  "id": "uuid",
  "encounter_id": "uuid",
  "name": "string",
  "email": "string",
  "message": "string | null",
  "status": "pending",
  "createdAt": "ISO",
  "updatedAt": "ISO"
}
```

Same as workshops — including the encounter title in the list response is a nice-to-have (avoids a second fetch per row).

---

## Nice-to-have (not blocking, mentioned for completeness)

- `PATCH /residency/applications/{id}` accepts `{status}` (good) — no other fields. If you want to surface "reviewer notes," add an optional `notes: string` field; the UI can drop it in as a textarea in seconds.
- Status enum: both endpoints should accept exactly `"approved" | "rejected" | "pending"` (matches residency's behavior). The frontend sends those literal strings.
