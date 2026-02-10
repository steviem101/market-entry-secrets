

# Fix Build Error + Deploy Edge Functions

## 1. Fix TypeScript build error in `ai-chat/index.ts`

Line 89 uses `error.message` but `error` is typed as `unknown` in the catch block. Fix by casting:

```typescript
} catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        success: false 
      }),
```

## 2. Deploy edge functions

Redeploy these three functions:
- `create-checkout` (updated return_url handling)
- `stripe-webhook` (updated tier_at_generation sync)
- `ai-chat` (build error fix)

No schema changes or new secrets needed.

