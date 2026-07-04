create extension if not exists "pg_net" with schema "public";

drop policy "Anyone can submit email leads" on "public"."email_leads";

drop policy "events_public_read" on "public"."events";

drop policy "Anyone can submit lead submissions" on "public"."lead_submissions";

revoke references on table "public"."_archived_market_entry_reports" from "anon";

revoke trigger on table "public"."_archived_market_entry_reports" from "anon";

revoke truncate on table "public"."_archived_market_entry_reports" from "anon";

revoke references on table "public"."_archived_market_entry_reports" from "authenticated";

revoke trigger on table "public"."_archived_market_entry_reports" from "authenticated";

revoke truncate on table "public"."_archived_market_entry_reports" from "authenticated";

revoke references on table "public"."activity_event_routing" from "anon";

revoke trigger on table "public"."activity_event_routing" from "anon";

revoke truncate on table "public"."activity_event_routing" from "anon";

revoke references on table "public"."activity_event_routing" from "authenticated";

revoke trigger on table "public"."activity_event_routing" from "authenticated";

revoke truncate on table "public"."activity_event_routing" from "authenticated";

revoke references on table "public"."activity_events" from "anon";

revoke trigger on table "public"."activity_events" from "anon";

revoke truncate on table "public"."activity_events" from "anon";

revoke references on table "public"."activity_events" from "authenticated";

revoke trigger on table "public"."activity_events" from "authenticated";

revoke truncate on table "public"."activity_events" from "authenticated";

revoke references on table "public"."agency_contacts" from "anon";

revoke trigger on table "public"."agency_contacts" from "anon";

revoke truncate on table "public"."agency_contacts" from "anon";

revoke references on table "public"."agency_contacts" from "authenticated";

revoke trigger on table "public"."agency_contacts" from "authenticated";

revoke truncate on table "public"."agency_contacts" from "authenticated";

revoke references on table "public"."agency_resources" from "anon";

revoke trigger on table "public"."agency_resources" from "anon";

revoke truncate on table "public"."agency_resources" from "anon";

revoke references on table "public"."agency_resources" from "authenticated";

revoke trigger on table "public"."agency_resources" from "authenticated";

revoke truncate on table "public"."agency_resources" from "authenticated";

revoke references on table "public"."ai_chat_conversations" from "anon";

revoke trigger on table "public"."ai_chat_conversations" from "anon";

revoke truncate on table "public"."ai_chat_conversations" from "anon";

revoke references on table "public"."ai_chat_conversations" from "authenticated";

revoke trigger on table "public"."ai_chat_conversations" from "authenticated";

revoke truncate on table "public"."ai_chat_conversations" from "authenticated";

revoke references on table "public"."ai_chat_messages" from "anon";

revoke trigger on table "public"."ai_chat_messages" from "anon";

revoke truncate on table "public"."ai_chat_messages" from "anon";

revoke references on table "public"."ai_chat_messages" from "authenticated";

revoke trigger on table "public"."ai_chat_messages" from "authenticated";

revoke truncate on table "public"."ai_chat_messages" from "authenticated";

revoke references on table "public"."automation_runs" from "anon";

revoke trigger on table "public"."automation_runs" from "anon";

revoke truncate on table "public"."automation_runs" from "anon";

revoke references on table "public"."automation_runs" from "authenticated";

revoke trigger on table "public"."automation_runs" from "authenticated";

revoke truncate on table "public"."automation_runs" from "authenticated";

revoke references on table "public"."bookmarks" from "anon";

revoke trigger on table "public"."bookmarks" from "anon";

revoke truncate on table "public"."bookmarks" from "anon";

revoke references on table "public"."bookmarks" from "authenticated";

revoke trigger on table "public"."bookmarks" from "authenticated";

revoke truncate on table "public"."bookmarks" from "authenticated";

revoke references on table "public"."case_study_quotes" from "anon";

revoke trigger on table "public"."case_study_quotes" from "anon";

revoke truncate on table "public"."case_study_quotes" from "anon";

