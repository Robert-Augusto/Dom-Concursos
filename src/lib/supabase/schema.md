## Table `approved_form`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `fullName` | `text` |  Nullable |
| `email` | `text` |  Nullable |
| `instagram` | `text` |  Nullable |
| `fullAddress` | `text` |  Nullable |
| `approvedExam` | `text` |  Nullable |
| `roleName` | `text` |  Nullable |
| `approvalStatus` | `text` |  Nullable |
| `score` | `text` |  Nullable |
| `studyTime` | `text` |  Nullable |
| `bestSupport` | `text` |  Nullable |
| `emotionMoment` | `text` |  Nullable |
| `motivationMessage` | `text` |  Nullable |
| `video_url` | `text` |  Nullable |
| `imagem_url` | `text` |  Nullable |
| `authorization` | `text` |  Nullable |

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

## Table `study_flashcards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subjects_id` | `int8` |  Nullable |
| `front` | `text` |  Nullable |
| `back` | `text` |  Nullable |

## Table `study_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subjects_id` | `int8` |  Nullable |
| `content` | `text` |  Nullable |
| `file_url` | `text` |  Nullable |

## Table `subjects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `name` | `text` |  Nullable |
| `type` | `SUBJECTS_TYPE` |  Nullable |
| `subject_id` | `int8` |  Nullable |

## Table `subjects_questions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subjects_id` | `int8` |  Nullable |
| `question` | `text` |  Nullable |
| `options` | `jsonb` |  Nullable |
| `correct_option` | `text` |  Nullable |
| `explanation` | `text` |  Nullable |
| `difficulty` | `SUBJECTS_QUESTIONS_DIFFICULTY` |  Nullable |
| `banca` | `SUBJECTS_QUESTIONS_BANCA` |  Nullable |

