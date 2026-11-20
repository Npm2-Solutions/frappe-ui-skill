# Data fetching (frappe-ui 1.2.0)

What is in this file: every way frappe-ui talks to a Frappe server — the v2 composables (`useCall`, `useList`, `useDoc`, `useDoctype`, `useNewDoc`), their internals (`useAction`, `useIsolatedCall`, `useFrappeFetch`, `docStore`/`listStore`/`idbStore`, `writeGate`), the frozen v1 resources (`createResource`, `createListResource`, `createDocumentResource`) and the plain transports (`call`, `frappeRequest`, `request`). Source: `src/data-fetching/`, `src/resources/`, `src/utils/{call,frappeRequest,request,config,plugin}.ts`.

Sections
1. Which one to use
2. Shared rules (return shape, URLs, headers, errors, cache keys)
3. useCall
4. useList
5. useDoc
6. useDoctype
7. useNewDoc
8. Internals: useAction, useIsolatedCall, useFrappeFetch, stores, writeGate
9. v1: createResource
10. v1: createListResource
11. v1: createDocumentResource
12. Transports: call, frappeRequest, request, setConfig, FrappeUI plugin, realtime
13. Gotchas (ranked)

---

## 1. Which one to use

| Need | Use | Endpoint it hits |
|---|---|---|
| A list of records, "load more" paging, reactive filters (numbered pages: §4 gotchas) | `useList` | `GET /api/v2/document/<doctype>` |
| The total for a filter; a record copied as a new draft | `useCall` (§3 «Two more v2 endpoints») | `GET /api/v2/doctype/<dt>/count`, `GET /api/v2/document/<dt>/<name>/copy` |
| One record, shared across components, edit fields, call its methods | `useDoc` | `GET/PUT/DELETE /api/v2/document/<doctype>/<name>`, `POST …/<name>/method/<m>` |
| A "new record" form | `useNewDoc` | `POST /api/v2/document/<doctype>` |
| Write actions on many rows without loading each (delete row X, set field on row Y, run a method) | `useDoctype` | insert/PUT/DELETE as above; `POST /api/v2/method/<doctype>/<method>` |
| Any whitelisted method, read (auto) or action (`submit`) | `useCall` with `url: '/api/v2/method/<dotted.path>'` | whatever `url` + `method` say |
| One-off imperative call in a handler, returns the value | `call('app.module.fn', args)` | `POST /api/method/<dotted.path>` → `message` |
| Old code / Options API | `createResource` & co. (frozen through 1.x, un-deprecated) | `/api/method/...` via `resourceFetcher` |

Exports from `frappe-ui` (`src/data-fetching/index.ts`, `src/resources/index.ts`, `src/index.ts:13-21`): `useCall`, `useList`, `useDoc`, `useDoctype`, `useNewDoc`, `FrappeResponseError`, list types (`UseListOptions`, `Filters`, `OrderBy`…), `UseCallOptions`, `BasicParams`, `CacheKey`, `createResource`, `getCachedResource`, `createListResource`, `getCachedListResource`, `createDocumentResource`, `getCachedDocumentResource`, `getLocal`/`saveLocal`/`deleteLocal`, `resourcesPlugin`, `onDocUpdate`, `call`, `frappeRequest`, `FrappeResourceError` (type). **Not exported**: `useAction`, `useIsolatedCall`, `useFrappeFetch`, `request`, `docStore`, `listStore`, `idbStore`, `writeGate` — so `docStore.setCacheTimeout()` / `clearAll()` are unreachable from an app.

## 2. Shared rules