revoke references on table "public"."case_study_quotes" from "authenticated";

revoke trigger on table "public"."case_study_quotes" from "authenticated";

revoke truncate on table "public"."case_study_quotes" from "authenticated";

revoke references on table "public"."case_study_sources" from "anon";

revoke trigger on table "public"."case_study_sources" from "anon";

revoke truncate on table "public"."case_study_sources" from "anon";

revoke references on table "public"."case_study_sources" from "authenticated";

revoke trigger on table "public"."case_study_sources" from "authenticated";

revoke truncate on table "public"."case_study_sources" from "authenticated";

revoke references on table "public"."community_members" from "anon";

revoke trigger on table "public"."community_members" from "anon";

revoke truncate on table "public"."community_members" from "anon";

revoke references on table "public"."community_members" from "authenticated";

revoke trigger on table "public"."community_members" from "authenticated";

revoke truncate on table "public"."community_members" from "authenticated";

revoke references on table "public"."content_bodies" from "anon";

revoke trigger on table "public"."content_bodies" from "anon";

revoke truncate on table "public"."content_bodies" from "anon";

revoke references on table "public"."content_bodies" from "authenticated";

revoke trigger on table "public"."content_bodies" from "authenticated";

revoke truncate on table "public"."content_bodies" from "authenticated";

revoke references on table "public"."content_categories" from "anon";

revoke trigger on table "public"."content_categories" from "anon";

revoke truncate on table "public"."content_categories" from "anon";

revoke references on table "public"."content_categories" from "authenticated";

revoke trigger on table "public"."content_categories" from "authenticated";

revoke truncate on table "public"."content_categories" from "authenticated";

revoke references on table "public"."content_company_profiles" from "anon";

revoke trigger on table "public"."content_company_profiles" from "anon";

revoke truncate on table "public"."content_company_profiles" from "anon";

revoke references on table "public"."content_company_profiles" from "authenticated";

revoke trigger on table "public"."content_company_profiles" from "authenticated";

revoke truncate on table "public"."content_company_profiles" from "authenticated";

revoke references on table "public"."content_founders" from "anon";

revoke trigger on table "public"."content_founders" from "anon";

revoke truncate on table "public"."content_founders" from "anon";

revoke references on table "public"."content_founders" from "authenticated";

revoke trigger on table "public"."content_founders" from "authenticated";

revoke truncate on table "public"."content_founders" from "authenticated";

revoke references on table "public"."content_items" from "anon";

revoke trigger on table "public"."content_items" from "anon";

revoke truncate on table "public"."content_items" from "anon";

revoke references on table "public"."content_items" from "authenticated";

revoke trigger on table "public"."content_items" from "authenticated";

revoke truncate on table "public"."content_items" from "authenticated";

revoke references on table "public"."content_sections" from "anon";

revoke trigger on table "public"."content_sections" from "anon";

revoke truncate on table "public"."content_sections" from "anon";

revoke references on table "public"."content_sections" from "authenticated";

revoke trigger on table "public"."content_sections" from "authenticated";

revoke truncate on table "public"."content_sections" from "authenticated";

revoke references on table "public"."countries" from "anon";

revoke trigger on table "public"."countries" from "anon";

revoke truncate on table "public"."countries" from "anon";

revoke references on table "public"."countries" from "authenticated";

revoke trigger on table "public"."countries" from "authenticated";

revoke truncate on table "public"."countries" from "authenticated";

revoke references on table "public"."country_case_studies" from "anon";

revoke trigger on table "public"."country_case_studies" from "anon";

revoke truncate on table "public"."country_case_studies" from "anon";

revoke references on table "public"."country_case_studies" from "authenticated";

revoke trigger on table "public"."country_case_studies" from "authenticated";

revoke truncate on table "public"."country_case_studies" from "authenticated";

revoke references on table "public"."country_faqs" from "anon";

revoke trigger on table "public"."country_faqs" from "anon";

revoke truncate on table "public"."country_faqs" from "anon";

revoke references on table "public"."country_faqs" from "authenticated";

