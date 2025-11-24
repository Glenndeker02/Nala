# Fix admin routes requireRole signature
$files = Get-ChildItem -Path "app/api/admin" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # 1. Update imports
    if ($content -match 'import \{ ([^}]+) \} from "@/lib/api-middleware";') {
        if ($content -notmatch 'JWTPayload') {
            $content = $content -replace 'import \{ ([^}]+) \} from "@/lib/api-middleware";', 'import { $1, JWTPayload } from "@/lib/api-middleware";'
        }
    }

    # 2. Update requireRole signature
    $content = $content -replace "requireRole\('ADMIN', async \(req: NextRequest, context: any\) => \{", "requireRole('ADMIN', async (req: NextRequest, user: JWTPayload) => {"
    $content = $content -replace "requireRole\('ADMIN', async \(request: NextRequest, context: any\) => \{", "requireRole('ADMIN', async (request: NextRequest, user: JWTPayload) => {"
    
    # 3. Update context.user usage
    $content = $content -replace "const adminUser = context.user;", "const adminUser = user;"
    $content = $content -replace "adminId: context.user.userId", "adminId: user.userId"
    
    # 4. Update requireRole result call
    $content = $content -replace "\}\)\(request, \{ params \}\);", "})(request);"
    $content = $content -replace "\}\)\(req, \{ params \}\);", "})(req);"

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
    }
}

Write-Host "Done!"
