-- Backfill website + company_logo for 53 published case studies
-- missing both fields. Idempotent: only updates rows where website
-- and company_logo are both still NULL.

-- airbnb-australia-market-entry (Airbnb)
UPDATE content_company_profiles cp
   SET website = 'https://airbnb.com',
       company_logo = 'https://img.logo.dev/airbnb.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'airbnb-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- amazon-australia-ecommerce-entry (Amazon.com)
UPDATE content_company_profiles cp
   SET website = 'https://amazon.com',
       company_logo = 'https://img.logo.dev/amazon.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'amazon-australia-ecommerce-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- anna-money-anz-market-entry (ANNA Money)
UPDATE content_company_profiles cp
   SET website = 'https://anna.money',
       company_logo = 'https://img.logo.dev/anna.money?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'anna-money-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- anthropic-australia-market-entry (Anthropic)
UPDATE content_company_profiles cp
   SET website = 'https://anthropic.com',
       company_logo = 'https://img.logo.dev/anthropic.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'anthropic-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- aws-australia-market-entry (Amazon Web Services (AWS))
UPDATE content_company_profiles cp
   SET website = 'https://aws.amazon.com',
       company_logo = 'https://img.logo.dev/aws.amazon.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'aws-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- banked-anz-market-entry (Banked)
UPDATE content_company_profiles cp
   SET website = 'https://banked.com',
       company_logo = 'https://img.logo.dev/banked.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'banked-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- blue-prism-anz-market-entry (Blue Prism)
UPDATE content_company_profiles cp
   SET website = 'https://blueprism.com',
       company_logo = 'https://img.logo.dev/blueprism.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'blue-prism-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- clanwilliam-anz-market-entry (Clanwilliam)
UPDATE content_company_profiles cp
   SET website = 'https://clanwilliam.com',
       company_logo = 'https://img.logo.dev/clanwilliam.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'clanwilliam-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- comfortdelgro-anz-market-entry (ComfortDelGro)
UPDATE content_company_profiles cp
   SET website = 'https://comfortdelgro.com',
       company_logo = 'https://img.logo.dev/comfortdelgro.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'comfortdelgro-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- complyadvantage-anz-market-entry (ComplyAdvantage)
UPDATE content_company_profiles cp
   SET website = 'https://complyadvantage.com',
       company_logo = 'https://img.logo.dev/complyadvantage.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'complyadvantage-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- contino-anz-market-entry (Contino)
UPDATE content_company_profiles cp
   SET website = 'https://contino.io',
       company_logo = 'https://img.logo.dev/contino.io?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'contino-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- daon-anz-market-entry (Daon)
UPDATE content_company_profiles cp
   SET website = 'https://daon.com',
       company_logo = 'https://img.logo.dev/daon.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'daon-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- darktrace-anz-market-entry (Darktrace)
UPDATE content_company_profiles cp
   SET website = 'https://darktrace.com',
       company_logo = 'https://img.logo.dev/darktrace.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'darktrace-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- databricks-australia-market-entry (Databricks)
UPDATE content_company_profiles cp
   SET website = 'https://databricks.com',
       company_logo = 'https://img.logo.dev/databricks.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'databricks-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- daxtra-technologies-anz-market-entry (DaXtra Technologies)
UPDATE content_company_profiles cp
   SET website = 'https://daxtra.com',
       company_logo = 'https://img.logo.dev/daxtra.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'daxtra-technologies-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- deliveroo-anz-market-entry (Deliveroo)
UPDATE content_company_profiles cp
   SET website = 'https://deliveroo.co.uk',
       company_logo = 'https://img.logo.dev/deliveroo.co.uk?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'deliveroo-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- dext-anz-market-entry (Dext)
UPDATE content_company_profiles cp
   SET website = 'https://dext.com',
       company_logo = 'https://img.logo.dev/dext.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'dext-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- docusign-australia-market-entry (DocuSign)
UPDATE content_company_profiles cp
   SET website = 'https://docusign.com',
       company_logo = 'https://img.logo.dev/docusign.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'docusign-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- featurespace-anz-market-entry (Featurespace)
UPDATE content_company_profiles cp
   SET website = 'https://featurespace.com',
       company_logo = 'https://img.logo.dev/featurespace.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'featurespace-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- fenergo-anz-market-entry (Fenergo)
UPDATE content_company_profiles cp
   SET website = 'https://fenergo.com',
       company_logo = 'https://img.logo.dev/fenergo.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'fenergo-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- fexco-anz-market-entry (Fexco)
UPDATE content_company_profiles cp
   SET website = 'https://fexco.com',
       company_logo = 'https://img.logo.dev/fexco.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'fexco-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- fineos-anz-market-entry (FINEOS)
UPDATE content_company_profiles cp
   SET website = 'https://fineos.com',
       company_logo = 'https://img.logo.dev/fineos.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'fineos-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- github-australia-market-entry (GitHub)
UPDATE content_company_profiles cp
   SET website = 'https://github.com',
       company_logo = 'https://img.logo.dev/github.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'github-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- kyckr-anz-market-entry (Kyckr)
UPDATE content_company_profiles cp
   SET website = 'https://kyckr.com',
       company_logo = 'https://img.logo.dev/kyckr.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'kyckr-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- learnupon-anz-market-entry (LearnUpon)
UPDATE content_company_profiles cp
   SET website = 'https://learnupon.com',
       company_logo = 'https://img.logo.dev/learnupon.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'learnupon-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- mimecast-anz-market-entry (Mimecast)
UPDATE content_company_profiles cp
   SET website = 'https://mimecast.com',
       company_logo = 'https://img.logo.dev/mimecast.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'mimecast-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- ncc-group-anz-market-entry (NCC Group)
