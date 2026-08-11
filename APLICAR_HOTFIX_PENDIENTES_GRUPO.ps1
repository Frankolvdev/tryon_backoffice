$ErrorActionPreference = "Stop"

$target = Join-Path (Get-Location) "src\app\dashboard\tools-generation\body-proportions\page.tsx"

if (!(Test-Path $target)) {
    throw "No se encontro $target. Ejecuta este script desde la raiz del BackOffice."
}

$content = Get-Content $target -Raw -Encoding UTF8

$old = 'generateList(rows.filter(x => x.status !== "ready"))'
$new = 'generateList(rows.filter(x => x.status === "draft"))'

$count = ([regex]::Matches($content, [regex]::Escape($old))).Count

if ($count -ne 1) {
    throw "Blindaje: se esperaba encontrar exactamente 1 expresion de pendientes y se encontraron $count. No se modifico ningun archivo."
}

$content = $content.Replace($old, $new)

Set-Content -Path $target -Value $content -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "HOTFIX aplicado correctamente." -ForegroundColor Green
Write-Host "Generar pendientes del grupo ahora procesa SOLO status=draft." -ForegroundColor Green
Write-Host "ready, generating y error se saltan automaticamente." -ForegroundColor Green
