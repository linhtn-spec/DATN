#!/bin/bash

echo "=== Environment Variables Validation ==="
echo ""

# Check backend .env
echo "✓ Checking server-shop/.env..."
required_backend_vars=(
    "SERVER_PORT"
    "FRONTEND_URL"
    "SESSION_SECRET"
    "ACCESS_TOKEN_SECRET"
    "ELASTICSEARCH_HOST"
    "NODEMAILER_EMAIL"
)

missing_backend=0
for var in "${required_backend_vars[@]}"; do
    if ! grep -q "^$var=" server-shop/.env; then
        echo "  ✗ Missing: $var"
        ((missing_backend++))
    else
        echo "  ✓ Found: $var"
    fi
done

echo ""
echo "✓ Checking frontend/.env..."
required_frontend_vars=(
    "VITE_API_BASE_URL"
    "VITE_SOCKET_ENDPOINT"
    "VITE_ENV"
)

missing_frontend=0
for var in "${required_frontend_vars[@]}"; do
    if ! grep -q "^$var=" frontend/.env; then
        echo "  ✗ Missing: $var"
        ((missing_frontend++))
    else
        echo "  ✓ Found: $var"
    fi
done

echo ""
echo "=== Code Hardcoding Check ==="
echo ""

# Check for hardcoded localhost/URLs in code
echo "✓ Scanning for hardcoded URLs..."
hardcoded_urls=$(grep -r "localhost:5173" server-shop/ --include="*.js" 2>/dev/null | grep -v ".env" | wc -l)
hardcoded_es=$(grep -r "NoiLk3W" server-shop/ --include="*.js" 2>/dev/null | wc -l)
hardcoded_secret=$(grep -r '"SECRET"' server-shop/app.js 2>/dev/null | wc -l)

if [ "$hardcoded_urls" -eq 0 ]; then
    echo "  ✓ No hardcoded localhost:5173 found in code"
else
    echo "  ✗ Found $hardcoded_urls instances of hardcoded localhost:5173"
fi

if [ "$hardcoded_es" -eq 0 ]; then
    echo "  ✓ No ES password hardcoding found"
else
    echo "  ✗ Found $hardcoded_es instances of ES password"
fi

if [ "$hardcoded_secret" -eq 0 ]; then
    echo "  ✓ No SECRET hardcoding found in app.js"
else
    echo "  ✗ Found SECRET hardcoding in app.js"
fi

echo ""
echo "=== Summary ==="
if [ $missing_backend -eq 0 ] && [ $missing_frontend -eq 0 ] && [ "$hardcoded_urls" -eq 0 ]; then
    echo "✅ All checks passed!"
    exit 0
else
    echo "❌ Some checks failed. Please review .env files."
    exit 1
fi
