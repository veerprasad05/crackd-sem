# Crackd Supabase Domain Model (Student Reference)

## Non-Negotiable Rules

- **DO NOT change or edit any RLS (Row Level Security) policies.**
- Treat the database as **read-only** and authoritative.
- Many tables are written by backend services (AI API, Matrix, Admin, etc.) and should be interpreted as **logs of behavior**, not data to be mutated.

## How To Use This Model

Design your views around the core objects users care about: **images**, **captions**, and **people**. Follow relationships outward. For generation lineage, rely on linked metadata (caption requests, prompt chains, humor flavors, model responses). AI-related records are execution history meant to explain results, not to be recreated.

## Table Catalog

Each table below is part of the Crackd Supabase schema. Use these descriptions as a guide when reading and joining data.

### Core People & Identity

- `profiles`: Central Crackd user record (1:1 with `auth.users`). Application attributes, capability flags, and enablement state.

### Images

- `images`: Hosted visual assets with ownership/visibility, cached semantic metadata, and embeddings.
- `common_use_categories`: Curated image category definitions for consistent study pools.
- `common_use_category_image_mappings`: Links images into curated common-use categories.

### Captions

- `captions`: Generated captions tied to an image, owning profile, public/featured/study flags, humor flavor, and prompt chain lineage.

### Caption Interactions (Behavioral Logs)

- `caption_likes`: Likes recorded via almostcrackd.ai.
- `caption_votes`: Up/down votes via slightlyhumorous.org.
- `caption_saved`: Personal bookmarking via almostcrackd.ai.
- `shares`: Share events.
- `share_to_destinations`: Target destinations for shares.
- `screenshots`: Screenshot events.

### Moderation

- `reported_captions`: User-flagged captions for review.
- `reported_images`: User-flagged images for review.

### Generation Requests & Lineage

- `caption_request`: User-initiated generation entry point for an image; parent for AI activity.
- `llm_prompt_chains`: Ordered LLM steps for a single caption request.
- `llm_model_responses`: Low-level log of each LLM call (prompts, model/provider, timing, temperature, humor step context).

### Humor System (The Matrix)

- `humor_flavors`: Named, reusable generation strategies (slug + description).
- `humor_flavor_steps`: Ordered steps for each humor flavor with prompts, model, I/O types, temperature, role.
- `humor_flavor_step_types`: Classification of step types.
- `llm_models`: Normalized model metadata.
- `llm_providers`: Normalized provider metadata.
- `llm_input_types`: Normalized model input types.
- `llm_output_types`: Normalized model output types.
- `humor_flavor_theme_mappings`: Mappings between humor flavors and themes.
- `humor_themes`: Theme taxonomy for humor flavors.

### Community Context

- `communities`: Bounded social groups.
- `community_contexts`: Insider cultural knowledge and context (optionally embedded).
- `community_context_tags`: Tag definitions.
- `community_context_tag_mappings`: Tag-to-context mappings.

### Studies & Research

- `studies`: Bounded experiment definitions with time windows.
- `study_caption_mappings`: Joins captions to studies and vote data.
- `study_image_sets`: Grouped sets of images for studies.
- `study_image_set_image_mappings`: Joins images into study image sets.

### Gen-Z & Style References

- `terms`: Gen-Z vocabulary terms.
- `term_types`: Term classification.
- `news_snippets`: Real-world grounding snippets.
- `news_entities`: Entities linked to news snippets.
- `personalities`: Voice/style profiles.
- `transcripts`: Source text for styles/voices.
- `transcript_personality_mappings`: Links transcripts to personalities.

### Invitations, Access Control, and Safety

- `allowed_signup_domains`: Domains allowed to register.
- `invitations`: Controlled onboarding.
- `bug_reports`: Operational feedback from users.
- `testflight_errors`: Testflight crash/error reports.
