$files = @(
    "app/api/admin/founders/[id]/suspend/route.ts",
    "app/api/admin/founders/[id]/route.ts",
    "app/api/admin/founders/[id]/force-refund/route.ts",
    "app/api/admin/founders/[id]/ban/route.ts",
    "app/api/admin/disputes/[id]/route.ts",
    "app/api/admin/disputes/[id]/resolve/route.ts",
    "app/api/admin/disputes/[id]/message/route.ts",
    "app/api/admin/creators/[id]/force-payout/route.ts",
    "app/api/admin/creators/[id]/verify-kyc/route.ts",
    "app/api/admin/creators/[id]/route.ts",
    "app/api/admin/creators/[id]/suspend/route.ts",
    "app/api/admin/creators/[id]/ban/route.ts",
    "app/api/admin/campaigns/[id]/route.ts",
    "app/api/admin/creators/[id]/adjust-earnings/route.ts",
    "app/api/admin/founders/route.ts",
    "app/api/admin/disputes/route.ts",
    "app/api/admin/dashboard/overview/route.ts",
    "app/api/admin/creators/route.ts",
    "app/api/admin/campaigns/route.ts",
    "app/api/admin/broadcasts/route.ts",
    "app/api/admin/audit-logs/route.ts",
    "app/api/admin/users/route.ts"
)

foreach ($file in $files) {
    $fullPath = Join-Path (Get-Location) $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        $content = $content -replace 'import \{ ApiResponse \} from "@/lib/api-response";', 'import { ApiResponse } from "@/lib/api-middleware";'
        $content = $content -replace 'import \{ requireRole \} from "@/lib/auth-middleware";', 'import { requireRole } from "@/lib/api-middleware";'
        Set-Content -Path $fullPath -Value $content -NoNewline
        Write-Host "Fixed: $file"
    }
}
