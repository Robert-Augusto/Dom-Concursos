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

## Table `banca`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `name` | `text` |  Nullable |

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

## Table `notifications`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `title` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `type` | `NOTIFICATIONS_TYPE` |  Nullable |
| `role` | `NOTIFICATIONS_ROLE` |  Nullable |

## Table `notifications_reads`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `notifications_id` | `int8` |  Nullable |
| `read_at` | `timestamptz` |  Nullable |

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
| `file_url` | `text` |  Nullable |

## Table `study_session`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `subject_id` | `int8` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `end_at` | `timestamptz` |  Nullable |

## Table `study_session_answers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `study_session_id` | `int8` |  Nullable |
| `subject_question_id` | `int8` |  Nullable |
| `selected_option` | `text` |  Nullable |
| `is_correct` | `bool` |  Nullable |

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
| `banca` | `int8` |  Nullable |
| `ano` | `text` |  Nullable |
| `instituicao` | `text` |  Nullable |

