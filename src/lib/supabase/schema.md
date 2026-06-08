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
| `headline` | `text` |  Nullable |

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
| `thumbnail` | `text` |  Nullable |

## Table `subjects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `name` | `text` |  Nullable |
| `type` | `SUBJECTS_TYPE` |  Nullable |
| `subject_id` | `int8` |  Nullable |

## Table `study_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subjects_id` | `int8` |  Nullable |
| `file_url` | `text` |  Nullable |
| `file_type` | `STUDY_MATERIAL_TYPE` |  Nullable |

## Table `study_flashcards`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subjects_id` | `int8` |  Nullable |
| `front` | `text` |  Nullable |
| `back` | `text` |  Nullable |

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
| `subject_root_id` | `int8` |  Nullable |

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

## Table `banca`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `name` | `text` |  Nullable |

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
| `note` | `text` |  Nullable |

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

## Table `simulado_sessions`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `total_questions` | `numeric` |  Nullable |
| `started_at` | `timestamptz` |  Nullable |
| `end_at` | `timestamptz` |  Nullable |
| `banca_id` | `int8` |  Nullable |
| `difficulty` | `SUBJECTS_QUESTIONS_DIFFICULTY` |  Nullable |
| `total_score` | `numeric` |  Nullable |
| `minimum_score` | `numeric` |  Nullable |

## Table `simulado_sessions_subjects`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `simulado_sessions_id` | `int8` |  Nullable |
| `subject_id` | `int8` |  Nullable |

## Table `simulado_sessions_answers`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `simulado_sessions_id` | `int8` |  Nullable |
| `subject_question_id` | `int8` |  Nullable |
| `selected_option` | `text` |  Nullable |
| `is_correct` | `bool` |  Nullable |

## Table `subjects_questions_review`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subjects_questions_id` | `int8` |  Nullable |
| `profile_id` | `uuid` |  Nullable |

## Table `suport`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `title` | `text` |  Nullable |
| `message` | `text` |  Nullable |
| `status` | `SUPORT_STATUS` |  Nullable |
| `type` | `SUPORT_TYPE` |  Nullable |

## Table `lessons_notes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `lessons_id` | `int8` |  Nullable |
| `content` | `text` |  Nullable |

## Table `lessons_progress`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `lessons_id` | `int8` |  Nullable |
| `completed` | `bool` |  Nullable |
| `saved_for_review` | `bool` |  Nullable |

## Table `lessons_materials`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `lessons_id` | `int8` |  Nullable |
| `title` | `text` |  Nullable |
| `file_url` | `text` |  Nullable |
| `file_type` | `text` |  Nullable |

## Table `study_materials_agent`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `subject_id` | `int8` |  Nullable |
| `html_full` | `text` |  Nullable |
| `html_summary` | `text` |  Nullable |

## Table `study_notes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `subject_id` | `int8` |  Nullable |
| `note` | `text` |  Nullable |

## Table `community_posts`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `content` | `text` |  Nullable |
| `image_url` | `text` |  Nullable |
| `video_url` | `text` |  Nullable |
| `type` | `COMMUNITY_POST_TYPE` |  Nullable |

## Table `community_likes`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `post_id` | `int8` |  Nullable |

## Table `community_comments`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `int8` | Primary Identity |
| `created_at` | `timestamptz` |  |
| `profile_id` | `uuid` |  Nullable |
| `content` | `text` |  Nullable |
| `post_id` | `int8` |  Nullable |