revoke trigger on table "public"."country_faqs" from "authenticated";

revoke truncate on table "public"."country_faqs" from "authenticated";

revoke references on table "public"."country_funding_instruments" from "anon";

revoke trigger on table "public"."country_funding_instruments" from "anon";

revoke truncate on table "public"."country_funding_instruments" from "anon";

revoke references on table "public"."country_funding_instruments" from "authenticated";

revoke trigger on table "public"."country_funding_instruments" from "authenticated";

revoke truncate on table "public"."country_funding_instruments" from "authenticated";

revoke references on table "public"."country_page_content" from "anon";

revoke trigger on table "public"."country_page_content" from "anon";

revoke truncate on table "public"."country_page_content" from "anon";

revoke references on table "public"."country_page_content" from "authenticated";

revoke trigger on table "public"."country_page_content" from "authenticated";

revoke truncate on table "public"."country_page_content" from "authenticated";

revoke references on table "public"."country_playbook_stages" from "anon";

revoke trigger on table "public"."country_playbook_stages" from "anon";

revoke truncate on table "public"."country_playbook_stages" from "anon";

revoke references on table "public"."country_playbook_stages" from "authenticated";

revoke trigger on table "public"."country_playbook_stages" from "authenticated";

revoke truncate on table "public"."country_playbook_stages" from "authenticated";

revoke references on table "public"."country_trade_metrics" from "anon";

revoke trigger on table "public"."country_trade_metrics" from "anon";

revoke truncate on table "public"."country_trade_metrics" from "anon";

revoke references on table "public"."country_trade_metrics" from "authenticated";

revoke trigger on table "public"."country_trade_metrics" from "authenticated";

revoke truncate on table "public"."country_trade_metrics" from "authenticated";

revoke references on table "public"."directory_submissions" from "anon";

revoke trigger on table "public"."directory_submissions" from "anon";

revoke truncate on table "public"."directory_submissions" from "anon";

revoke references on table "public"."directory_submissions" from "authenticated";

revoke trigger on table "public"."directory_submissions" from "authenticated";

revoke truncate on table "public"."directory_submissions" from "authenticated";

revoke references on table "public"."ecosystem_import_candidates" from "anon";

revoke trigger on table "public"."ecosystem_import_candidates" from "anon";

revoke truncate on table "public"."ecosystem_import_candidates" from "anon";

revoke references on table "public"."ecosystem_import_candidates" from "authenticated";

revoke trigger on table "public"."ecosystem_import_candidates" from "authenticated";

revoke truncate on table "public"."ecosystem_import_candidates" from "authenticated";

revoke references on table "public"."edge_function_rate_limits" from "anon";

revoke trigger on table "public"."edge_function_rate_limits" from "anon";

revoke truncate on table "public"."edge_function_rate_limits" from "anon";

revoke references on table "public"."edge_function_rate_limits" from "authenticated";

revoke trigger on table "public"."edge_function_rate_limits" from "authenticated";

revoke truncate on table "public"."edge_function_rate_limits" from "authenticated";

revoke references on table "public"."email_leads" from "anon";

revoke trigger on table "public"."email_leads" from "anon";

revoke truncate on table "public"."email_leads" from "anon";

revoke references on table "public"."email_leads" from "authenticated";

revoke trigger on table "public"."email_leads" from "authenticated";

revoke truncate on table "public"."email_leads" from "authenticated";

revoke references on table "public"."email_log" from "anon";

revoke trigger on table "public"."email_log" from "anon";

revoke truncate on table "public"."email_log" from "anon";

revoke references on table "public"."email_log" from "authenticated";

revoke trigger on table "public"."email_log" from "authenticated";

revoke truncate on table "public"."email_log" from "authenticated";

revoke references on table "public"."email_sequence_steps" from "anon";

revoke trigger on table "public"."email_sequence_steps" from "anon";

revoke truncate on table "public"."email_sequence_steps" from "anon";

revoke references on table "public"."email_sequence_steps" from "authenticated";

revoke trigger on table "public"."email_sequence_steps" from "authenticated";