| Rule | v2 composables (`use*`) | v1 resources / `call` / `frappeRequest` |
|---|---|---|
| Returned object | `reactive({...})`: read `x.data`, `x.loading` — never `.value`; do not destructure | `reactive({...})` too |
| Response unwrapping | reads `response.data` (Frappe `/api/v2` shape) — `useCall.ts:207,288` | `frappeRequest` returns `body.message`; whole body if it has `docs` or is `/api/method/login` (`frappeRequest.ts:150-177`) |
| Dotted method names | not expanded; `url` used as-is (+ `baseUrl`) | `frappeRequest` prefixes `/api/method/` to any url not starting with `/` or `http(s)://` (`frappeRequest.ts:125`) |
| Headers | `Accept`, `Content-Type: application/json`, `X-Frappe-Site-Name: location.hostname`, `X-Frappe-CSRF-Token` if `window.csrf_token` is set and not the literal `'{{ csrf_token }}'` (`useFrappeFetch.ts:237-259`) | same, plus `setConfig('requestHeaders')`, plus `requestBaseUrl` (`frappeRequest.ts`) |
| Error type | `FrappeResponseError` (class; `instanceof` works): `message = "<type>: <message>"` (just `"<type>"` or `"<type> (Traceback)"` when the server sent no message), `.title`, `.type`, `.exception`, `.indicator` — built from `errors[0]` of the body (`useFrappeFetch.ts:179-232`); no field holds the message alone (see «Showing a server error» below) | `FrappeResourceError` (a type over plain `Error`, never `instanceof`): `.messages: string[]`, `.exc_type`, `.exc`, `.status`, `.response` (`frappeRequest.ts:20-35`) |
| Actions vs reads | `submit()` **rejects** on failure; `execute`/`fetch`/`reload` **resolve** (`null`) and you read `error` | `fetch`/`submit`/`reload` reject (`resources.js:183`) |
| `docs` side channel | any response carrying `docs: [...]` is written to `docStore` + every `useList` of that doctype (`useFrappeFetch.ts:166-176`) | `run_doc_method` `docs` update v1 list/doc resources |
| IndexedDB cache | opt-in `cacheKey`; key = `JSON.stringify(['useCall:v2' or 'useList:v2', ...key])`, prefixed `ns:<user_id cookie>:` per signed-in user (`utils.ts:80-130`); docs always cached as `doc:v2:<doctype>/<name>` | opt-in `cache`; key = `JSON.stringify([key])`, **not** namespaced per user (`resources.js:224-232`) |
| Realtime | none | `realtime: true` + a `$socket` on the component instance (`listResource.js:267`, `documentResource.js:270`) |
| Dates | Frappe sends datetimes as naive strings in the site's time zone: show them through `dayjsLocal(s)` (needs `setConfig('systemTimezone')`, [setup-and-tokens.md «Dates»](setup-and-tokens.md#dates-dayjs-dayjslocal-dayjssystem-srcutilsdayjsts)) | same |

**Showing a server error.** The body's `errors[0].message` is what `frappe.throw` was given and may hold HTML (`frappe.bold` → `<strong>`). `ErrorMessage` — also what `dialog.*` uses for a rejected `onConfirm` (utils/dialog.ts:271-280, :434) — shows the whole `"ValidationError: …"`, HTML rendered (sanitised). For words a person reads, strip the type and the tags:
```ts
import { FrappeResponseError } from 'frappe-ui'
export function serverMessage(e: unknown, fallback: string): string {
  if (!(e instanceof FrappeResponseError)) return fallback     // network failure, abort, your own throw
  const head = `${e.type}: `
  if (!e.message.startsWith(head)) return fallback             // the server sent no message
  const text = new DOMParser().parseFromString(e.message.slice(head.length), 'text/html').body.textContent
  return text?.trim() || fallback
}
// <ErrorMessage v-if="save.error" :message="serverMessage(save.error, `Couldn't save the job.`)" />; also for a field's `error` or a toast
```

## 3. useCall

**For** — a call to any URL (usually `/api/v2/method/<dotted.path>`), as an auto-loading read or a `submit()` action. For records prefer `useList`/`useDoc`; for a one-shot in a click handler `call()` is simpler.
**Import** — `import { useCall } from 'frappe-ui'`

Options (`useCall/types.ts`, defaults `useCall.ts:40-55`)

| Option | Type | Default | Notes |
|---|---|---|---|
| `url` | `string \| Ref<string>` | — | used as-is, prefixed by `baseUrl` |
| `method` | `'GET'\|'POST'\|'PUT'\|'DELETE'` | `'GET'` | GET puts params in the query string, others in a JSON body |
| `params` | object \| `() => object` | — | top-level refs are unwrapped (`unrefObject`); a getter is reactive |
| `immediate` | boolean | **`true`** | fires on creation — also for POST |
| `refetch` | boolean | `false` | `true`: re-send when url or params change |
| `cacheKey` | `string \| array` | — | shows the IndexedDB copy while loading / on error |
| `staleOnError` | boolean | `false` | keep cache on a *network* error; never on a `FrappeResponseError` (`useCall.ts:360-362`) |
| `initialData` | TResponse | — | seed for `data` |
| `baseUrl` | string | `''` | |
| `transform` | `(data) => data` | — | runs on fresh and cached data; returning `undefined` keeps the (mutated) input |
| `beforeSubmit` | `(params) => void \| Promise` | — | throw to cancel: no request, `submit()` rejects |
| `onSuccess` / `onError` | `(data)` / `(error)` | — | fire for every request, not only `submit` |

Returned (reactive): `data` (`T \| null`), `error`, `loading` (= `isFetching`), `isFetching`, `isFinished`, `canAbort`, `aborted`, `url` (computed, with query), `params` (effective), `promise`, `abort()`, `execute()`/`fetch()`/`reload()` (resolve `data` or `null`), `submit(params?)` (resolve `data`, reject on failure), `reset()` (drops submitted params).

GET params: plain objects and arrays are sent as JSON strings, `null`/`undefined`/`{}` skipped (`utils.ts:4-20`).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCall } from 'frappe-ui'

const project = ref('PRJ-0001')
// read: refetches when `project` changes
const stats = useCall<{ open: number; closed: number }>({
  url: '/api/v2/method/myapp.api.project_stats',
  params: () => ({ project: project.value }),
  refetch: true,
  cacheKey: ['project-stats'],
})
// action: never auto-fires
const close = useCall<void, { name: string }>({
  url: '/api/v2/method/myapp.api.close_project',
  method: 'POST',
  immediate: false,
})
async function onClose() {
  try { await close.submit({ name: project.value }); stats.reload() }
  catch (e) { /* e is FrappeResponseError for a server error */ }
}
</script>
<template>
  <span v-if="stats.data">{{ stats.data.open }} open</span>
  <Button :loading="close.loading" @click="onClose">Close</Button>
</template>
```

