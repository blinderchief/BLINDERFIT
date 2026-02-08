# Blinderfit Backend - Testing

This directory contains comprehensive tests for the Blinderfit Backend API.

## Test Structure

```
tests/
├── conftest.py          # Test configuration and fixtures
├── test_auth.py         # Authentication and security tests
├── test_services.py     # Service layer unit tests
└── test_*.py           # Additional test files
```

## Running Tests

### Prerequisites

1. Install test dependencies:
```bash
pip install -r requirements.txt
pip install pytest pytest-asyncio pytest-cov
```

2. Set up environment variables for testing:
```bash
cp .env.example .env
# Edit .env with your test configuration
```

### Test Commands

#### Run All Tests
```bash
python test_runner.py all
```

#### Run Unit Tests Only
```bash
python test_runner.py unit
```

#### Run Integration Tests
```bash
python test_runner.py integration
```

#### Run with Coverage
```bash
python test_runner.py all --coverage
```

#### Run Specific Test File
```bash
python test_runner.py specific test_auth.py
```

#### Run with Verbose Output
```bash
python test_runner.py all --verbose
```

### Manual Test Execution

You can also run tests directly with pytest:

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_auth.py

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test markers
pytest -m unit
pytest -m integration
pytest -m auth
```

## Test Categories

### Unit Tests (`@pytest.mark.unit`)
- Test individual functions and methods
- Mock external dependencies
- Fast execution
- Located in `test_services.py`

### Integration Tests (`@pytest.mark.integration`)
- Test API endpoints end-to-end
- Test database interactions
- Test external service integrations
- May require test database setup

### Authentication Tests (`@pytest.mark.auth`)
- Test Firebase authentication
- Test JWT token validation
- Test authorization middleware

### API Tests (`@pytest.mark.api`)
- Test FastAPI endpoints
- Test request/response handling
- Test error responses
- Located in `test_auth.py`

### Service Tests (`@pytest.mark.service`)
- Test business logic services
- Test Gemini AI integration
- Test notification services
- Test external API integrations

## Test Fixtures

### Common Fixtures (in `conftest.py`)

- `client`: FastAPI test client
- `mock_user`: Mock user data
- `auth_headers`: Authentication headers
- `mock_health_data`: Sample health data
- `mock_meal_data`: Sample meal tracking data
- `mock_exercise_data`: Sample exercise data
- `mock_plan_data`: Sample plan data
- `mock_notification_data`: Sample notification data

### Service Mocks

- `mock_gemini_service`: Mock Gemini AI service
- `mock_notification_service`: Mock notification service
- `mock_integrations_service`: Mock integrations service
- `mock_firestore_client`: Mock Firestore client

## Test Coverage

The test suite aims for 80%+ code coverage. Coverage reports are generated in:

- HTML format: `htmlcov/index.html`
- Terminal output: Run with `--cov-report=term-missing`

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    cd backend
    python test_runner.py all --coverage
```

## Writing New Tests

### Test File Structure

```python
import pytest
from unittest.mock import Mock, patch

def test_example_function(client, mock_user, auth_headers):
    """Test example functionality."""
    # Arrange
    with patch('some.module.function') as mock_func:
        mock_func.return_value = expected_result

    # Act
    response = client.get("/api/endpoint", headers=auth_headers)

    # Assert
    assert response.status_code == 200
    assert response.json() == expected_result
```

### Best Practices

1. **Use descriptive test names**: `test_user_can_create_meal_log`
2. **Test one thing per test**: Keep tests focused and simple
3. **Use fixtures**: Leverage shared test data and setup
4. **Mock external dependencies**: Don't rely on real APIs in unit tests
5. **Test error cases**: Include tests for failure scenarios
6. **Use appropriate markers**: Mark tests with `@pytest.mark.unit`, etc.

### Async Tests

For async functions, use the `@pytest.mark.asyncio` decorator:

```python
@pytest.mark.asyncio
async def test_async_function():
    result = await some_async_function()
    assert result == expected_value
```

## Environment Setup

### Test Database

Tests use a separate test database configuration. Make sure to:

1. Set up test Firebase project
2. Configure test environment variables
3. Use test-specific collections/tables

### External Services

Mock external services in unit tests:

```python
with patch('app.services.gemini_service.gemini_service.generate_content') as mock_gemini:
    mock_gemini.return_value = "Mock response"
    # Test code here
```

## Troubleshooting

### Common Issues

1. **Firebase Auth Errors**: Check test Firebase configuration
2. **Import Errors**: Ensure PYTHONPATH includes the app directory
3. **Async Test Failures**: Use `@pytest.mark.asyncio` for async tests
4. **Mock Errors**: Verify mock targets and return values

### Debug Mode

Run tests with debug output:

```bash
pytest -v -s --pdb
```

### Performance

For slow tests, use:

```bash
pytest --durations=10  # Show slowest 10 tests
```

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Include both positive and negative test cases
3. Update this README if adding new test categories
4. Ensure all tests pass before merging

## Test Data

Sample test data is provided in fixtures. For complex scenarios, create additional fixtures in `conftest.py` or test-specific files.