-- CreateEnum
CREATE TYPE "quiz_type_enum" AS ENUM ('pre_test', 'post_test');

-- CreateTable
CREATE TABLE "action_types" (
    "type_id" SERIAL NOT NULL,
    "action_key" VARCHAR(50) NOT NULL,
    "action_name" VARCHAR(100),
    "category" VARCHAR(50),

    CONSTRAINT "action_types_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "bubbles" (
    "bubble_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "bubble_text" TEXT NOT NULL,
    "bubble_type" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "bubbles_pkey" PRIMARY KEY ("bubble_id")
);

-- CreateTable
CREATE TABLE "choice" (
    "choice_id" SERIAL NOT NULL,
    "question_id" INTEGER NOT NULL,
    "choice_key" CHAR(1) NOT NULL,
    "choice_text" VARCHAR(255) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "ip_reward" INTEGER NOT NULL,
    "image" VARCHAR(255),
    "cost" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "choice_pkey" PRIMARY KEY ("choice_id")
);

-- CreateTable
CREATE TABLE "comparison_questions" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "question_order" INTEGER NOT NULL,
    "left_item_id" INTEGER NOT NULL,
    "left_price" INTEGER NOT NULL,
    "right_item_id" INTEGER NOT NULL,
    "right_price" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "correct_answer" INTEGER NOT NULL,

    CONSTRAINT "comparison_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "dept_id" SERIAL NOT NULL,
    "dept_name" VARCHAR(100) NOT NULL,
    "faculty_id" INTEGER NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("dept_id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "faculty_id" SERIAL NOT NULL,
    "faculty_name" VARCHAR(100) NOT NULL,
    "group_id" INTEGER NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("faculty_id")
);