UPDATE content_company_profiles cp
   SET website = 'https://nccgroup.com',
       company_logo = 'https://img.logo.dev/nccgroup.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'ncc-group-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- nium-anz-market-entry (Nium)
UPDATE content_company_profiles cp
   SET website = 'https://nium.com',
       company_logo = 'https://img.logo.dev/nium.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'nium-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- nplan-anz-market-entry (nPlan)
UPDATE content_company_profiles cp
   SET website = 'https://nplan.io',
       company_logo = 'https://img.logo.dev/nplan.io?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'nplan-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- onfido-anz-market-entry (Onfido)
UPDATE content_company_profiles cp
   SET website = 'https://onfido.com',
       company_logo = 'https://img.logo.dev/onfido.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'onfido-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- openai-australia-market-entry (OpenAI)
UPDATE content_company_profiles cp
   SET website = 'https://openai.com',
       company_logo = 'https://img.logo.dev/openai.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'openai-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- palantir-australia-market-entry (Palantir Technologies)
UPDATE content_company_profiles cp
   SET website = 'https://palantir.com',
       company_logo = 'https://img.logo.dev/palantir.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'palantir-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- propertyguru-anz-market-entry (PropertyGuru)
UPDATE content_company_profiles cp
   SET website = 'https://propertyguru.com',
       company_logo = 'https://img.logo.dev/propertyguru.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'propertyguru-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- quantexa-anz-market-entry (Quantexa)
UPDATE content_company_profiles cp
   SET website = 'https://quantexa.com',
       company_logo = 'https://img.logo.dev/quantexa.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'quantexa-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- revolut-anz-market-entry (Revolut)
UPDATE content_company_profiles cp
   SET website = 'https://revolut.com',
       company_logo = 'https://img.logo.dev/revolut.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'revolut-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- salesforce-australia-market-entry (Salesforce)
UPDATE content_company_profiles cp
   SET website = 'https://salesforce.com',
       company_logo = 'https://img.logo.dev/salesforce.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'salesforce-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- secretlab-anz-market-entry (Secretlab)
UPDATE content_company_profiles cp
   SET website = 'https://secretlab.co',
       company_logo = 'https://img.logo.dev/secretlab.co?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'secretlab-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- sensat-anz-market-entry (Sensat)
UPDATE content_company_profiles cp
   SET website = 'https://sensat.co',
       company_logo = 'https://img.logo.dev/sensat.co?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'sensat-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- servicenow-australia-market-entry (ServiceNow)
UPDATE content_company_profiles cp
   SET website = 'https://servicenow.com',
       company_logo = 'https://img.logo.dev/servicenow.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'servicenow-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- shopback-anz-market-entry (ShopBack)
UPDATE content_company_profiles cp
   SET website = 'https://shopback.com',
       company_logo = 'https://img.logo.dev/shopback.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'shopback-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- snowflake-australia-market-entry (Snowflake)
UPDATE content_company_profiles cp
   SET website = 'https://snowflake.com',
       company_logo = 'https://img.logo.dev/snowflake.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'snowflake-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- spectrum-life-anz-market-entry (Spectrum.Life)
UPDATE content_company_profiles cp
   SET website = 'https://spectrum.life',
       company_logo = 'https://img.logo.dev/spectrum.life?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'spectrum-life-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- t-pro-anz-market-entry (T-Pro)
UPDATE content_company_profiles cp
   SET website = 'https://tpro.io',
       company_logo = 'https://img.logo.dev/tpro.io?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 't-pro-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- tesla-australia-market-entry (Tesla)
UPDATE content_company_profiles cp
   SET website = 'https://tesla.com',
       company_logo = 'https://img.logo.dev/tesla.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'tesla-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- thought-machine-anz-market-entry (Thought Machine)
UPDATE content_company_profiles cp
   SET website = 'https://thoughtmachine.net',
       company_logo = 'https://img.logo.dev/thoughtmachine.net?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'thought-machine-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- tines-anz-market-entry (Tines)
UPDATE content_company_profiles cp
   SET website = 'https://tines.com',
       company_logo = 'https://img.logo.dev/tines.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'tines-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- tractable-anz-market-entry (Tractable)
UPDATE content_company_profiles cp
   SET website = 'https://tractable.ai',
       company_logo = 'https://img.logo.dev/tractable.ai?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'tractable-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- twilio-australia-market-entry (Twilio)
UPDATE content_company_profiles cp
   SET website = 'https://twilio.com',
       company_logo = 'https://img.logo.dev/twilio.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'twilio-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- uipath-australia-market-entry (UiPath)
UPDATE content_company_profiles cp
   SET website = 'https://uipath.com',
       company_logo = 'https://img.logo.dev/uipath.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'uipath-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- wayflyer-anz-market-entry (Wayflyer)
UPDATE content_company_profiles cp
   SET website = 'https://wayflyer.com',
       company_logo = 'https://img.logo.dev/wayflyer.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'wayflyer-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- wise-anz-market-entry (Wise)
UPDATE content_company_profiles cp
   SET website = 'https://wise.com',
       company_logo = 'https://img.logo.dev/wise.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'wise-anz-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- xero-australia-market-entry (Xero)
UPDATE content_company_profiles cp
   SET website = 'https://xero.com',
       company_logo = 'https://img.logo.dev/xero.com?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'xero-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;

-- zoom-australia-market-entry (Zoom Video Communications)
UPDATE content_company_profiles cp
   SET website = 'https://zoom.us',
       company_logo = 'https://img.logo.dev/zoom.us?token=pk_L3JbJjCeT0-mUdhpPlS6SA&size=256&format=png'
  FROM content_items ci
  WHERE cp.content_id = ci.id
    AND ci.slug = 'zoom-australia-market-entry'
    AND cp.website IS NULL
    AND cp.company_logo IS NULL;
