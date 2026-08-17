# Getting Started with Testing - Quick Start Guide

## Step 1: Fix Frontend Tests (Immediate)

### Fix react-router-dom compatibility issue:
```bash
cd frontend
npm install react-router-dom@6.28.0 --save
npm test -- --watchAll=false
```

Expected output:
```
 PASS  src/App.test.js
  ✓ renders learn react link (45ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
```

---

## Step 2: Set Up Backend Testing (High Priority)

### Install testing dependencies:
```bash
cd backend
npm install --save-dev jest supertest mongodb-memory-server
```

### Update backend/package.json scripts:
Add these to the `scripts` section:
```json
"test": "jest --detectOpenHandles",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

### Run backend tests:
```bash
npm test
```

---

## Step 3: Run All Tests Together

### Option A: Run individually
```bash
# Terminal 1 - Frontend
cd frontend && npm test

# Terminal 2 - Backend  
cd backend && npm test
```

### Option B: Create root-level test script
In your project root, create `run-all-tests.sh` (Linux/Mac):
```bash
#!/bin/bash
echo "=== Running Backend Tests ==="
cd backend && npm test
BACKEND_EXIT=$?

echo ""
echo "=== Running Frontend Tests ==="
cd ../frontend && npm test
FRONTEND_EXIT=$?

echo ""
echo "=== Test Summary ==="
echo "Backend: $([ $BACKEND_EXIT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"
echo "Frontend: $([ $FRONTEND_EXIT -eq 0 ] && echo 'PASSED' || echo 'FAILED')"

exit $(($BACKEND_EXIT + $FRONTEND_EXIT))
```

For Windows PowerShell, create `run-all-tests.ps1`:
```powershell
Write-Host "=== Running Backend Tests ===" -ForegroundColor Green
Set-Location backend
npm test
$backendExit = $LASTEXITCODE

Write-Host ""
Write-Host "=== Running Frontend Tests ===" -ForegroundColor Green
Set-Location ..\frontend
npm test
$frontendExit = $LASTEXITCODE

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Backend: $(if ($backendExit -eq 0) { 'PASSED' } else { 'FAILED' })"
Write-Host "Frontend: $(if ($frontendExit -eq 0) { 'PASSED' } else { 'FAILED' })"
```

---

## Test File Locations

### Frontend Tests (already created):
- `frontend/src/components/__tests__/Navbar.test.js`
- `frontend/src/services/__tests__/api.test.js`
- `frontend/src/context/__tests__/AuthContext.test.js`

### Backend Tests (already created):
- `backend/__tests__/controllers/authController.test.js`
- `backend/jest.config.js`

---

## What's Included in Sample Tests

### Frontend Tests Cover:
1. **Component Tests** (Navbar.test.js)
   - Component rendering
   - Authentication state display
   - User role-based UI
   - Event handling (logout)

2. **API Service Tests** (api.test.js)
   - Authentication (register, login, logout)
   - Parking endpoints (list, details)
   - Booking endpoints (create, cancel)
   - Payment endpoints (initiate, verify)
   - Error handling (401, 500, network errors)
   - Request interceptors

3. **Context Tests** (AuthContext.test.js)
   - Context initialization
   - User authentication state
   - localStorage persistence
   - Login/logout flow

### Backend Tests Cover:
1. **Authentication Controller Tests**
   - User registration with validation
   - Login with password verification
   - JWT token generation and verification
   - Error cases (duplicate email, invalid credentials)

---

## Running Specific Test Suites

### Frontend:
```bash
cd frontend

# Run specific test file
npm test Navbar.test.js

# Run tests matching pattern
npm test --testNamePattern="should show login"

# Run with coverage
npm test -- --coverage

# Watch mode (runs on file changes)
npm test
```

### Backend:
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test authController.test.js

# Watch mode
npm test --watch

# Coverage report
npm test -- --coverage
```

---

## Understanding Test Output

### Passing Test:
```
✓ should register a new user successfully (12ms)
```

### Failing Test:
```
✕ should reject login with incorrect password
  Expected value to be (using ===):
    401
  Received:
    200
```

### Coverage Report:
```
File                          | % Statements | % Branch | % Funcs | % Lines |
-------------------------------|--------------|----------|---------|---------|
All files                     |       75.5   |   68.2   |   82.1  |   76.3  |
 controllers/authController.js|       85.2   |   78.5   |   100   |   86.1  |
 models/User.js               |       92.3   |   88.4   |   100   |   93.2  |
```

---

## Next Steps for Comprehensive Testing

### Phase 1: Core Tests (Weeks 1-2)
- [ ] Complete authentication tests (backend)
- [ ] Complete component tests (frontend)
- [ ] API integration tests

### Phase 2: Business Logic (Weeks 2-3)
- [ ] Parking management tests
- [ ] Booking system tests
- [ ] Slot availability tests
- [ ] Payment processing tests

### Phase 3: Edge Cases (Week 3-4)
- [ ] Error handling tests
- [ ] Validation tests
- [ ] Database constraint tests
- [ ] API rate limiting tests

### Phase 4: Integration & E2E (Week 4-5)
- [ ] End-to-end user flows
- [ ] Payment gateway integration
- [ ] Notification system
- [ ] Admin operations

---

## Troubleshooting

### Issue: Tests hang/timeout
**Solution**: Add timeout to jest.config.js
```javascript
testTimeout: 10000 // 10 seconds
```

### Issue: Cannot find module errors
**Solution**: Check module paths and mocking
```javascript
jest.mock('../../models/User');
```

### Issue: Database connection errors
**Solution**: Use MongoDB Memory Server for tests
```javascript
const mongoServer = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongoServer.getUri();
```

### Issue: React component rendering errors
**Solution**: Wrap with required providers (Router, Context, etc.)
```javascript
const renderComponent = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuth}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};
```

---

## Performance Tips

1. **Use test.only() to run single test** (remove after):
   ```javascript
   test.only('specific test', () => { ... });
   ```

2. **Use test.skip() to skip tests temporarily**:
   ```javascript
   test.skip('slow test', () => { ... });
   ```

3. **Mock external services** to speed up tests:
   ```javascript
   jest.mock('cloudinary');
   jest.mock('razorpay');
   ```

4. **Use beforeEach for setup** instead of duplicating code:
   ```javascript
   beforeEach(() => {
     jest.clearAllMocks();
     mockRequest = { body: {} };
   });
   ```

---

## CI/CD Integration

### GitHub Actions Example (.github/workflows/test.yml):
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test
      - run: cd frontend && npm install && npm test
```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest (API Testing)](https://github.com/visionmedia/supertest)
- [Jest Mocking](https://jestjs.io/docs/mock-functions)
- [Testing Best Practices](https://jestjs.io/docs/snapshot-testing)

---

## Questions?

Refer to individual test files for detailed examples of:
- Component testing patterns
- Service mocking
- Error handling
- Assertion patterns
