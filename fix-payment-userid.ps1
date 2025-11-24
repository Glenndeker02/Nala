# Fix all userId to recipientId in Payment creations
$files = Get-ChildItem -Path "app/api/admin" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'userId:', 'recipientId:'
    
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done!"
