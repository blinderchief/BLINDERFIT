#!/usr/bin/env python3
"""
Test runner script for Blinderfit Backend
"""

import subprocess
import sys
import os
from pathlib import Path

def run_tests(test_type="all", verbose=False, coverage=False):
    """Run the test suite with specified options."""

    # Get the backend directory
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)

    # Base pytest command
    cmd = ["python", "-m", "pytest"]

    if test_type == "unit":
        cmd.extend(["-m", "unit"])
    elif test_type == "integration":
        cmd.extend(["-m", "integration"])
    elif test_type == "auth":
        cmd.extend(["-m", "auth"])
    elif test_type == "api":
        cmd.extend(["-m", "api"])
    elif test_type == "service":
        cmd.extend(["-m", "service"])

    if verbose:
        cmd.append("-v")

    if coverage:
        cmd.extend([
            "--cov=app",
            "--cov-report=html",
            "--cov-report=term-missing",
            "--cov-fail-under=80"
        ])

    # Add test directory
    cmd.append("tests/")

    print(f"Running command: {' '.join(cmd)}")
    print(f"Working directory: {os.getcwd()}")

    try:
        result = subprocess.run(cmd, check=True)
        print("✅ All tests passed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Tests failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print("❌ pytest not found. Please install it with: pip install pytest pytest-asyncio")
        return False

def run_specific_test(test_file):
    """Run a specific test file."""
    backend_dir = Path(__file__).parent / "backend"
    os.chdir(backend_dir)

    cmd = ["python", "-m", "pytest", f"tests/{test_file}", "-v"]

    try:
        result = subprocess.run(cmd, check=True)
        print(f"✅ Test {test_file} passed!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Test {test_file} failed with exit code {e.returncode}")
        return False

def main():
    """Main function to handle command line arguments."""
    if len(sys.argv) < 2:
        print("Usage: python test_runner.py [command] [options]")
        print("\nCommands:")
        print("  all          - Run all tests")
        print("  unit         - Run unit tests only")
        print("  integration  - Run integration tests only")
        print("  auth         - Run authentication tests only")
        print("  api          - Run API tests only")
        print("  service      - Run service tests only")
        print("  specific     - Run specific test file")
        print("\nOptions:")
        print("  --verbose    - Verbose output")
        print("  --coverage   - Generate coverage report")
        print("\nExamples:")
        print("  python test_runner.py all --verbose")
        print("  python test_runner.py unit --coverage")
        print("  python test_runner.py specific test_auth.py")
        return

    command = sys.argv[1]
    verbose = "--verbose" in sys.argv
    coverage = "--coverage" in sys.argv

    if command == "specific":
        if len(sys.argv) < 3:
            print("Please specify a test file: python test_runner.py specific <test_file>")
            return
        test_file = sys.argv[2]
        success = run_specific_test(test_file)
    else:
        success = run_tests(command, verbose, coverage)

    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()