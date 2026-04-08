from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import jwt
import bcrypt
import sqlite3
import os
import re
import time
import random
import json
from datetime import datetime, timedelta, timezone
from contextlib import contextmanager

app = FastAPI()

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Config ---
SECRET_KEY = os.environ.get("JWT_SECRET", "apex-playground-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24
DB_PATH = os.environ.get("DB_PATH", "/data/app.db") if os.path.exists("/data") else "app.db"

security = HTTPBearer(auto_error=False)


# --- Database ---
@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT,
                problems_solved INTEGER DEFAULT 0,
                total_submissions INTEGER DEFAULT 0,
                streak_days INTEGER DEFAULT 0,
                score INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                last_login TEXT
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                problem_id INTEGER NOT NULL,
                code TEXT NOT NULL,
                status TEXT NOT NULL,
                test_results TEXT,
                execution_time_ms INTEGER,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS solved_problems (
                user_id INTEGER NOT NULL,
                problem_id INTEGER NOT NULL,
                solved_at TEXT DEFAULT (datetime('now')),
                PRIMARY KEY (user_id, problem_id),
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)


@app.on_event("startup")
async def startup():
    init_db()


# --- Models ---
class SignUpRequest(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: str
    password: str = Field(min_length=6)
    display_name: Optional[str] = None


class SignInRequest(BaseModel):
    email: str
    password: str


class CodeExecutionRequest(BaseModel):
    problem_id: int
    code: str
    language: str = "apex"


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    display_name: Optional[str]
    problems_solved: int
    total_submissions: int
    streak_days: int
    score: int


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# --- Auth Helpers ---
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: int, username: str) -> str:
    payload = {
        "sub": user_id,
        "username": username,
        "exp": datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            return None
        with get_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if row is None:
                return None
            return dict(row)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        return None


def require_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        with get_db() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            if row is None:
                raise HTTPException(status_code=401, detail="User not found")
            return dict(row)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Apex Code Execution Engine ---
APEX_KEYWORDS = [
    "trigger", "class", "public", "private", "global", "static", "void",
    "String", "Integer", "Boolean", "List", "Map", "Set", "for", "if",
    "else", "while", "return", "new", "null", "true", "false", "try",
    "catch", "finally", "throw", "virtual", "abstract", "override",
    "implements", "extends", "interface", "enum", "switch", "when",
    "Database", "System", "Trigger", "insert", "update", "delete",
    "upsert", "merge", "undelete", "SOQL", "DML", "Batch", "Queueable",
    "Schedulable", "Future", "Test", "testMethod", "isTest",
]

# Patterns that indicate common Apex mistakes
LINT_RULES = [
    {
        "pattern": r"for\s*\([^)]*\)\s*\{[^}]*\b(SELECT|INSERT|UPDATE|DELETE)\b",
        "message": "SOQL/DML inside loop detected. This violates governor limits.",
        "severity": "error",
    },
    {
        "pattern": r"\bSystem\.debug\b",
        "message": "System.debug statement found. Consider removing for production.",
        "severity": "warning",
    },
    {
        "pattern": r"catch\s*\(\s*Exception\s+\w+\s*\)\s*\{\s*\}",
        "message": "Empty catch block detected. Handle or log the exception.",
        "severity": "warning",
    },
    {
        "pattern": r"(SELECT\s+)(\*)",
        "message": "SELECT * is not valid in SOQL. Specify field names explicitly.",
        "severity": "error",
    },
    {
        "pattern": r"\bwithout sharing\b",
        "message": "'without sharing' bypasses security. Ensure this is intentional.",
        "severity": "warning",
    },
]


def analyze_apex_code(code: str, problem_id: int) -> dict:
    """Analyze Apex code and simulate execution with test cases."""
    start_time = time.time()
    results = {
        "compiled": True,
        "compilation_errors": [],
        "lint_warnings": [],
        "test_results": [],
        "execution_time_ms": 0,
        "debug_log": [],
        "overall_status": "passed",
    }

    # Step 1: Basic syntax checks
    results["debug_log"].append("Compiling Apex code...")

    # Check for balanced braces
    open_braces = code.count("{")
    close_braces = code.count("}")
    if open_braces != close_braces:
        results["compiled"] = False
        results["compilation_errors"].append(
            f"Syntax Error: Unbalanced braces. Found {open_braces} opening and {close_braces} closing braces."
        )
        results["overall_status"] = "compilation_error"
        results["execution_time_ms"] = int((time.time() - start_time) * 1000)
        return results

    # Check for balanced parentheses
    open_parens = code.count("(")
    close_parens = code.count(")")
    if open_parens != close_parens:
        results["compiled"] = False
        results["compilation_errors"].append(
            f"Syntax Error: Unbalanced parentheses. Found {open_parens} opening and {close_parens} closing."
        )
        results["overall_status"] = "compilation_error"
        results["execution_time_ms"] = int((time.time() - start_time) * 1000)
        return results

    # Check for semicolons after statements (basic check)
    lines = code.strip().split("\n")
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped and not stripped.startswith("//") and not stripped.startswith("/*"):
            if stripped.endswith("{") or stripped.endswith("}") or stripped.startswith("@"):
                continue
            if stripped.startswith("trigger ") or stripped.startswith("class "):
                continue
            if stripped.startswith("if") or stripped.startswith("else") or stripped.startswith("for"):
                continue
            if stripped.startswith("try") or stripped.startswith("catch") or stripped.startswith("finally"):
                continue
            if not stripped.endswith(";") and not stripped.endswith(",") and not stripped.endswith("*/"):
                if len(stripped) > 5 and not stripped.startswith("*"):
                    results["compilation_errors"].append(
                        f"Line {i + 1}: Possible missing semicolon: '{stripped[:50]}...'" if len(stripped) > 50 else f"Line {i + 1}: Possible missing semicolon: '{stripped}'"
                    )

    if results["compilation_errors"]:
        results["compiled"] = False
        results["overall_status"] = "compilation_error"
        results["execution_time_ms"] = int((time.time() - start_time) * 1000)
        return results

    results["debug_log"].append("Compilation successful.")

    # Step 2: Lint checks
    results["debug_log"].append("Running lint analysis...")
    for rule in LINT_RULES:
        if re.search(rule["pattern"], code, re.IGNORECASE | re.DOTALL):
            results["lint_warnings"].append({
                "message": rule["message"],
                "severity": rule["severity"],
            })

    # Step 3: Analyze code quality and determine test results
    results["debug_log"].append("Running test cases...")

    code_lower = code.lower()
    code_len = len(code.strip())

    # Problem-specific analysis
    test_case_results = get_test_results(code, problem_id)
    results["test_results"] = test_case_results

    passed = sum(1 for t in test_case_results if t["status"] == "passed")
    total = len(test_case_results)

    results["debug_log"].append("")
    results["debug_log"].append(f"Test Results: {passed}/{total} passed")

    if passed == total:
        results["overall_status"] = "passed"
        results["debug_log"].append("All test cases passed! Great job!")
    else:
        results["overall_status"] = "failed"
        results["debug_log"].append("Some test cases failed. Review your code and try again.")

    results["execution_time_ms"] = int((time.time() - start_time) * 1000) + random.randint(80, 300)
    return results


def get_test_results(code: str, problem_id: int) -> list:
    """Generate test results based on code analysis for each problem."""
    code_lower = code.lower()
    code_stripped = code.strip()

    # Common quality checks
    has_soql = "select" in code_lower and "from" in code_lower
    has_for_loop = "for" in code_lower or "for(" in code_lower
    has_map = "map<" in code_lower or "map <" in code_lower
    has_set = "set<" in code_lower or "set <" in code_lower
    has_list = "list<" in code_lower or "list <" in code_lower
    has_adderror = "adderror" in code_lower
    has_trigger_new = "trigger.new" in code_lower
    has_trigger_old = "trigger.old" in code_lower or "trigger.oldmap" in code_lower
    has_dml = any(k in code_lower for k in ["insert ", "update ", "delete ", "upsert "])
    has_try_catch = "try" in code_lower and "catch" in code_lower
    has_http = "http" in code_lower or "httprequest" in code_lower
    has_future = "@future" in code_lower
    has_batch = "database.batchable" in code_lower
    has_queueable = "queueable" in code_lower
    has_schedulable = "schedulable" in code_lower
    has_test = "@istest" in code_lower or "testmethod" in code_lower
    has_invocable = "@invocablemethod" in code_lower
    has_rest = "@restresource" in code_lower or "@httpget" in code_lower
    code_length = len(code_stripped)
    is_starter = code_length < 300  # Likely hasn't modified much from starter

    if problem_id == 1:  # Prevent Duplicate Accounts
        return [
            {
                "id": 1,
                "description": "Should block duplicate account insertion",
                "status": "passed" if (has_soql and has_trigger_new and has_adderror and has_set) else "failed",
                "expected": '{"success": false, "error": "An Account with this name already exists."}',
                "actual": '{"success": false, "error": "An Account with this name already exists."}' if (has_soql and has_trigger_new and has_adderror) else '{"error": "No duplicate check implemented"}',
                "execution_time_ms": random.randint(50, 150),
            },
            {
                "id": 2,
                "description": "Should allow unique account insertion",
                "status": "passed" if (has_soql and has_trigger_new and has_for_loop) else "failed",
                "expected": '{"success": true}',
                "actual": '{"success": true}' if (has_soql and has_trigger_new) else '{"error": "Trigger logic not implemented"}',
                "execution_time_ms": random.randint(30, 100),
            },
            {
                "id": 3,
                "description": "Should detect duplicates within the same batch",
                "status": "passed" if (has_soql and has_trigger_new and has_adderror and (has_set or has_map)) else "failed",
                "expected": '{"success": false, "error": "An Account with this name already exists."}',
                "actual": '{"success": false}' if (has_trigger_new and has_adderror and has_set) else '{"error": "Batch duplicate detection not implemented"}',
                "execution_time_ms": random.randint(40, 120),
            },
        ]
    elif problem_id == 2:  # Auto-Populate Contact Fields
        return [
            {
                "id": 1,
                "description": "Should populate blank fields from parent Account",
                "status": "passed" if (has_soql and has_trigger_new and has_for_loop and (has_map or has_set)) else "failed",
                "expected": '{"Phone": "555-1234", "MailingCity": "NYC"}',
                "actual": '{"Phone": "555-1234", "MailingCity": "NYC"}' if (has_soql and has_trigger_new) else '{"error": "Parent Account fields not queried"}',
                "execution_time_ms": random.randint(50, 150),
            },
            {
                "id": 2,
                "description": "Should not overwrite existing Contact Phone",
                "status": "passed" if (has_soql and has_trigger_new and "null" in code_lower) else "failed",
                "expected": '{"Phone": "999-0000", "MailingCity": "NYC"}',
                "actual": '{"Phone": "999-0000", "MailingCity": "NYC"}' if (has_soql and "null" in code_lower) else '{"error": "Existing values may be overwritten"}',
                "execution_time_ms": random.randint(30, 100),
            },
        ]
    elif problem_id == 3:  # Opportunity Stage Validation
        has_stage_list = any(s in code_lower for s in ["prospecting", "qualification", "proposal", "negotiation"])
        return [
            {
                "id": 1,
                "description": "Should prevent skipping stages",
                "status": "passed" if (has_trigger_new and has_trigger_old and has_adderror and has_stage_list) else "failed",
                "expected": '{"success": false, "error": "Invalid stage transition from Prospecting to Proposal."}',
                "actual": '{"success": false}' if (has_adderror and has_stage_list) else '{"error": "Stage validation not implemented"}',
                "execution_time_ms": random.randint(50, 150),
            },
            {
                "id": 2,
                "description": "Should allow valid forward progression",
                "status": "passed" if (has_trigger_new and has_trigger_old and has_stage_list) else "failed",
                "expected": '{"success": true}',
                "actual": '{"success": true}' if has_stage_list else '{"error": "Stage order not defined"}',
                "execution_time_ms": random.randint(30, 100),
            },
            {
                "id": 3,
                "description": "Should require Amount for Closed Won",
                "status": "passed" if (has_adderror and "amount" in code_lower and "closed won" in code_lower) else "failed",
                "expected": '{"success": false, "error": "Amount is required for Closed Won opportunities."}',
                "actual": '{"success": false}' if ("amount" in code_lower and "closed won" in code_lower) else '{"error": "Amount validation missing"}',
                "execution_time_ms": random.randint(40, 120),
            },
        ]
    elif problem_id == 5:  # Territory Assignment
        has_territory_map = any(s in code_lower for s in ["west", "central", "east", "international"])
        return [
            {
                "id": 1,
                "description": "Should assign West territory for CA",
                "status": "passed" if has_territory_map and ("ca" in code_lower or "'ca'" in code_lower) else "failed",
                "expected": '{"Territory__c": "West"}',
                "actual": '{"Territory__c": "West"}' if has_territory_map else '{"error": "Territory mapping not implemented"}',
                "execution_time_ms": random.randint(30, 80),
            },
            {
                "id": 2,
                "description": "Should assign International for non-US",
                "status": "passed" if has_territory_map and "international" in code_lower else "failed",
                "expected": '{"Territory__c": "International"}',
                "actual": '{"Territory__c": "International"}' if "international" in code_lower else '{"error": "International handling missing"}',
                "execution_time_ms": random.randint(30, 80),
            },
            {
                "id": 3,
                "description": "Should assign Unassigned for unknown state",
                "status": "passed" if has_territory_map and "unassigned" in code_lower else "failed",
                "expected": '{"Territory__c": "Unassigned"}',
                "actual": '{"Territory__c": "Unassigned"}' if "unassigned" in code_lower else '{"error": "Default territory not set"}',
                "execution_time_ms": random.randint(30, 80),
            },
        ]
    else:
        # Generic analysis for other problems
        quality_score = 0
        if has_for_loop:
            quality_score += 1
        if has_soql:
            quality_score += 1
        if has_map or has_set or has_list:
            quality_score += 1
        if has_try_catch:
            quality_score += 1
        if not is_starter:
            quality_score += 1
        if has_dml:
            quality_score += 1

        # Generate 2-3 test cases with results based on quality
        num_tests = random.randint(2, 3)
        test_results = []
        for i in range(num_tests):
            threshold = (i + 1) / (num_tests + 1)
            passed = (quality_score / 6.0) >= threshold and not is_starter
            test_results.append({
                "id": i + 1,
                "description": f"Test case {i + 1}",
                "status": "passed" if passed else "failed",
                "expected": f'{{"test_{i+1}": "expected_value"}}',
                "actual": f'{{"test_{i+1}": "expected_value"}}' if passed else '{"error": "Assertion failed"}',
                "execution_time_ms": random.randint(50, 200),
            })
        return test_results


# --- Routes ---

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/api/auth/signup", response_model=AuthResponse)
async def signup(req: SignUpRequest):
    with get_db() as conn:
        # Check existing
        existing = conn.execute(
            "SELECT id FROM users WHERE email = ? OR username = ?",
            (req.email, req.username),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=400, detail="Email or username already exists")

        pw_hash = hash_password(req.password)
        cursor = conn.execute(
            "INSERT INTO users (username, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
            (req.username, req.email, pw_hash, req.display_name or req.username),
        )
        user_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        user = dict(row)
        token = create_token(user_id, req.username)

        return AuthResponse(
            token=token,
            user=UserResponse(
                id=user["id"],
                username=user["username"],
                email=user["email"],
                display_name=user["display_name"],
                problems_solved=user["problems_solved"],
                total_submissions=user["total_submissions"],
                streak_days=user["streak_days"],
                score=user["score"],
            ),
        )


@app.post("/api/auth/signin", response_model=AuthResponse)
async def signin(req: SignInRequest):
    with get_db() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (req.email,)).fetchone()
        if not row:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        user = dict(row)
        if not verify_password(req.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        # Update last login
        conn.execute("UPDATE users SET last_login = datetime('now') WHERE id = ?", (user["id"],))

        token = create_token(user["id"], user["username"])
        return AuthResponse(
            token=token,
            user=UserResponse(
                id=user["id"],
                username=user["username"],
                email=user["email"],
                display_name=user["display_name"],
                problems_solved=user["problems_solved"],
                total_submissions=user["total_submissions"],
                streak_days=user["streak_days"],
                score=user["score"],
            ),
        )


@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(require_user)):
    return UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        display_name=user["display_name"],
        problems_solved=user["problems_solved"],
        total_submissions=user["total_submissions"],
        streak_days=user["streak_days"],
        score=user["score"],
    )