revoke truncate on table "public"."email_sequence_steps" from "authenticated";

revoke references on table "public"."email_sequences" from "anon";

revoke trigger on table "public"."email_sequences" from "anon";

revoke truncate on table "public"."email_sequences" from "anon";

revoke references on table "public"."email_sequences" from "authenticated";

revoke trigger on table "public"."email_sequences" from "authenticated";

revoke truncate on table "public"."email_sequences" from "authenticated";

revoke references on table "public"."events" from "anon";

revoke trigger on table "public"."events" from "anon";

revoke truncate on table "public"."events" from "anon";

revoke references on table "public"."events" from "authenticated";

revoke trigger on table "public"."events" from "authenticated";

revoke truncate on table "public"."events" from "authenticated";

revoke references on table "public"."events_staging" from "anon";

revoke trigger on table "public"."events_staging" from "anon";

revoke truncate on table "public"."events_staging" from "anon";

revoke references on table "public"."events_staging" from "authenticated";

revoke trigger on table "public"."events_staging" from "authenticated";

revoke truncate on table "public"."events_staging" from "authenticated";

revoke references on table "public"."firecrawl_scrape_cache" from "anon";

revoke trigger on table "public"."firecrawl_scrape_cache" from "anon";

revoke truncate on table "public"."firecrawl_scrape_cache" from "anon";

revoke references on table "public"."firecrawl_scrape_cache" from "authenticated";

revoke trigger on table "public"."firecrawl_scrape_cache" from "authenticated";

revoke truncate on table "public"."firecrawl_scrape_cache" from "authenticated";

revoke references on table "public"."guide_attachments" from "anon";

revoke trigger on table "public"."guide_attachments" from "anon";

revoke truncate on table "public"."guide_attachments" from "anon";

revoke references on table "public"."guide_attachments" from "authenticated";

revoke trigger on table "public"."guide_attachments" from "authenticated";

revoke truncate on table "public"."guide_attachments" from "authenticated";

revoke references on table "public"."ii_content" from "anon";

revoke trigger on table "public"."ii_content" from "anon";

revoke truncate on table "public"."ii_content" from "anon";

revoke references on table "public"."ii_content" from "authenticated";

revoke trigger on table "public"."ii_content" from "authenticated";

revoke truncate on table "public"."ii_content" from "authenticated";

revoke references on table "public"."ii_curated_log" from "anon";

revoke trigger on table "public"."ii_curated_log" from "anon";

revoke truncate on table "public"."ii_curated_log" from "anon";

revoke references on table "public"."ii_curated_log" from "authenticated";

revoke trigger on table "public"."ii_curated_log" from "authenticated";

revoke truncate on table "public"."ii_curated_log" from "authenticated";

revoke references on table "public"."ii_curations" from "anon";

revoke trigger on table "public"."ii_curations" from "anon";

revoke truncate on table "public"."ii_curations" from "anon";

revoke references on table "public"."ii_curations" from "authenticated";

revoke trigger on table "public"."ii_curations" from "authenticated";

revoke truncate on table "public"."ii_curations" from "authenticated";

revoke references on table "public"."ii_experiment_outputs" from "anon";

revoke trigger on table "public"."ii_experiment_outputs" from "anon";

revoke truncate on table "public"."ii_experiment_outputs" from "anon";

revoke references on table "public"."ii_experiment_outputs" from "authenticated";

revoke trigger on table "public"."ii_experiment_outputs" from "authenticated";

revoke truncate on table "public"."ii_experiment_outputs" from "authenticated";

revoke references on table "public"."ii_intro_archive" from "anon";

revoke trigger on table "public"."ii_intro_archive" from "anon";

revoke truncate on table "public"."ii_intro_archive" from "anon";

revoke references on table "public"."ii_intro_archive" from "authenticated";

revoke trigger on table "public"."ii_intro_archive" from "authenticated";

revoke truncate on table "public"."ii_intro_archive" from "authenticated";

revoke references on table "public"."ii_prefilter_log" from "anon";

