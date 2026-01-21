# Story 7.1: FAQ & Troubleshooting

## Frequently Asked Questions

### Q: Why use Convex actions instead of queries?
**A**: Queries are cached and deterministic, which doesn't work well for external database calls. Actions are designed for non-deterministic operations like external API/database calls.

### Q: Why singleton pattern for MongoDB connection?
**A**: Reusing connections reduces overhead and improves performance. Creating a new connection for each request would be slow and wasteful.

### Q: Can users access other organizations' data?
**A**: No. The action verifies that the user's orgId (from JWT) matches the requested orgId before querying MongoDB.

### Q: What happens if MongoDB is down?
**A**: The action catches the error and returns a meaningful error message. The dashboard shows an error state instead of crashing.

### Q: How is the MongoDB URI kept secure?
**A**: It's stored in `.env.local` and never exposed to the browser. Only the Convex backend (Node.js) can access it.

### Q: Can I cache the emissions data?
**A**: Yes, but it depends on how often the data changes. For now, we fetch fresh data each time. Caching can be added later if needed.

### Q: What if the user's organization doesn't exist in MongoDB?
**A**: The query returns null, and the dashboard shows "No data available" message.

### Q: How do I test this locally?
**A**: Start Convex dev server, start React app, sign in with Clerk, select the test organization, and navigate to the emissions page.

### Q: What's the performance impact?
**A**: MongoDB queries typically take 100-500ms. With connection pooling, subsequent requests are faster. Total action execution should be <1s.

### Q: Can I use this for other data besides emissions?
**A**: Yes! The pattern is generic. You can create similar actions for other MongoDB collections.

## Troubleshooting Guide

### Issue: "MONGODB_URI not configured"

**Symptoms**: Error when calling action

**Causes**:
- `.env.local` missing MONGODB_URI
- Environment variable not loaded

**Solutions**:
1. Check `.env.local` has MONGODB_URI
2. Restart Convex dev server
3. Verify MongoDB connection string is valid
4. Test connection: `mongosh "mongodb+srv://..."`

### Issue: "Unauthorized: Cannot access other organizations"

**Symptoms**: User can't fetch their own data

**Causes**:
- User's orgId doesn't match requested orgId
- JWT doesn't include org_id claim
- Clerk JWT template not configured

**Solutions**:
1. Verify user selected organization in Clerk
2. Check JWT template includes org_id claim
3. Verify CONVEX_JWT_AUDIENCE matches Clerk template
4. Check browser DevTools → Network → JWT token

### Issue: "Failed to query MongoDB"

**Symptoms**: Action returns error

**Causes**:
- MongoDB connection timeout
- Invalid query
- Database/collection doesn't exist
- Network connectivity issue

**Solutions**:
1. Check MongoDB is running
2. Verify database name: `co2-intensities-dev`
3. Verify collection name: `companies`
4. Check network connectivity
5. Increase timeout if needed
6. Check MongoDB logs

### Issue: No data displayed on dashboard

**Symptoms**: Dashboard shows "No data available"

**Causes**:
- Organization doesn't exist in MongoDB
- OrgId doesn't match
- Emissions field is empty
- Query returned null

**Solutions**:
1. Check MongoDB for test organization
2. Verify OrgId: `org_2tWO47gV8vEOLN1lrpV57N02Dh2`
3. Check document has Emissions field
4. Check 2024 data exists
5. Query MongoDB directly: `db.companies.findOne({OrgId: "..."})`

### Issue: Dashboard shows loading forever

**Symptoms**: Spinner never stops

**Causes**:
- Action not returning
- Network request hanging
- Convex dev server not running
- React app not connected to Convex

**Solutions**:
1. Check Convex dev server is running
2. Check browser console for errors
3. Check Network tab for hanging requests
4. Restart Convex dev server
5. Check VITE_CONVEX_URL is correct

### Issue: "Unauthorized: User must be authenticated"

**Symptoms**: Error even when signed in

**Causes**:
- JWT not being sent
- JWT verification failed
- Clerk not configured correctly

**Solutions**:
1. Check user is signed in
2. Check JWT in Network tab
3. Verify CLERK_ISSUER_URL is correct
4. Verify CONVEX_JWT_AUDIENCE matches
5. Check Clerk JWT template is published

### Issue: Connection timeout

**Symptoms**: Action takes >5 seconds or times out

**Causes**:
- MongoDB slow
- Network latency
- Timeout too short
- Connection pool exhausted

**Solutions**:
1. Check MongoDB performance
2. Check network latency
3. Increase timeout value
4. Check connection pool size
5. Monitor MongoDB metrics

### Issue: Cross-org access not prevented

**Symptoms**: User can access other org's data

**Causes**:
- Authorization check missing
- OrgId comparison wrong
- JWT doesn't include org_id

**Solutions**:
1. Verify authorization check in action
2. Check OrgId comparison logic
3. Verify JWT includes org_id claim
4. Add logging to debug
5. Write test for cross-org prevention

## Debug Checklist

When something doesn't work:

- [ ] Check `.env.local` has all required variables
- [ ] Restart Convex dev server: `npx convex dev`
- [ ] Restart React dev server: `bun run dev`
- [ ] Check browser console for errors
- [ ] Check Network tab for failed requests
- [ ] Check Convex dashboard logs
- [ ] Verify user is signed in
- [ ] Verify user selected organization
- [ ] Query MongoDB directly to verify data
- [ ] Check JWT token in Network tab
- [ ] Verify MongoDB connection string
- [ ] Check firewall/network connectivity

## Performance Debugging

### Slow queries?
1. Check MongoDB indexes
2. Monitor query execution time
3. Check network latency
4. Profile MongoDB query

### Slow action execution?
1. Check MongoDB query time
2. Check network latency
3. Check Convex function logs
4. Profile with browser DevTools

### High memory usage?
1. Check connection pool size
2. Monitor MongoDB connections
3. Check for memory leaks
4. Profile with Node.js tools

## Testing Checklist

Before deploying:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed
- [ ] Cross-org access prevented
- [ ] Error handling works
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Security review passed
- [ ] Code review passed
- [ ] Documentation updated

## Getting Help

1. **Check documentation**: Review story7.1-*.md files
2. **Check code examples**: See story7.1-technical-reference.md
3. **Check logs**: Convex dashboard and browser console
4. **Ask team**: Discuss with team members
5. **Debug systematically**: Use checklist above

## Common Mistakes

❌ **Mistake**: Forgetting `await` on async functions
✅ **Fix**: Always use `await` for async calls

❌ **Mistake**: Not checking if user is authenticated
✅ **Fix**: Always call `requireUserId()` first

❌ **Mistake**: Comparing orgIds without verification
✅ **Fix**: Always verify user's orgId matches requested

❌ **Mistake**: Hardcoding MongoDB URI
✅ **Fix**: Use environment variables

❌ **Mistake**: Not handling null responses
✅ **Fix**: Check for null and show appropriate message

❌ **Mistake**: Logging sensitive data
✅ **Fix**: Never log credentials or personal data

## Performance Targets

- MongoDB query: <500ms
- Action execution: <1s
- Dashboard load: <2s
- Connection reuse: 10x faster than new connection

## Security Checklist

- [ ] Authentication verified
- [ ] Authorization verified
- [ ] Cross-org access prevented
- [ ] Credentials not logged
- [ ] Timeouts implemented
- [ ] Error messages safe
- [ ] Input validated
- [ ] Rate limiting considered