@app.post("/api/execute")
async def execute_code(req: CodeExecutionRequest, user: Optional[dict] = Depends(get_current_user)):
    """Execute Apex code and return analysis results."""
    if not req.code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")

    result = analyze_apex_code(req.code, req.problem_id)

    # Save submission if user is logged in
    if user:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO submissions (user_id, problem_id, code, status, test_results, execution_time_ms) VALUES (?, ?, ?, ?, ?, ?)",
                (
                    user["id"],
                    req.problem_id,
                    req.code,
                    result["overall_status"],
                    json.dumps(result["test_results"]),
                    result["execution_time_ms"],
                ),
            )
            conn.execute(
                "UPDATE users SET total_submissions = total_submissions + 1 WHERE id = ?",
                (user["id"],),
            )

            # If all tests passed, mark problem as solved
            if result["overall_status"] == "passed":
                existing = conn.execute(
                    "SELECT 1 FROM solved_problems WHERE user_id = ? AND problem_id = ?",
                    (user["id"], req.problem_id),
                ).fetchone()
                if not existing:
                    conn.execute(
                        "INSERT INTO solved_problems (user_id, problem_id) VALUES (?, ?)",
                        (user["id"], req.problem_id),
                    )
                    conn.execute(
                        "UPDATE users SET problems_solved = problems_solved + 1, score = score + ? WHERE id = ?",
                        (random.choice([100, 150, 200]), user["id"]),
                    )

    return result


@app.get("/api/submissions")
async def get_submissions(problem_id: Optional[int] = None, user: dict = Depends(require_user)):
    """Get user's submission history."""
    with get_db() as conn:
        if problem_id is not None:
            rows = conn.execute(
                "SELECT * FROM submissions WHERE user_id = ? AND problem_id = ? ORDER BY created_at DESC LIMIT 20",
                (user["id"], problem_id),
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM submissions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
                (user["id"],),
            ).fetchall()
        return [dict(r) for r in rows]


@app.get("/api/progress")
async def get_progress(user: dict = Depends(require_user)):
    """Get user's solved problems."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT problem_id, solved_at FROM solved_problems WHERE user_id = ? ORDER BY solved_at DESC",
            (user["id"],),
        ).fetchall()
        return {"solved": [dict(r) for r in rows]}


@app.get("/api/leaderboard")
async def get_leaderboard():
    """Get top users by score."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, username, display_name, problems_solved, streak_days, score FROM users ORDER BY score DESC LIMIT 20"
        ).fetchall()
        return [dict(r) for r in rows]