revoke trigger on table "public"."ii_prefilter_log" from "anon";

revoke truncate on table "public"."ii_prefilter_log" from "anon";

revoke references on table "public"."ii_prefilter_log" from "authenticated";

revoke trigger on table "public"."ii_prefilter_log" from "authenticated";

revoke truncate on table "public"."ii_prefilter_log" from "authenticated";

revoke references on table "public"."ii_published_archive" from "anon";

revoke trigger on table "public"."ii_published_archive" from "anon";

revoke truncate on table "public"."ii_published_archive" from "anon";

revoke references on table "public"."ii_published_archive" from "authenticated";

revoke trigger on table "public"."ii_published_archive" from "authenticated";

revoke truncate on table "public"."ii_published_archive" from "authenticated";

revoke references on table "public"."ii_reddit_signals" from "anon";

revoke trigger on table "public"."ii_reddit_signals" from "anon";

revoke truncate on table "public"."ii_reddit_signals" from "anon";

revoke references on table "public"."ii_reddit_signals" from "authenticated";

revoke trigger on table "public"."ii_reddit_signals" from "authenticated";

revoke truncate on table "public"."ii_reddit_signals" from "authenticated";

revoke references on table "public"."industry_sectors" from "anon";

revoke trigger on table "public"."industry_sectors" from "anon";

revoke truncate on table "public"."industry_sectors" from "anon";

revoke references on table "public"."industry_sectors" from "authenticated";

revoke trigger on table "public"."industry_sectors" from "authenticated";

revoke truncate on table "public"."industry_sectors" from "authenticated";

revoke references on table "public"."innovation_ecosystem" from "anon";

revoke trigger on table "public"."innovation_ecosystem" from "anon";

revoke truncate on table "public"."innovation_ecosystem" from "anon";

revoke references on table "public"."innovation_ecosystem" from "authenticated";

revoke trigger on table "public"."innovation_ecosystem" from "authenticated";

revoke truncate on table "public"."innovation_ecosystem" from "authenticated";

revoke references on table "public"."innovation_ecosystem_enrichment_staging" from "anon";

revoke trigger on table "public"."innovation_ecosystem_enrichment_staging" from "anon";

revoke truncate on table "public"."innovation_ecosystem_enrichment_staging" from "anon";

revoke references on table "public"."innovation_ecosystem_enrichment_staging" from "authenticated";

revoke trigger on table "public"."innovation_ecosystem_enrichment_staging" from "authenticated";

revoke truncate on table "public"."innovation_ecosystem_enrichment_staging" from "authenticated";

revoke references on table "public"."intake_form_events" from "anon";

revoke trigger on table "public"."intake_form_events" from "anon";

revoke truncate on table "public"."intake_form_events" from "anon";

revoke references on table "public"."intake_form_events" from "authenticated";

revoke trigger on table "public"."intake_form_events" from "authenticated";

revoke truncate on table "public"."intake_form_events" from "authenticated";

revoke references on table "public"."investors" from "anon";

revoke trigger on table "public"."investors" from "anon";

revoke truncate on table "public"."investors" from "anon";

revoke references on table "public"."investors" from "authenticated";

revoke trigger on table "public"."investors" from "authenticated";

revoke truncate on table "public"."investors" from "authenticated";

revoke references on table "public"."kb_sync_state" from "anon";

revoke trigger on table "public"."kb_sync_state" from "anon";

revoke truncate on table "public"."kb_sync_state" from "anon";

revoke references on table "public"."kb_sync_state" from "authenticated";

revoke trigger on table "public"."kb_sync_state" from "authenticated";

revoke truncate on table "public"."kb_sync_state" from "authenticated";

revoke references on table "public"."knowledge_embed_log" from "anon";

revoke trigger on table "public"."knowledge_embed_log" from "anon";

revoke truncate on table "public"."knowledge_embed_log" from "anon";

revoke references on table "public"."knowledge_embed_log" from "authenticated";

revoke trigger on table "public"."knowledge_embed_log" from "authenticated";

