## Table `lessons`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `title` | `text` |  Nullable |
| `description` | `text` |  Nullable |
| `video_type` | `LESSONS_TYPE` |  Nullable |
| `video_url` | `text` |  Nullable |
| `duration_seconds` | `numeric` |  Nullable |
| `access_level` | `USER_ACCESS_LEVEL` |  Nullable |
| `order` | `numeric` |  Nullable |
| `is_published` | `bool` |  Nullable |
| `is_searchable` | `bool` |  Nullable |
| `subject_id` | `int8` |  Nullable |

## Table `profile`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `created_at` | `timestamptz` |  |
| `name` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `role` | `USER_ROLE` |  Nullable |
| `access_level` | `USER_ACCESS_LEVEL` |  Nullable |
| `avatar_url` | `text` |  Nullable |
| `whatsapp` | `text` |  Nullable |

## Table `subjects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `name` | `text` |  Nullable |
| `type` | `SUBJECTS_TYPE` |  Nullable |
| `subject_id` | `int8` |  Nullable |

