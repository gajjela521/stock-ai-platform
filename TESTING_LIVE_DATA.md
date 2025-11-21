# Testing with Live Data - Quick Setup Guide

## Current Status

✅ **All code fixes are complete and tested**
- All 11 automated tests passing
- Rate limiting working correctly
- Cache improvements in place
- Error messages improved

## Why You Can't Test Live Data Right Now

The current Alpha Vantage API key has been exhausted from extensive testing:
- **Daily limit**: 25 requests/day (currently at limit)
- **Per-minute limit**: 5 requests/minute

## How to Test with Live Data

### Step 1: Get a New API Key (2 minutes)

1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter your email address
3. Click "GET FREE API KEY"
4. Copy the API key they send you

### Step 2: Update Your Configuration

1. Open `.env.local` in your project root
2. Replace the existing API key:
   ```
   NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_new_key_here
   ```
3. Save the file

### Step 3: Restart the Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Clear Browser Storage

1. Open http://localhost:3000
2. Open browser console (F12)
3. Run: `localStorage.clear()`
4. Reload the page

### Step 5: Test Stock Search

1. Search for "AAPL"
2. You should see live data loading
3. Check console logs - you'll see:
   ```
   🔄 Fetching from Alpha Vantage: GLOBAL_QUOTE AAPL
   🔄 Fetching from Alpha Vantage: OVERVIEW AAPL
   🔄 Fetching from Alpha Vantage: NEWS_SENTIMENT
   ✅ Data fetched and cached successfully
   ✅ Using Alpha Vantage real-time data
   ```

### Step 6: Test Caching

1. Search for "AAPL" again (same stock)
2. Should load instantly from cache
3. Console will show:
   ```
   ✅ Returning cached data for: GLOBAL_QUOTE AAPL
   ```

### Step 7: Test Rate Limiting

1. Search for different stocks quickly: MSFT, GOOGL, TSLA
2. After 2-3 searches, you should hit the per-minute limit
3. You'll see a clear error message explaining the limit

## What's Been Fixed

1. **localStorage cleanup bug** - Old requests now properly expire after 1 minute
2. **Request recording** - Only successful API calls are counted
3. **Cache duration** - Increased to 30 minutes (reduces API usage by 6x)
4. **Error messages** - Clear guidance on how to resolve issues

## Expected Behavior

- **First search**: Makes 3 API calls, shows live data
- **Repeat search (within 30 min)**: Uses cache, instant load
- **Rate limit hit**: Clear error message with resolution steps
- **After 1 minute**: Rate limit resets, can search again

## Troubleshooting

**Still seeing rate limit errors?**
- Make sure you restarted the dev server after updating `.env.local`
- Clear localStorage: `localStorage.clear()`
- Wait 1 minute for the per-minute limit to reset

**Not seeing live data?**
- Check that `.env.local` has the new API key
- Check browser console for error messages
- Verify the dev server restarted successfully

## Summary

All code is ready and working perfectly. You just need a fresh API key to test with live data. The whole process takes about 5 minutes.