revoke truncate on table "public"."knowledge_embed_log" from "authenticated";

revoke references on table "public"."lead_database_records" from "anon";

revoke trigger on table "public"."lead_database_records" from "anon";

revoke truncate on table "public"."lead_database_records" from "anon";

revoke references on table "public"."lead_database_records" from "authenticated";

revoke trigger on table "public"."lead_database_records" from "authenticated";

revoke truncate on table "public"."lead_database_records" from "authenticated";

revoke references on table "public"."lead_databases" from "anon";

revoke trigger on table "public"."lead_databases" from "anon";

revoke truncate on table "public"."lead_databases" from "anon";

revoke references on table "public"."lead_databases" from "authenticated";

revoke trigger on table "public"."lead_databases" from "authenticated";

revoke truncate on table "public"."lead_databases" from "authenticated";

revoke references on table "public"."lead_submissions" from "anon";

revoke trigger on table "public"."lead_submissions" from "anon";

revoke truncate on table "public"."lead_submissions" from "anon";

revoke references on table "public"."lead_submissions" from "authenticated";

revoke trigger on table "public"."lead_submissions" from "authenticated";

revoke truncate on table "public"."lead_submissions" from "authenticated";

revoke references on table "public"."leads" from "anon";

revoke trigger on table "public"."leads" from "anon";

revoke truncate on table "public"."leads" from "anon";

revoke references on table "public"."leads" from "authenticated";

revoke trigger on table "public"."leads" from "authenticated";

revoke truncate on table "public"."leads" from "authenticated";

revoke references on table "public"."legacy_industry_mapping" from "anon";

revoke trigger on table "public"."legacy_industry_mapping" from "anon";

revoke truncate on table "public"."legacy_industry_mapping" from "anon";

revoke references on table "public"."legacy_industry_mapping" from "authenticated";

revoke trigger on table "public"."legacy_industry_mapping" from "authenticated";

revoke truncate on table "public"."legacy_industry_mapping" from "authenticated";

revoke references on table "public"."lemlist_companies" from "anon";

revoke trigger on table "public"."lemlist_companies" from "anon";

revoke truncate on table "public"."lemlist_companies" from "anon";

revoke references on table "public"."lemlist_companies" from "authenticated";

revoke trigger on table "public"."lemlist_companies" from "authenticated";

revoke truncate on table "public"."lemlist_companies" from "authenticated";

revoke references on table "public"."lemlist_contacts" from "anon";

revoke trigger on table "public"."lemlist_contacts" from "anon";

revoke truncate on table "public"."lemlist_contacts" from "anon";

revoke references on table "public"."lemlist_contacts" from "authenticated";

revoke trigger on table "public"."lemlist_contacts" from "authenticated";

revoke truncate on table "public"."lemlist_contacts" from "authenticated";

revoke references on table "public"."linkedin_industries" from "anon";

revoke trigger on table "public"."linkedin_industries" from "anon";

revoke truncate on table "public"."linkedin_industries" from "anon";

revoke references on table "public"."linkedin_industries" from "authenticated";

revoke trigger on table "public"."linkedin_industries" from "authenticated";

revoke truncate on table "public"."linkedin_industries" from "authenticated";

revoke references on table "public"."locations" from "anon";

revoke trigger on table "public"."locations" from "anon";

revoke truncate on table "public"."locations" from "anon";

revoke references on table "public"."locations" from "authenticated";

revoke trigger on table "public"."locations" from "authenticated";

revoke truncate on table "public"."locations" from "authenticated";

revoke references on table "public"."mentor_contact_requests" from "anon";

revoke trigger on table "public"."mentor_contact_requests" from "anon";

revoke truncate on table "public"."mentor_contact_requests" from "anon";

revoke references on table "public"."mentor_contact_requests" from "authenticated";

revoke trigger on table "public"."mentor_contact_requests" from "authenticated";

revoke truncate on table "public"."mentor_contact_requests" from "authenticated";

revoke references on table "public"."mes_knowledge_base" from "anon";

