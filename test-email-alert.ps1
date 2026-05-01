# Test Email Alert Feature
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZjUwNGMwNTU2NzcyYzkwZGUzYWYyNSIsImlhdCI6MTc3NzY2NTI1NywiZXhwIjoxNzc4MjcwMDU3fQ.EC5wFnJZY5ATyBmF3x477N98yrTfYkzPpZzlwjAQKw4"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$futureDate = (Get-Date).AddDays(7).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")

$body = @{
    "title" = "Test Email Alert Task"
    "description" = "This is a test task to verify email alerts are working properly with task creation"
    "category" = "General"
    "expiryDate" = $futureDate
    "emailAlert" = "true"
    "emailRecipients" = @("admin@test.com", "testuser@example.com")
    "status" = "active"
} | ConvertTo-Json

Write-Host "Creating task with email alerts..." -ForegroundColor Green
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/notices" -Method POST -Body $body -Headers $headers -UseBasicParsing

$result = $response.Content | ConvertFrom-Json
Write-Host "Success: $($result.success)"
Write-Host "Message: $($result.message)"
Write-Host ""
Write-Host "Task Details:"
$result.data | ConvertTo-Json