-- CreateTable
CREATE TABLE "faculty_groups" (
    "group_id" SERIAL NOT NULL,
    "group_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "faculty_groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "final_case_items" (
    "id" SERIAL NOT NULL,
    "case_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "item_order" INTEGER NOT NULL,
    "is_key_evidence" BOOLEAN NOT NULL,

    CONSTRAINT "final_case_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_cases" (
    "case_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "case_number" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN,
    "background_image" VARCHAR(255),
    "lesson_title" VARCHAR(255),
    "lesson_description" TEXT,

    CONSTRAINT "final_cases_pkey" PRIMARY KEY ("case_id")
);

-- CreateTable
CREATE TABLE "final_level_category_budgets" (
    "id" SERIAL NOT NULL,
    "config_id" INTEGER NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "budget" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "final_level_category_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_level_config" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "start_budget" INTEGER NOT NULL DEFAULT 10000,
    "min_reserve" INTEGER NOT NULL DEFAULT 1000,
    "limit_time" INTEGER NOT NULL DEFAULT 110,

    CONSTRAINT "final_level_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "final_level_event_choices" (
    "choice_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "choice_key" VARCHAR(100) NOT NULL,
    "choice_text" VARCHAR(255) NOT NULL,
    "money_change" INTEGER NOT NULL DEFAULT 0,
    "score_change" INTEGER NOT NULL DEFAULT 0,
    "missing_receipt" BOOLEAN NOT NULL DEFAULT false,
    "unnecessary_purchase" BOOLEAN NOT NULL DEFAULT false,
    "recover_receipt" BOOLEAN NOT NULL DEFAULT false,
    "remove_need_item_id" INTEGER,
    "feedback" TEXT,

    CONSTRAINT "final_level_event_choices_pkey" PRIMARY KEY ("choice_id")
);

-- CreateTable
CREATE TABLE "final_level_events" (
    "event_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "event_key" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "event_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "final_level_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "game_play_answers" (
    "play_answer_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "choice_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "ip_reward" INTEGER NOT NULL,
    "answered_at" TIMESTAMPTZ(6),

    CONSTRAINT "game_play_answers_pkey" PRIMARY KEY ("play_answer_id")
);

-- CreateTable
CREATE TABLE "game_play_bubbles" (
    "play_bubble_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "bubble_id" INTEGER NOT NULL,
    "bubble_order" INTEGER NOT NULL,
    "is_destroyed" BOOLEAN,
    "is_correct" BOOLEAN,
    "destroyed_at" TIMESTAMPTZ(6),

    CONSTRAINT "game_play_bubbles_pkey" PRIMARY KEY ("play_bubble_id")
);

-- CreateTable
CREATE TABLE "game_play_case_attempts" (
    "attempt_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "case_id" INTEGER NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "elapsed_seconds" INTEGER,
    "is_timeout" BOOLEAN NOT NULL DEFAULT false,
    "is_passed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "game_play_case_attempts_pkey" PRIMARY KEY ("attempt_id")
);

-- CreateTable
CREATE TABLE "game_play_comparison" (
    "id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "comparison_question_id" INTEGER NOT NULL,
    "user_answer" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "attempt_number" INTEGER NOT NULL DEFAULT 1,
    "first_try_correct" BOOLEAN NOT NULL DEFAULT false,
    "answered_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_history" (
    "play_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "status" VARCHAR(20) NOT NULL DEFAULT 'IN_PROGRESS',
    "correct_count" INTEGER NOT NULL DEFAULT 0,
    "wrong_count" INTEGER NOT NULL DEFAULT 0,
    "earned_ip" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_play_history_pkey" PRIMARY KEY ("play_id")
);

-- CreateTable
CREATE TABLE "game_play_items" (
    "play_item_id" SERIAL NOT NULL,
    "attempt_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "selected_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_items_pkey" PRIMARY KEY ("play_item_id")
);

-- CreateTable
CREATE TABLE "game_play_money" (
    "id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "selected_type_id" INTEGER NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_money_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_need_want" (
    "id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "user_type" VARCHAR(10) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_need_want_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_receipt_hunt" (
    "id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "item_order" INTEGER NOT NULL,
    "is_target" BOOLEAN NOT NULL,
    "is_selected" BOOLEAN NOT NULL DEFAULT false,
    "is_correct" BOOLEAN,
    "selected_at" TIMESTAMP(6),

    CONSTRAINT "game_play_receipt_hunt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_treasurer" (
    "play_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "max_score" INTEGER NOT NULL DEFAULT 100,
    "grade" VARCHAR(5),
    "start_budget" INTEGER NOT NULL DEFAULT 10000,
    "final_balance" INTEGER NOT NULL DEFAULT 0,
    "spent_amount" INTEGER NOT NULL DEFAULT 0,
    "receipt_count" INTEGER NOT NULL DEFAULT 0,
    "unnecessary_count" INTEGER NOT NULL DEFAULT 0,
    "missing_receipt" BOOLEAN NOT NULL DEFAULT false,
    "unnecessary_purchase" BOOLEAN NOT NULL DEFAULT false,
    "elapsed_time" INTEGER NOT NULL DEFAULT 0,
    "hp_bonus" BOOLEAN NOT NULL DEFAULT false,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "fail_reason" TEXT,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "purchased_items" JSONB,

    CONSTRAINT "game_play_treasurer_pkey" PRIMARY KEY ("play_id")
);

-- CreateTable
CREATE TABLE "game_story" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "story_order" INTEGER NOT NULL,
    "text" TEXT,

    CONSTRAINT "game_story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_type" (
    "game_type_id" SERIAL NOT NULL,
    "name" VARCHAR(100),
    "description" TEXT,

    CONSTRAINT "game_type_pkey" PRIMARY KEY ("game_type_id")
);

-- CreateTable
CREATE TABLE "hint_minigame_options" (
    "id" SERIAL NOT NULL,
    "minigame_id" INTEGER,
    "option_key" VARCHAR(10),
    "option_text" VARCHAR(50),
    "value" INTEGER,
    "image" VARCHAR(255),
    "is_correct" BOOLEAN DEFAULT false,
    "order_no" INTEGER,

    CONSTRAINT "hint_minigame_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint_minigame_scenario_options" (
    "id" SERIAL NOT NULL,
    "scenario_id" INTEGER NOT NULL,
    "option_key" VARCHAR(10) NOT NULL,
    "option_text" VARCHAR(255) NOT NULL,
    "amount" INTEGER NOT NULL,
    "is_correct" BOOLEAN DEFAULT false,
    "order_no" INTEGER NOT NULL,

    CONSTRAINT "hint_minigame_scenario_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint_minigame_scenarios" (
    "id" SERIAL NOT NULL,
    "minigame_id" INTEGER NOT NULL,
    "month_no" INTEGER NOT NULL,
    "budget" INTEGER,
    "scenario_text" TEXT NOT NULL,
    "item_id" INTEGER,

    CONSTRAINT "hint_minigame_scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint_minigames" (
    "id" SERIAL NOT NULL,
    "game_type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "target_value" INTEGER,
    "is_active" BOOLEAN,

    CONSTRAINT "hint_minigames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "introDialog" (
    "id" SERIAL NOT NULL,
    "scene_id" INTEGER NOT NULL,
    "speaker" VARCHAR(100),
    "title" VARCHAR(100),
    "text" TEXT,
    "dialog_order" INTEGER,
    "lesson" TEXT,

    CONSTRAINT "introDialog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "introScene" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "scene_order" INTEGER NOT NULL,
    "title" VARCHAR(100),
    "scene_type_id" INTEGER NOT NULL,

    CONSTRAINT "introScene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_types" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "item_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "items_id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "image" VARCHAR(255),
    "category" VARCHAR(50),
    "price" INTEGER,

    CONSTRAINT "items_pkey" PRIMARY KEY ("items_id")
);

-- CreateTable
CREATE TABLE "level" (
    "level_id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "order_no" INTEGER NOT NULL,
    "level_type_id" INTEGER NOT NULL,
    "game_type_id" INTEGER NOT NULL,
    "is_final" BOOLEAN,

    CONSTRAINT "level_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "level_hints" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "title" VARCHAR(255),
    "description" TEXT,
    "hint_order" INTEGER,
    "comparison_question_id" INTEGER,
    "minigame_id" INTEGER,

    CONSTRAINT "level_hints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_items" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "item_type_id" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER DEFAULT 1,
    "is_required" BOOLEAN DEFAULT false,

    CONSTRAINT "level_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_result_messages" (
    "id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "heading" VARCHAR(255),
    "title" VARCHAR(255),
    "description" TEXT,
    "highlight_text" TEXT,
    "message" TEXT,
    "verdict_label" VARCHAR(100),
    "character_image" VARCHAR(255),
    "mirror_image" VARCHAR(255),

    CONSTRAINT "level_result_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "level_type" (
    "level_type_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "level_type_pkey" PRIMARY KEY ("level_type_id")
);

-- CreateTable
CREATE TABLE "logs_user_actions" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "type_id" INTEGER,
    "reference_id" INTEGER,
    "description" TEXT,
    "time_spent" INTEGER,
    "created_at" TIMESTAMPTZ(6),

    CONSTRAINT "logs_user_actions_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "majors" (
    "major_id" SERIAL NOT NULL,
    "major_name" VARCHAR(255),
    "faculty_id" INTEGER,

    CONSTRAINT "majors_pkey" PRIMARY KEY ("major_id")
);

-- CreateTable
CREATE TABLE "mission_types" (
    "type_id" SERIAL NOT NULL,
    "type_name" VARCHAR(255) NOT NULL,
    "description" TEXT,

    CONSTRAINT "mission_types_pkey" PRIMARY KEY ("type_id")
);

-- CreateTable
CREATE TABLE "missions" (
    "mission_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "level_number" INTEGER,
    "mission_name" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("mission_id")
);

-- CreateTable
CREATE TABLE "question" (
    "question_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "question_order" INTEGER NOT NULL,
    "question_text" VARCHAR(255) NOT NULL,
    "case_id" INTEGER,
    "correct_explain" TEXT,
    "wrong_explain" TEXT,

    CONSTRAINT "question_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "quiz_id" SERIAL NOT NULL,
    "quiz_type" "quiz_type_enum" NOT NULL,
    "question_text" TEXT NOT NULL,
    "max_score" INTEGER DEFAULT 5,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("quiz_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "rule_type" VARCHAR(100),

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sceneMission" (
    "id" SERIAL NOT NULL,
    "scene_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "subtitle" VARCHAR(255),
    "text" TEXT,

    CONSTRAINT "sceneMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sceneMissionRules" (
    "id" SERIAL NOT NULL,
    "scene_mission_id" INTEGER NOT NULL,
    "rule_id" INTEGER NOT NULL,
    "value" JSONB,
    "description" TEXT,
    "title" VARCHAR(100),
    "image_path" VARCHAR(255),

    CONSTRAINT "sceneMissionRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scene_type" (
    "scene_type_id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "scene_type_pkey" PRIMARY KEY ("scene_type_id")
);

-- CreateTable
CREATE TABLE "students" (
    "student_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(50) NOT NULL,
    "birth_year" INTEGER NOT NULL,
    "entry_year" INTEGER,
    "major_id" INTEGER,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "teacher_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(50) NOT NULL,
    "birth_date" DATE,
    "dept_id" INTEGER NOT NULL,
    "position" VARCHAR(255) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "unit_contents" (
    "content_id" SERIAL NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "order_number" INTEGER NOT NULL,
    "parent_id" INTEGER,
    "image_url" VARCHAR(255),
    "reflection" TEXT,

    CONSTRAINT "unit_contents_pkey" PRIMARY KEY ("content_id")
);

-- CreateTable
CREATE TABLE "units" (
    "unit_id" SERIAL NOT NULL,
    "name_th" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100) NOT NULL,
    "order_number" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "user_missions" (
    "user_id" INTEGER NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "score" INTEGER DEFAULT 0,
    "is_completed" BOOLEAN DEFAULT false,
    "completed_at" TIMESTAMP(6),

    CONSTRAINT "user_missions_pkey" PRIMARY KEY ("user_id","mission_id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "progress_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "score" INTEGER DEFAULT 0,
    "completion_percentage" INTEGER DEFAULT 0,
    "is_locked" BOOLEAN DEFAULT true,
    "last_accessed" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "user_quiz_answers" (
    "answer_id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "quiz_id" INTEGER,
    "score_given" INTEGER,
    "answered_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_quiz_answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "user_id" INTEGER NOT NULL,
    "total_points" INTEGER NOT NULL,
    "current_streak" INTEGER NOT NULL,
    "highest_score" INTEGER NOT NULL,
    "last_login_date" DATE NOT NULL,
    "integrity_points" INTEGER NOT NULL DEFAULT 0,
    "streak_bonus_ip" INTEGER NOT NULL DEFAULT 0,
    "last_streak_reward_date" DATE,
    "streak_star_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role_id" INTEGER NOT NULL,
    "last_login" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL,
    "consent_at" TIMESTAMPTZ(6),
    "consent_version" VARCHAR(10),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_treasurer_events" (
    "id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "choice_id" INTEGER NOT NULL,
    "money_change" INTEGER NOT NULL DEFAULT 0,
    "score_change" INTEGER NOT NULL DEFAULT 0,
    "missing_receipt_flag" BOOLEAN NOT NULL DEFAULT false,
    "unnecessary_purchase_flag" BOOLEAN NOT NULL DEFAULT false,
    "applied_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_treasurer_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_treasurer_receipt_items" (
    "id" SERIAL NOT NULL,
    "receipt_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "category" VARCHAR(100),
    "item_type" VARCHAR(20),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_play_treasurer_receipt_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_treasurer_receipts" (
    "receipt_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL DEFAULT 0,
    "is_saved" BOOLEAN,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMPTZ(6),

    CONSTRAINT "game_play_treasurer_receipts_pkey" PRIMARY KEY ("receipt_id")
);

-- CreateTable
CREATE TABLE "user_level_progress" (
    "progress_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "level_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'LOCKED',
    "is_locked" BOOLEAN NOT NULL DEFAULT true,
    "score" INTEGER NOT NULL DEFAULT 0,
    "best_score" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMPTZ(6),
    "last_accessed" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_level_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMPTZ(6),
    "active_minutes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "slip_details" (
    "id" SERIAL NOT NULL,
    "items_id" INTEGER NOT NULL,
    "bank" VARCHAR(100) NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "amount" VARCHAR(50) NOT NULL,
    "answer" VARCHAR(10) NOT NULL,
    "clue" TEXT,
    "image" VARCHAR(255),

    CONSTRAINT "slip_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_play_slip_hunt" (
    "play_slip_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "slip_id" INTEGER NOT NULL,
    "slip_order" INTEGER NOT NULL,
    "player_choice" VARCHAR(10) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_slip_hunt_pkey" PRIMARY KEY ("play_slip_id")
);

-- CreateTable
CREATE TABLE "game_play_slot_rounds" (
    "round_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "spin_no" INTEGER NOT NULL,
    "bet" INTEGER NOT NULL,
    "balance_before" INTEGER NOT NULL,
    "reward" INTEGER NOT NULL DEFAULT 0,
    "balance_after" INTEGER NOT NULL,
    "result_symbols" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_slot_rounds_pkey" PRIMARY KEY ("round_id")
);

-- CreateTable
CREATE TABLE "game_play_budget_allocations" (
    "allocation_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "category_code" VARCHAR(20) NOT NULL,
    "amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_budget_allocations_pkey" PRIMARY KEY ("allocation_id")
);

-- CreateTable
CREATE TABLE "game_play_crisis_responses" (
    "response_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "spawn_no" INTEGER NOT NULL,
    "event_id" INTEGER NOT NULL,
    "outcome" VARCHAR(10) NOT NULL,
    "choice_id" INTEGER,
    "integrity_delta" INTEGER NOT NULL,
    "score_delta" INTEGER NOT NULL,
    "trust_delta" INTEGER NOT NULL DEFAULT 0,
    "response_seconds" INTEGER,
    "responded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_crisis_responses_pkey" PRIMARY KEY ("response_id")
);

-- CreateTable
CREATE TABLE "game_play_crisis_specials" (
    "special_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "special_code" VARCHAR(30) NOT NULL,
    "integrity_delta" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_crisis_specials_pkey" PRIMARY KEY ("special_id")
);

-- CreateTable
CREATE TABLE "game_play_project_decisions" (
    "decision_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "decision_order" INTEGER NOT NULL,
    "action" VARCHAR(10) NOT NULL,
    "took_bribe" BOOLEAN NOT NULL DEFAULT false,
    "refused_bribe" BOOLEAN NOT NULL DEFAULT false,
    "is_correct" BOOLEAN NOT NULL,
    "score_delta" INTEGER NOT NULL,
    "integrity_delta" INTEGER NOT NULL,
    "decided_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_project_decisions_pkey" PRIMARY KEY ("decision_id")
);

-- CreateTable
CREATE TABLE "game_play_word_answers" (
    "answer_id" SERIAL NOT NULL,
    "play_id" INTEGER NOT NULL,
    "word_id" INTEGER NOT NULL,
    "attempt_no" INTEGER NOT NULL,
    "typed_text" VARCHAR(100) NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "answered_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_word_answers_pkey" PRIMARY KEY ("answer_id")
);

-- CreateTable
CREATE TABLE "level_crisis_choices" (
    "choice_id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "choice_order" INTEGER NOT NULL,
    "choice_code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "icon_key" VARCHAR(50),
    "integrity_delta" INTEGER NOT NULL,
    "score_delta" INTEGER NOT NULL,
    "trust_delta" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT NOT NULL,

    CONSTRAINT "level_crisis_choices_pkey" PRIMARY KEY ("choice_id")
);

-- CreateTable
CREATE TABLE "level_crisis_events" (
    "event_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "event_code" VARCHAR(50) NOT NULL,
    "location_code" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "time_limit" INTEGER NOT NULL,
    "timeout_integrity_delta" INTEGER NOT NULL,
    "timeout_score_delta" INTEGER NOT NULL,
    "timeout_note" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "level_crisis_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "level_projects" (
    "project_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "project_order" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "budget_text" VARCHAR(100) NOT NULL,
    "price_estimate" VARCHAR(100) NOT NULL,
    "contractor" VARCHAR(200) NOT NULL,
    "documents" VARCHAR(200) NOT NULL,
    "history" VARCHAR(200) NOT NULL,
    "correct_action" VARCHAR(10) NOT NULL,
    "has_bribe" BOOLEAN NOT NULL DEFAULT false,
    "bribe_amount" VARCHAR(100),
    "explanation" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "level_projects_pkey" PRIMARY KEY ("project_id")
);

-- CreateTable
CREATE TABLE "level_words" (
    "word_id" SERIAL NOT NULL,
    "level_id" INTEGER NOT NULL,
    "word_order" INTEGER NOT NULL,
    "answer" VARCHAR(100) NOT NULL,
    "clue" TEXT NOT NULL,
    "revealed_count" INTEGER NOT NULL DEFAULT 0,
    "ip_reward" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "level_words_pkey" PRIMARY KEY ("word_id")
);

-- CreateTable
CREATE TABLE "teacher_student_groups" (
    "group_id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "faculty_id" INTEGER,
    "major_id" INTEGER,
    "year" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teacher_student_groups_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "game_play_shadow_mirror" (
    "play_id" INTEGER NOT NULL,
    "logic_score" INTEGER NOT NULL,
    "logic_note" TEXT,
    "empathy_score" INTEGER NOT NULL,
    "empathy_note" TEXT,
    "responsibility_score" INTEGER NOT NULL,
    "responsibility_note" TEXT,
    "consistency_score" INTEGER NOT NULL,
    "consistency_note" TEXT,
    "avg_score" DECIMAL(5,2) NOT NULL,
    "badge_key" VARCHAR(20) NOT NULL,
    "overall_reflection" TEXT,
    "shadow_message" TEXT,
    "answers" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_play_shadow_mirror_pkey" PRIMARY KEY ("play_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "action_types_action_key_key" ON "action_types"("action_key");

-- CreateIndex
CREATE UNIQUE INDEX "final_level_category_budget_unique" ON "final_level_category_budgets"("config_id", "category");

-- CreateIndex
CREATE UNIQUE INDEX "final_level_config_level_id_key" ON "final_level_config"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "final_level_event_choices_unique" ON "final_level_event_choices"("event_id", "choice_key");

-- CreateIndex
CREATE UNIQUE INDEX "final_level_events_unique" ON "final_level_events"("level_id", "event_key");

-- CreateIndex
CREATE UNIQUE INDEX "game_play_money_play_item_unique" ON "game_play_money"("play_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_play_receipt_hunt_play_item_unique" ON "game_play_receipt_hunt"("play_id", "item_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_play_receipt_hunt_play_order_unique" ON "game_play_receipt_hunt"("play_id", "item_order");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_month_unique" ON "hint_minigame_scenarios"("minigame_id", "month_no");

-- CreateIndex
CREATE UNIQUE INDEX "level_result_messages_unique" ON "level_result_messages"("level_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_unit_id_key" ON "user_progress"("user_id", "unit_id");

-- CreateIndex
CREATE INDEX "idx_gpt_events_play_id" ON "game_play_treasurer_events"("play_id");

-- CreateIndex
CREATE UNIQUE INDEX "gpt_events_play_event_unique" ON "game_play_treasurer_events"("play_id", "event_id");

-- CreateIndex
CREATE INDEX "idx_gpt_receipt_items_receipt_id" ON "game_play_treasurer_receipt_items"("receipt_id");

-- CreateIndex
CREATE INDEX "idx_gpt_receipts_play_id" ON "game_play_treasurer_receipts"("play_id");

-- CreateIndex
CREATE INDEX "idx_user_level_progress_level_id" ON "user_level_progress"("level_id");

-- CreateIndex
CREATE INDEX "idx_user_level_progress_unit_id" ON "user_level_progress"("unit_id");

-- CreateIndex
CREATE INDEX "idx_user_level_progress_user_id" ON "user_level_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_level_progress_user_level_unique" ON "user_level_progress"("user_id", "level_id");

-- CreateIndex
CREATE INDEX "idx_user_sessions_user_started" ON "user_sessions"("user_id", "started_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "slip_details_items_id_key" ON "slip_details"("items_id");

-- CreateIndex
CREATE INDEX "idx_slip_hunt_play_id" ON "game_play_slip_hunt"("play_id");

-- CreateIndex
CREATE INDEX "idx_slip_hunt_slip_id" ON "game_play_slip_hunt"("slip_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_play_slip_order" ON "game_play_slip_hunt"("play_id", "slip_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_slot_round_spin" ON "game_play_slot_rounds"("play_id", "spin_no");

-- CreateIndex
CREATE UNIQUE INDEX "uq_budget_play_category" ON "game_play_budget_allocations"("play_id", "category_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_crisis_spawn" ON "game_play_crisis_responses"("play_id", "spawn_no");

-- CreateIndex
CREATE UNIQUE INDEX "uq_project_decision" ON "game_play_project_decisions"("play_id", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_word_attempt" ON "game_play_word_answers"("play_id", "word_id", "attempt_no");

-- CreateIndex
CREATE UNIQUE INDEX "uq_crisis_choice_order" ON "level_crisis_choices"("event_id", "choice_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_crisis_event_code" ON "level_crisis_events"("level_id", "event_code");

-- CreateIndex
CREATE UNIQUE INDEX "uq_level_project_order" ON "level_projects"("level_id", "project_order");

-- CreateIndex
CREATE UNIQUE INDEX "uq_level_word_order" ON "level_words"("level_id", "word_order");

-- CreateIndex
CREATE INDEX "idx_teacher_student_groups_teacher" ON "teacher_student_groups"("teacher_id");

-- CreateIndex
CREATE INDEX "idx_game_play_shadow_mirror_badge" ON "game_play_shadow_mirror"("badge_key");

-- AddForeignKey
ALTER TABLE "bubbles" ADD CONSTRAINT "fk_bubble_level" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "choice" ADD CONSTRAINT "fk_question_id" FOREIGN KEY ("question_id") REFERENCES "question"("question_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comparison_questions" ADD CONSTRAINT "fk_Left_item_id" FOREIGN KEY ("left_item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comparison_questions" ADD CONSTRAINT "fk_Right_item_id" FOREIGN KEY ("right_item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comparison_questions" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "dept_fk_faculty" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("faculty_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculty_pk_groups" FOREIGN KEY ("group_id") REFERENCES "faculty_groups"("group_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_case_items" ADD CONSTRAINT "fk_case_id" FOREIGN KEY ("case_id") REFERENCES "final_cases"("case_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_case_items" ADD CONSTRAINT "fk_items_id" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_cases" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_level_category_budgets" ADD CONSTRAINT "final_level_category_budget_config_fk" FOREIGN KEY ("config_id") REFERENCES "final_level_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_level_config" ADD CONSTRAINT "final_level_config_level_fk" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_level_event_choices" ADD CONSTRAINT "final_level_event_choices_event_fk" FOREIGN KEY ("event_id") REFERENCES "final_level_events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_level_event_choices" ADD CONSTRAINT "final_level_event_choices_item_fk" FOREIGN KEY ("remove_need_item_id") REFERENCES "items"("items_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "final_level_events" ADD CONSTRAINT "final_level_events_level_fk" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_answers" ADD CONSTRAINT "fk_choice" FOREIGN KEY ("choice_id") REFERENCES "choice"("choice_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_answers" ADD CONSTRAINT "fk_play_id" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_answers" ADD CONSTRAINT "fk_question_id" FOREIGN KEY ("question_id") REFERENCES "question"("question_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_bubbles" ADD CONSTRAINT "fk_bubble" FOREIGN KEY ("bubble_id") REFERENCES "bubbles"("bubble_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_bubbles" ADD CONSTRAINT "fk_play_history" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_case_attempts" ADD CONSTRAINT "fk_case_id" FOREIGN KEY ("case_id") REFERENCES "final_cases"("case_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_case_attempts" ADD CONSTRAINT "fk_play_id" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_comparison" ADD CONSTRAINT "fk_comparison_play" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_comparison" ADD CONSTRAINT "fk_comparison_question" FOREIGN KEY ("comparison_question_id") REFERENCES "comparison_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_history" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_history" ADD CONSTRAINT "fk_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_items" ADD CONSTRAINT "fk_attempt_id" FOREIGN KEY ("attempt_id") REFERENCES "game_play_case_attempts"("attempt_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_items" ADD CONSTRAINT "fk_items_id" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_money" ADD CONSTRAINT "fk_money_item" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_money" ADD CONSTRAINT "fk_money_play" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_money" ADD CONSTRAINT "fk_money_selected_type" FOREIGN KEY ("selected_type_id") REFERENCES "item_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_need_want" ADD CONSTRAINT "fk_need_want_item" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_need_want" ADD CONSTRAINT "fk_need_want_play" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_receipt_hunt" ADD CONSTRAINT "game_play_receipt_hunt_item_fk" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_play_receipt_hunt" ADD CONSTRAINT "game_play_receipt_hunt_play_fk" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_play_treasurer" ADD CONSTRAINT "fk_game_play_treasurer_play" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_story" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hint_minigame_options" ADD CONSTRAINT "fk_minigame_id" FOREIGN KEY ("minigame_id") REFERENCES "hint_minigames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "hint_minigame_scenario_options" ADD CONSTRAINT "fk_scenario_option_scenario" FOREIGN KEY ("scenario_id") REFERENCES "hint_minigame_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint_minigame_scenarios" ADD CONSTRAINT "fk_scenario_item_id" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint_minigame_scenarios" ADD CONSTRAINT "fk_scenario_minigame" FOREIGN KEY ("minigame_id") REFERENCES "hint_minigames"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "introDialog" ADD CONSTRAINT "fk_introScene_id" FOREIGN KEY ("scene_id") REFERENCES "introScene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "introScene" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "fk_game_type_id" FOREIGN KEY ("game_type_id") REFERENCES "game_type"("game_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level" ADD CONSTRAINT "fk_level_type_id" FOREIGN KEY ("level_type_id") REFERENCES "level_type"("level_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_hints" ADD CONSTRAINT "fk_comparison_id" FOREIGN KEY ("comparison_question_id") REFERENCES "comparison_questions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_hints" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_hints" ADD CONSTRAINT "fk_minigame_id" FOREIGN KEY ("minigame_id") REFERENCES "hint_minigames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_items" ADD CONSTRAINT "item_type_id_fk" FOREIGN KEY ("item_type_id") REFERENCES "item_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_items" ADD CONSTRAINT "items_id_fk" FOREIGN KEY ("item_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_items" ADD CONSTRAINT "level_id_fk" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_result_messages" ADD CONSTRAINT "level_result_messages_level_fk" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_user_actions" ADD CONSTRAINT "logs_user_actions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "action_types"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_user_actions" ADD CONSTRAINT "logs_user_actions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "majors" ADD CONSTRAINT "major_fk_faculty" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("faculty_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "mission_fk_type" FOREIGN KEY ("type_id") REFERENCES "mission_types"("type_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "mission_fk_unit" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "fk_case_id" FOREIGN KEY ("case_id") REFERENCES "final_cases"("case_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "fk_level_id" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sceneMission" ADD CONSTRAINT "fk_scene_id" FOREIGN KEY ("scene_id") REFERENCES "introScene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sceneMissionRules" ADD CONSTRAINT "fk_rule_id" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sceneMissionRules" ADD CONSTRAINT "fk_scene_mission" FOREIGN KEY ("scene_mission_id") REFERENCES "sceneMission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "student_fk-userID" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "student_fk_majorID" FOREIGN KEY ("major_id") REFERENCES "majors"("major_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teacher_fk_userID" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_contents" ADD CONSTRAINT "content_fk_unit" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "unit_contents" ADD CONSTRAINT "unit_contents_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "unit_contents"("content_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("quiz_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_quiz_answers" ADD CONSTRAINT "user_quiz_answers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "stats_fk_userID" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "user_fk_roleID" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_treasurer_events" ADD CONSTRAINT "game_play_treasurer_events_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_treasurer_receipt_items" ADD CONSTRAINT "game_play_treasurer_receipt_items_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "game_play_treasurer_receipts"("receipt_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_treasurer_receipts" ADD CONSTRAINT "game_play_treasurer_receipts_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_level_progress" ADD CONSTRAINT "user_level_progress_level_fk" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_level_progress" ADD CONSTRAINT "user_level_progress_unit_fk" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_level_progress" ADD CONSTRAINT "user_level_progress_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "slip_details" ADD CONSTRAINT "slip_details_item_fk" FOREIGN KEY ("items_id") REFERENCES "items"("items_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_slip_hunt" ADD CONSTRAINT "fk_slip_hunt_item" FOREIGN KEY ("slip_id") REFERENCES "items"("items_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_slip_hunt" ADD CONSTRAINT "fk_slip_hunt_play" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_slot_rounds" ADD CONSTRAINT "game_play_slot_rounds_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_budget_allocations" ADD CONSTRAINT "game_play_budget_allocations_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_crisis_responses" ADD CONSTRAINT "game_play_crisis_responses_choice_id_fkey" FOREIGN KEY ("choice_id") REFERENCES "level_crisis_choices"("choice_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_crisis_responses" ADD CONSTRAINT "game_play_crisis_responses_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "level_crisis_events"("event_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_crisis_responses" ADD CONSTRAINT "game_play_crisis_responses_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_crisis_specials" ADD CONSTRAINT "game_play_crisis_specials_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_project_decisions" ADD CONSTRAINT "game_play_project_decisions_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_project_decisions" ADD CONSTRAINT "game_play_project_decisions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "level_projects"("project_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_word_answers" ADD CONSTRAINT "game_play_word_answers_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_word_answers" ADD CONSTRAINT "game_play_word_answers_word_id_fkey" FOREIGN KEY ("word_id") REFERENCES "level_words"("word_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_crisis_choices" ADD CONSTRAINT "level_crisis_choices_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "level_crisis_events"("event_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_crisis_events" ADD CONSTRAINT "level_crisis_events_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_projects" ADD CONSTRAINT "level_projects_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "level_words" ADD CONSTRAINT "level_words_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "level"("level_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teacher_student_groups" ADD CONSTRAINT "teacher_student_groups_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("faculty_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teacher_student_groups" ADD CONSTRAINT "teacher_student_groups_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "majors"("major_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "teacher_student_groups" ADD CONSTRAINT "teacher_student_groups_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "game_play_shadow_mirror" ADD CONSTRAINT "game_play_shadow_mirror_play_id_fkey" FOREIGN KEY ("play_id") REFERENCES "game_play_history"("play_id") ON DELETE CASCADE ON UPDATE NO ACTION;