revoke trigger on table "public"."mes_knowledge_base" from "anon";

revoke truncate on table "public"."mes_knowledge_base" from "anon";

revoke references on table "public"."mes_knowledge_base" from "authenticated";

revoke trigger on table "public"."mes_knowledge_base" from "authenticated";

revoke truncate on table "public"."mes_knowledge_base" from "authenticated";

revoke references on table "public"."organisation_categories" from "anon";

revoke trigger on table "public"."organisation_categories" from "anon";

revoke truncate on table "public"."organisation_categories" from "anon";

revoke references on table "public"."organisation_categories" from "authenticated";

revoke trigger on table "public"."organisation_categories" from "authenticated";

revoke truncate on table "public"."organisation_categories" from "authenticated";

revoke references on table "public"."partner_domain_lookup" from "anon";

revoke trigger on table "public"."partner_domain_lookup" from "anon";

revoke truncate on table "public"."partner_domain_lookup" from "anon";

revoke references on table "public"."partner_domain_lookup" from "authenticated";

revoke trigger on table "public"."partner_domain_lookup" from "authenticated";

revoke truncate on table "public"."partner_domain_lookup" from "authenticated";

revoke references on table "public"."payment_webhook_logs" from "anon";

revoke trigger on table "public"."payment_webhook_logs" from "anon";

revoke truncate on table "public"."payment_webhook_logs" from "anon";

revoke references on table "public"."payment_webhook_logs" from "authenticated";

revoke trigger on table "public"."payment_webhook_logs" from "authenticated";

revoke truncate on table "public"."payment_webhook_logs" from "authenticated";

revoke references on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke references on table "public"."report_quality" from "anon";

revoke trigger on table "public"."report_quality" from "anon";

revoke truncate on table "public"."report_quality" from "anon";

revoke references on table "public"."report_quality" from "authenticated";

revoke trigger on table "public"."report_quality" from "authenticated";

revoke truncate on table "public"."report_quality" from "authenticated";

revoke references on table "public"."report_quality_proposals" from "anon";

revoke trigger on table "public"."report_quality_proposals" from "anon";

revoke truncate on table "public"."report_quality_proposals" from "anon";

revoke references on table "public"."report_quality_proposals" from "authenticated";

revoke trigger on table "public"."report_quality_proposals" from "authenticated";

revoke truncate on table "public"."report_quality_proposals" from "authenticated";

revoke references on table "public"."report_templates" from "anon";

revoke trigger on table "public"."report_templates" from "anon";

revoke truncate on table "public"."report_templates" from "anon";

revoke references on table "public"."report_templates" from "authenticated";

revoke trigger on table "public"."report_templates" from "authenticated";

revoke truncate on table "public"."report_templates" from "authenticated";

revoke references on table "public"."service_provider_categories" from "anon";

revoke trigger on table "public"."service_provider_categories" from "anon";

revoke truncate on table "public"."service_provider_categories" from "anon";

revoke references on table "public"."service_provider_categories" from "authenticated";

revoke trigger on table "public"."service_provider_categories" from "authenticated";

revoke truncate on table "public"."service_provider_categories" from "authenticated";

revoke references on table "public"."service_provider_contacts" from "anon";

revoke trigger on table "public"."service_provider_contacts" from "anon";

revoke truncate on table "public"."service_provider_contacts" from "anon";

revoke references on table "public"."service_provider_contacts" from "authenticated";

revoke trigger on table "public"."service_provider_contacts" from "authenticated";

revoke truncate on table "public"."service_provider_contacts" from "authenticated";

revoke references on table "public"."service_provider_reviews" from "anon";

revoke trigger on table "public"."service_provider_reviews" from "anon";

revoke truncate on table "public"."service_provider_reviews" from "anon";

revoke references on table "public"."service_provider_reviews" from "authenticated";

revoke trigger on table "public"."service_provider_reviews" from "authenticated";

revoke truncate on table "public"."service_provider_reviews" from "authenticated";

revoke references on table "public"."service_providers" from "anon";

revoke trigger on table "public"."service_providers" from "anon";