Gotchas
- `useCall` reads `response.data` (`useCall.ts:207,288,310`). A v1 URL (`/api/method/x`) answers `{message}` → `data` is `null` with no error. Use `/api/v2/method/x`, or `call()`.
- `immediate` defaults to `true` for every method (`useCall.ts:44`): a `method: 'POST'` action without `immediate: false` fires on mount.
- `submit(params)` stores those params and they **override `params` for every later request** until `reset()` (`useCall.ts:248`, `291`).
- **A failed refresh blanks `data`.** On a non-2xx VueUse sets `data` back to `initialData || null` (`@vueuse/core` useFetch, `dist/index.js:3807-3809`), and the IndexedDB copy is never shown for a `FrappeResponseError` — `staleOnError` covers only network errors (`useCall.ts:298-311`, `:360-362`). So the guard `x.loading && !x.data` (skeleton) then `x.error` turns a failed reload into the error state and the old values vanish. While a reload is in flight `data` keeps the old value (VueUse clears only `error` at the start). Keep the last good value yourself and show the error beside it:
  ```ts
  const last = ref<Stats | null>(null)
  const stats = useCall<Stats>({ url: '/api/v2/method/myapp.api.stats', onSuccess: (d) => (last.value = d) })
  // skeleton: stats.loading && !last · values: last · error: stats.error (inline, with Retry)
  ```
  `useList` keeps its rows on a failed reload (its own copy, `useList.ts:83`, `:154-164`) and `useDoc().doc` stays in the doc store.
- One `useCall` = one request at a time: a second `execute`/`submit` aborts the first (VueUse `abort()` at the top of `execute`). The aborted `submit()` rejects with the abort (`useCall.ts:281-287`). For concurrent writes use `useDoctype`/`useDoc` members.
- `params` getter is only reactive with `refetch: true`; otherwise the new value is used on the next `reload()`/`submit()`.
- Errors thrown inside `onSuccess`/`onError` are swallowed into `console.error` (`useCall.ts:152,163`).

**Two more v2 endpoints a list page needs** (routes `frappe/api/v2.py:277-321`; only the URL parts reach the endpoint function, the rest is read from the query, `api/__init__.py:59-63`):

| Need | Endpoint | Answers |
|---|---|---|
| The total for the current filters ("1–50 of 1,284") | `GET /api/v2/doctype/<doctype>/count` with `filters` (and `or_filters`, `distinct`) in the query | `data: number` — `frappe.desk.reportview.get_count` (api/v2.py:165-170). With a `limit` it counts at most that many under a 1 s statement timeout and may answer `null` (reportview.py:98-118): leave it out for an exact total |
| A record as a new, unsaved draft ("Duplicate") | `GET /api/v2/document/<doctype>/<name>/copy` | `data: {...}` — read permission checked; `name`, `owner`, `creation`, `modified`, `modified_by`, `docstatus`, `amended_from`, `amendment_date` cleared on it and its child rows; nulls dropped. `no_copy` fields are **kept**: the endpoint's `ignore_no_copy=True` cannot be changed from the query (api/v2.py:185-193; `model/document.py:3853-3890`) — clear them yourself |

```ts
const filters = computed(() => (status.value ? { status: status.value } : {}))  // the same object useList gets
const total = useCall<number>({ url: '/api/v2/doctype/Job/count', params: () => ({ filters: filters.value }), refetch: true })

const source = ref('')
const copy = useCall<Job>({ url: computed(() => `/api/v2/document/Job/${encodeURIComponent(source.value)}/copy`), immediate: false })
async function duplicate(name: string) {
  source.value = name
  const draft = await copy.submit()          // GET; rejects on failure
  // clear the no_copy fields, then fill a useNewDoc draft (Object.assign(newJob.doc, draft)) or open the new-record page
}
```
`useList`'s `like` filters get `%…%` added and empty values dropped (`utils.ts:33-63`); the count endpoint does neither, so build the filter object ready-made (`['like', `%${q}%`]`, omit the key when `q` is empty) and give the same object to both.

