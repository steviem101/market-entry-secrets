import { defineMcp } from "@lovable.dev/mcp-js";
import searchServiceProviders from "./tools/search-service-providers";
import searchMentors from "./tools/search-mentors";
import listEvents from "./tools/list-events";
import searchContent from "./tools/search-content";
import searchLeads from "./tools/search-leads";

export default defineMcp({
  name: "market-entry-secrets-mcp",
  title: "Market Entry Secrets",
  version: "0.1.0",
  instructions:
    "Read-only tools over the Market Entry Secrets directory of Australian/ANZ market entry resources: vetted service providers, mentors, events, B2B lead databases, and published guides/case studies. Use these to answer questions about entering the Australian market or to find real providers, people, and events for a given industry or location.",
  tools: [
    searchServiceProviders,
    searchMentors,
    listEvents,
    searchContent,
    searchLeads,
  ],
});