revoke truncate on table "public"."service_providers" from "anon";

revoke references on table "public"."service_providers" from "authenticated";

revoke trigger on table "public"."service_providers" from "authenticated";

revoke truncate on table "public"."service_providers" from "authenticated";

revoke references on table "public"."testimonials" from "anon";

revoke trigger on table "public"."testimonials" from "anon";

revoke truncate on table "public"."testimonials" from "anon";

revoke references on table "public"."testimonials" from "authenticated";

revoke trigger on table "public"."testimonials" from "authenticated";

revoke truncate on table "public"."testimonials" from "authenticated";

revoke references on table "public"."trade_agencies_enrichment_staging" from "anon";

revoke trigger on table "public"."trade_agencies_enrichment_staging" from "anon";

revoke truncate on table "public"."trade_agencies_enrichment_staging" from "anon";

revoke references on table "public"."trade_agencies_enrichment_staging" from "authenticated";

revoke trigger on table "public"."trade_agencies_enrichment_staging" from "authenticated";

revoke truncate on table "public"."trade_agencies_enrichment_staging" from "authenticated";

revoke references on table "public"."trade_investment_agencies" from "anon";

revoke trigger on table "public"."trade_investment_agencies" from "anon";

revoke truncate on table "public"."trade_investment_agencies" from "anon";

revoke references on table "public"."trade_investment_agencies" from "authenticated";

revoke trigger on table "public"."trade_investment_agencies" from "authenticated";

revoke truncate on table "public"."trade_investment_agencies" from "authenticated";

revoke references on table "public"."user_intake_forms" from "anon";

revoke trigger on table "public"."user_intake_forms" from "anon";

revoke truncate on table "public"."user_intake_forms" from "anon";

revoke references on table "public"."user_intake_forms" from "authenticated";

revoke trigger on table "public"."user_intake_forms" from "authenticated";

revoke truncate on table "public"."user_intake_forms" from "authenticated";

revoke references on table "public"."user_reports" from "anon";

revoke trigger on table "public"."user_reports" from "anon";

revoke truncate on table "public"."user_reports" from "anon";

revoke references on table "public"."user_reports" from "authenticated";

revoke trigger on table "public"."user_reports" from "authenticated";

revoke truncate on table "public"."user_reports" from "authenticated";

revoke references on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "authenticated";

revoke trigger on table "public"."user_roles" from "authenticated";

revoke truncate on table "public"."user_roles" from "authenticated";

revoke references on table "public"."user_subscriptions" from "anon";

revoke trigger on table "public"."user_subscriptions" from "anon";

revoke truncate on table "public"."user_subscriptions" from "anon";

revoke references on table "public"."user_subscriptions" from "authenticated";

revoke trigger on table "public"."user_subscriptions" from "authenticated";

revoke truncate on table "public"."user_subscriptions" from "authenticated";

revoke references on table "public"."user_usage" from "anon";

revoke trigger on table "public"."user_usage" from "anon";

revoke truncate on table "public"."user_usage" from "anon";

revoke references on table "public"."user_usage" from "authenticated";

revoke trigger on table "public"."user_usage" from "authenticated";

revoke truncate on table "public"."user_usage" from "authenticated";


  create policy "Anyone can submit email leads"
  on "public"."email_leads"
  as permissive
  for insert
  to public
with check ((((length(email) >= 3) AND (length(email) <= 320)) AND (POSITION(('@'::text) IN (email)) > 1)));



  create policy "events_public_read"
  on "public"."events"
  as permissive
  for select
  to anon, authenticated
using ((status = 'approved'::text));



  create policy "Anyone can submit lead submissions"
  on "public"."lead_submissions"
  as permissive
  for insert
  to public
with check ((((email IS NULL) OR (((length(email) >= 3) AND (length(email) <= 320)) AND (POSITION(('@'::text) IN (email)) > 1))) AND ((notes IS NULL) OR (length(notes) <= 5000)) AND ((company_website IS NULL) OR (length(company_website) <= 2000))));