## 4. useList

**For** — a paged, filtered list of one doctype; rows stay in sync with `useDoc`/`useDoctype` writes and with `docs` side-channel responses. For aggregate numbers use `useCall`.
**Import** — `import { useList } from 'frappe-ui'`

Options (`useList/types.ts`, defaults `useList.ts:30-48`)

| Option | Type | Default | Notes |
|---|---|---|---|
| `doctype` | string | — | |
| `fields` | `Array<keyof T \| 'link.field' \| 'f as alias' \| {child_table: [fields]} \| '*'>` | none sent | omitted → server default |
| `filters` | `MaybeRefOrGetter<{ field: value \| [operator, value] }>` | — | **object form only**; values may be refs/getters |
| `orderBy` | `MaybeRefOrGetter<'field asc\|desc'>` | — | |
| `start` | number | `0` | |
| `limit` | number | **`20`** | page size |
| `groupBy`, `parent`, `debug` | | — | sent as `group_by`, `parent`, `debug` |
| `immediate` | boolean | `true` | |
| `refetch` | boolean | **`true`** | refetch when the URL (fields/filters/order/start/limit) changes; also after `insert`/`setValue`/`delete` |
| `cacheKey`, `staleOnError`, `initialData`, `transform`, `onSuccess`, `onError`, `baseUrl` | | | as `useCall`; `transform` gets the whole row array |
| `url` | `` `/${string}` `` | — | custom endpoint, same query params |

Returned (reactive): `data` (`T[] \| null`), `hasNextPage`, `hasPreviousPage`, `start`, `limit` (readonly), `error`, `loading`, `isFetching`, `isFinished`, `canAbort`, `aborted`, `url`, `abort()`, `next()`, `previous()`, `execute()`/`fetch()`/`reload()`, `updateRow(doc)`, `removeRow(name)`, and three write members, each `{ data, error, loading, isLoading(key), submit }`:
- `insert.submit(values)` → POST; on success refetches this list (if `refetch`).
- `setValue.submit({ name, ...fields })` → PUT; writes docStore + every list of the doctype, then refetches; `isLoading(name)`.
- `delete.submit({ name })` → DELETE; removes the row from every list of the doctype and seals the doc; `isLoading(name)`.

Filters (`utils.ts:33-63`): `{ status: 'Open' }`, `{ priority: ['in', ['High','Urgent']] }`, `{ subject: ['like', search] }`. For `like`: a non-string value is stringified, an empty value **drops the filter**, and `%…%` is added when the value has no `%`. All-empty filters are not sent.

```ts
const search = ref('')
const tasks = useList<Task>({
  doctype: 'Task',
  fields: ['name', 'subject', 'status', 'modified'],
  filters: () => ({ subject: ['like', search.value], status: ['!=', 'Cancelled'] }),
  orderBy: 'modified desc',
  limit: 50,
})
// <div v-for="t in tasks.data" :key="t.name">…</div>
// <Button v-if="tasks.hasNextPage" @click="tasks.next()">Load more</Button>
```

Gotchas
- **Paging appends** ("load more"): any response with `start > 0` is concatenated to the rows already held (`useList.ts:388-391`). `start` and `limit` are plain numbers read once into refs (`useList.ts:51-52`) and exposed read-only; only `next()`/`previous()` move `start` (`:176-184`), and nothing resets it. After `next()`, a filter or sort change, `reload()`, or a `list.insert`/`setValue`/`delete` success (each refetches, `:233,263,289`) asks for the *current* `start` and appends it again → duplicates, or rows of the old filter. `previous()` appends too unless it lands on `start = 0`. `:key` cannot re-create a composable from the page that owns it (it lives as long as its component; only a keyed *child* would re-run it, blank until it reloads), and every `useList` stays in the global store for good (`listStore.ts:20-23`).
  **The working pattern — a filter bar over "Load more":** walk `start` back to 0 synchronously, in the same tick as the change, so the refetch watcher sends one request at `start=0` and the rows are replaced:
  ```ts
  const jobs = useList<Job>({ doctype: 'Job', fields, filters: () => filters.value, orderBy: () => sort.value, limit: 50 })
  const toFirstPage = () => { while (jobs.hasPreviousPage) jobs.previous() }   // with refetch (default) the URL change refetches
  watch([filters, sort], toFirstPage, { flush: 'sync' })                    // sync: runs before the list's own watcher
  const refresh = () => (jobs.hasPreviousPage ? toFirstPage() : jobs.reload())
  // <Button v-if="jobs.hasNextPage" label="Load more" :loading="jobs.loading" @click="jobs.next()" />  · "1–{{ jobs.data?.length }} of {{ total.data }}" (count, §3)
  ```
  Once more pages are loaded, write through `useDoctype(doctype).setValue/delete` (store update, no refetch, §6) instead of `jobs.setValue/delete`, and after an insert call `refresh()`. **Numbered pages** (each page replaces the last) are not possible with `useList`: use `useCall` on `/api/v2/document/<doctype>` with `params: () => ({ fields, filters, order_by, start: page.value * size, limit: size })` and `refetch: true` — it returns the row array only (the response's `has_next_page` is dropped), so take the total from the count endpoint (§3); its rows are not in the list store, so `reload()` after a write.
- `filters` in Frappe's list-of-lists form (`[['status','=','Open']]`) is iterated as an object and silently mangled (`utils.ts:38-41`). Use the object form.
- `hasNextPage` comes from the server's `has_next_page`, else `rows < limit` (`useList.ts:382-386`).
- `updateRow` only changes keys the row already has (`key in row`) — a field not in `fields` never appears (`useList.ts:204`).
- `insert` from `useNewDoc`/`useDoctype` does **not** add rows to any `useList`; only `useList().insert` refetches its own list. Call `reload()` on others.
- Every `useList` registers in a global store and is never removed (`useList.ts:328`, `listStore.ts:20-23`).
- Row `name` is coerced to string (`useList.ts:379`).

## 5. useDoc

**For** — one document: reactive `doc`, field writes, delete, whitelisted controller methods; the same document is shared by every `useDoc`/`useList` that holds it. For a new record use `useNewDoc`.
**Import** — `import { useDoc } from 'frappe-ui'`

Options (`useDoc.ts:58-67`)

| Option | Type | Default | Notes |
|---|---|---|---|
| `doctype` | string | — | |
| `name` | `MaybeRefOrGetter<string>` | — | reactive: the doc reloads when it changes; empty name = no request (`useDoc.ts:106`) |
| `methods` | `Record<key, 'method_name' \| { name, ...UseCallOptions }>` | `{}` | each becomes a `useCall`-shaped member, `submit()` only |
| `immediate` | boolean | `true` | |
| `staleOnError` | boolean | `false` | keep the IndexedDB copy when stale |
| `transform` | `(doc) => doc` | — | applied on read; a throw drops the local copy and `doc` becomes `null` |
| `baseUrl`, `url` | string | | `url` replaces the GET URL only |

Returned (reactive): `doc` (`T \| null`), `error`, `loading`, `isFetching`, `isFinished`, `canAbort`, `aborted`, `execute()`/`fetch()`/`reload()`, `abort()`, `setValue` (`submit(fields)` → PUT), `delete` (`submit()` → DELETE), `onSuccess(cb)` (returns an unsubscribe fn), plus one member per `methods` key (`submit(params)` → `POST /api/v2/document/<dt>/<name>/method/<method>`). Write members have the full `useCall` shape (`data`, `error`, `loading`, `submit`, …) and each `submit()` runs its own request.

```ts
const route = useRoute()
const task = useDoc<Task, { complete: (p: { note: string }) => void }>({
  doctype: 'Task',
  name: () => route.params.name as string,
  methods: { complete: 'mark_complete' },
})
await task.setValue.submit({ status: 'Working' })   // rejects on failure
await task.complete.submit({ note: 'done' })
```

Gotchas
- `doc` is the shared store object (`useDoc.ts:210-229`, `docStore.ts:97-116`): every `useDoc` of the same doctype+name reads the same object. Mutating `task.doc.x = …` changes it for every reader and saves nothing; edit a local copy and send it with `setValue.submit`.
- Docs are **always** cached in IndexedDB (per user) and the cached copy is shown before the server answers (`docStore.ts:151-180`); in-memory freshness window 5 min (`docStore.ts:27`).
- A `methods` key named like a built-in (`doc`, `error`, `loading`, `reload`, `setValue`, `delete`, `onSuccess`, …) throws at setup (`useDoc.ts:41-56,141`).
- Method members never auto-fire: `immediate` and `refetch` are forced `false` (`useDoc.ts:165-166`).
- `onSuccess` is a member you call (`task.onSuccess(cb)`), not an option.
- **A control bound to the store snaps back.** `:model-value="task.doc.status"` + `@update:model-value="(v) => task.setValue.submit({ status: v })"` shows the old value until the response lands, then jumps: the store is written only from the response (`useDoc.ts:177-189`; `useList().setValue` and `useDoctype().setValue` the same). Hold the shown value locally, set it first, revert on failure — design.md §1.10 has the pattern.

## 6. useDoctype

**For** — write actions on a doctype without loading the documents: row buttons in a list, bulk actions. Concurrent submits are fine; `isLoading(key)` gives per-row spinners.
**Import** — `import { useDoctype } from 'frappe-ui'` · `useDoctype<T>(doctype, { baseUrl? })`

| Member | `submit(...)` | Request | Store effect | `isLoading` |
|---|---|---|---|---|
| `insert` | `submit(values)` | POST `/api/v2/document/<dt>` | none (no list refresh) | `isLoading()` = `loading` |
| `setValue` | `submit({ name, ...fields })` | PUT `/api/v2/document/<dt>/<name>` | docStore + all lists | `isLoading(name)` |
| `delete` | `submit({ name })` | DELETE `/api/v2/document/<dt>/<name>` | removes row everywhere, seals doc | `isLoading(name)` |
| `runDocMethod` | `submit({ name, method, params?, validate? })` | POST `/api/v2/document/<dt>/<name>/method/<method>` | via `docs` side channel | `isLoading(name, method)` |
| `runMethod` | `submit({ method, params?, validate? })` | POST `/api/v2/method/<dt>/<method>` | via `docs` side channel | `isLoading(method)` |

Each member also has `data`, `error`, `loading`. `data`/`error` belong to the newest submit; a failure keeps the last successful `data` (`useAction.ts:56-59`). `validate: () => 'message'` rejects before sending (`useDoctype.ts:97,126`).

```vue
<Button :loading="tasks.delete.isLoading(row.name)"
        @click="todo.delete.submit({ name: row.name })">Delete</Button>
```

## 7. useNewDoc

**For** — a create form bound to a reactive draft.
**Import** — `import { useNewDoc } from 'frappe-ui'` · `useNewDoc<T>(doctype, initialValues = {}, options = {})`

Options: `useCall` options minus `url`, `method`, `params`, `immediate`, `refetch`, `cacheKey`, `staleOnError` (`useNewDoc.ts:15-24`) — so `baseUrl`, `initialData`, `transform`, `beforeSubmit`, `onSuccess`, `onError`.
Returned: `doc` (reactive draft — bind `v-model="nd.doc.field"`), `submit()` → resolves `{ doctype, ...created }`, rejects on failure or when the response has no `name` (`useNewDoc.ts:75-94`), plus `data`, `error`, `loading`, `reset`, … (useCall shape).

```ts
const nd = useNewDoc<Task>('Task', { subject: '', status: 'Open' })
async function create() { const t = await nd.submit(); router.push(`/tasks/${t.name}`) }
```
Gotchas: the draft is not cleared after `submit`; nothing refreshes lists (call `list.reload()`).

## 8. Internals (not exported — what the members above are built on)

- `useFrappeFetch` (`useFrappeFetch.ts:129-235`) — a VueUse `createFetch`: parses JSON, prints `debug` lines in a console group, routes `docs` to the stores, turns `errors[0]` into `FrappeResponseError`, logs `exception` in dev.
- `useAction` (`useAction.ts`) — behind `useDoctype` and `useList().insert/setValue/delete`: one private `useCall` per submit (VueUse would abort a shared one), newest-submit-wins for `data`/`error`, per-target hook gate, `loading` = any in flight, `isLoading(key)`.
- `useIsolatedCall` (`useIsolatedCall.ts`) — same idea with the full `useCall` surface, behind `useDoc().setValue/delete/methods` and `useNewDoc`; `immediate` defaults to `false`.
- `docStore` (`docStore.ts`) — one `Ref<doc>` per `doctype/name`, published twice (IndexedDB copy then server copy), 5-min staleness, `removeDoc` seals the key.
- `listStore` (`useList/listStore.ts`) — every `useList` by doctype; `updateRow`/`removeRow` fan out.
- `idbStore` (`idbStore.ts`) — `idb-keyval` with JSON strings; falls back to an in-memory map without IndexedDB.
- `writeGate` (`writeGate.ts`) — per-document dispatch sequence: a response from an earlier-dispatched request cannot overwrite a later write; GETs are admitted but never record; deletes seal.

## 9. v1: createResource

**For** — legacy and Options-API code. Supported and frozen through 1.x (`src/index.ts:14-16`).
**Import** — `import { createResource } from 'frappe-ui'` · `createResource(options | url, vm?)`

**Required setup**: the default fetcher is the bare `request` (GET, no `/api/method/` prefix, no CSRF header, raw JSON) — `resources.js:57-58`. Frappe apps must call `setConfig('resourceFetcher', frappeRequest)` once at startup.

Options (read from `resources.js`)

| Option | Notes |
|---|---|
| `url` | dotted method or path (expanded by `frappeRequest`) |
| `method` | passed to the fetcher; `frappeRequest` defaults to `POST` |
| `params` | static default params (read at call time from the options object, not reactive) |
| `makeParams(params)` | called on each fetch with `this = vm`; return the params |
| `auto` | fetch on creation; a string `options` means `{ url, auto: true }` |
| `cache` | string \| array: global in-memory instance cache + IndexedDB copy (`saveLocal`) |
| `debounce` | ms; wraps `fetch`/`submit`/`reload` |
| `initialData`, `transform(data)` | `transform` returning `null`/`undefined` keeps data |
| `validate(params)` | return a string (or throw) to fail before sending |
| `beforeSubmit(params)`, `onFetch(params)`, `onSuccess(data)`, `onData(data)`, `onError(err)` | `this = vm` |
| `resourceFetcher` | per-resource fetcher override |
| any other key | forwarded to the fetcher (e.g. `headers`, `credentials`) |

Returned (reactive): `data`, `previousData`, `loading`, `fetched`, `error`, `promise`, `params`, `auto`, `fetch(params?, tempOptions?)` = `reload` = `submit`, `abort()`, `reset()`, `update({ method, url, params, auto })`, `setData(data | fn)`. `tempOptions` takes `validate`, `beforeSubmit`, `onSuccess`, `onError`, `onData` for that call. A DOM `Event` passed as params is ignored, so `@click="r.submit"` works (`resources.js:60`).

```ts
setConfig('resourceFetcher', frappeRequest) // main.ts, once
const count = createResource({
  url: 'frappe.client.get_count',
  params: { doctype: 'ToDo' },
  auto: true,
})
// count.data, count.loading, count.error?.messages
```

Gotchas
- With `cache`, a second `createResource` with the same key returns the **first** instance (and its callbacks), reloading it if `auto` (`resources.js:11-21`).
- `fetch()` rejects on error (`resources.js:183`); an `auto` resource that fails leaves an unhandled rejection. On error `data` falls back to `previousData`.
- No `onError` anywhere → `setConfig('fallbackErrorHandler')` is called (`resources.js:171-182`).
- `request` GET params use `String(value)`: objects become `"[object Object]"` (`request.ts:43-48`); JSON-encode filters yourself for `method: 'GET'`.

## 10. v1: createListResource

**Import** — `import { createListResource } from 'frappe-ui'`

Options: `doctype` (required, throws otherwise), `fields`, `filters`, `orFilters`, `orderBy`, `start`, `pageLength` (default 20), `groupBy`, `parent`, `debug`, `url` (default `setConfig('defaultListUrl')` or `frappe.client.get_list`), `cache`, `auto`, `transform`, `realtime`, `onSuccess`, `onError`, `onData`, and per action `{ onSuccess, onError }` objects: `fetchOne`, `insert`, `setValue`, `delete`, `runDocMethod`.

Returned: `data`, `originalData`, `dataMap`, `getRow(name)`, `hasNextPage`, `hasPreviousPage`, `next()`, `previous()`, `reload()` (promise; refetches all loaded pages in one call), `fetch()` (calls `reload`, returns nothing), `update(partialOptions)` (assigns, does **not** refetch), `setData`, and sub-resources: `list`, `fetchOne.submit(name)`, `insert.submit(values)`, `setValue.submit({ name, ...values })`, `delete.submit(name)`, `runDocMethod.submit({ method, name, ...args })`.

```ts
const todos = createListResource({ doctype: 'ToDo', fields: ['name','description'],
  filters: { status: 'Open' }, orderBy: 'modified desc', pageLength: 20, auto: true })
todos.update({ filters: { status: 'Closed' } }); todos.reload()
```
Gotchas: filters are not reactive — `update()` then `reload()`; `insert`/`delete` success call `list.fetch()` with the current `start`, which appends to `originalData` when paged (`listResource.js:79-83,126,162`).

## 11. v1: createDocumentResource

**Import** — `import { createDocumentResource } from 'frappe-ui'`

Options: `doctype`, `name` (both required — otherwise it returns `undefined`, `documentResource.js:16`), `auto` (**default `true`**), `whitelistedMethods: { key: 'method' | { method, makeParams, transform, onSuccess, ... } }`, `transform`, `realtime`, `debounce` (for `setValueDebounced`, default 500), `onSuccess`, `onError`, `setValue: { validate, onSuccess, onError }`, `delete: { onSuccess, onError }`.

Returned: `doc`, `originalDoc`, `isDirty`, `get`, `setValue.submit(fields)` (optimistic: applied to `doc` and list resources first, reverted on error), `setValueDebounced`, `save.submit()` (sends only fields changed vs `originalDoc`, skips the request when nothing changed), `delete.submit()`, `reload()`, `setDoc()`, one resource per `whitelistedMethods` key (data = `message`).

Gotcha: instances are cached globally by `[doctype, name]` — a second call returns the first instance with the first caller's options (`documentResource.js:18-25,280`).

## 12. Transports and config

`call(method, args = {}, { headers?, onError? })` (`call.ts`) — POST through `frappeRequest`, resolves `message`. `onError({ response, status, error })` fires only for HTTP errors, not network failures. It always POSTs, with no option to change it (`call.ts:29-32`): a method whitelisted with `@frappe.whitelist(methods=["GET"])` answers 403 (Frappe `handler.py` `is_valid_http_method`). For those use `frappeRequest({ url: 'app.api.fn', method: 'GET', params })` — params go through `String()` into the query (`request.ts:43-48`), so pass scalars or JSON-encode — or `useCall({ url: '/api/v2/method/app.api.fn', params })` (GET by default, objects JSON-encoded).

`frappeRequest(options)` (`frappeRequest.ts`) — options: `url`, `method` (**default `POST`**), `params`, `headers`, `responseType`, `signal`, `credentials`, `onError`, `onServerMessages`. Prefixes `/api/method/`, adds `requestBaseUrl` (+ `credentials: 'include'`), merges `requestHeaders`, prints `exc` debug, passes `_server_messages` to `setConfig('serverMessagesHandler')` or `onServerMessages`. Non-2xx → `FrappeResourceError` whose `messages` are the parsed `_server_messages` + `message`, else `_error_message`, else `'Internal Server Error'`.

`setConfig(key, value)` / `getConfig(key)` keys (`config.ts`): `resourceFetcher`, `defaultDocGetUrl`, `defaultDocInsertUrl`, `defaultDocUpdateUrl`, `defaultDocDeleteUrl`, `defaultRunDocMethodUrl`, `defaultListUrl`, `fallbackErrorHandler`, `serverMessagesHandler`, `requestBaseUrl`, `requestHeaders`, `systemTimezone`, `localTimezone`, `maxFileSize`. These affect the v1 layer only: the v2 composables read none of them (`useFrappeFetch.ts` has no `getConfig`) — use their `baseUrl` option.

`app.use(FrappeUI, { resources?: boolean })` (`plugin.ts`) — the only option is `resources` (Options API `resources:` + `this.$resources`, `$getResource`, `$getDocumentResource`, `$getDoc`, `$getListResource`, `$refetchResource`). Off by default; a component with a `resources:` option then throws. `config`, `call`, `socketio` options are gone (dev warning); reading `this.$socket` / `this.$call` throws unless the app assigns them.

`onDocUpdate(socket, doctype, cb(name))` (`realtime.ts`) — emits `doctype_subscribe` (again on reconnect) and calls `cb` on `list_update` for that doctype. Bring your own socket.io client.

## 13. Gotchas (ranked)

1. `useCall` needs a `/api/v2/...` URL: it reads `response.data`; a v1 URL gives `data: null`, no error (`useCall.ts:207`).
2. `useCall` fires on creation by default, POST included — set `immediate: false` for actions (`useCall.ts:44`).
3. `useList` paging appends and `start` never resets: filter change / reload / write after `next()` duplicates rows (`useList.ts:388-391`) — walk back with `previous()` in a `flush: 'sync'` watcher (§4).
4. `createResource` & co. need `setConfig('resourceFetcher', frappeRequest)`; the default `request` does a bare GET (`resources.js:57-58`).
5. `submit()` rejects, `reload()` resolves: wrap actions in `try/catch`, read `error` after reads.
6. `useDoc().doc` is shared and cached per user in IndexedDB; never mutate it as form state (`useDoc.ts:210-229`).
7. Inserts (`useNewDoc`, `useDoctype.insert`) do not reach existing lists; reload them.
8. `useList` filters: object form only; `like` with an empty value drops the filter (`utils.ts:38-50`).
9. v2 error = `FrappeResponseError` (`instanceof` ok, `.message` = `"<type>: <message>"`, may hold HTML — `serverMessage()` in §2); v1 error = `FrappeResourceError` (`.messages[]`, no `instanceof`).
10. A failed `useCall` reload blanks `data` (VueUse `dist/index.js:3808`) and `staleOnError` does not apply to server errors — keep the last good value in `onSuccess`; `useList`/`useDoc` keep theirs.
11. `call()` is POST only (`call.ts:31`): GET-only whitelisted methods need `frappeRequest({ method: 'GET' })` or `useCall` on `/api/v2/method/…` (§12).
