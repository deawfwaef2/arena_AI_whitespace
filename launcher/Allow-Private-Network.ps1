# Optional, narrowly scoped firewall helper. Does not change network profiles or disable the firewall.
$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    $arguments = '-NoProfile -ExecutionPolicy Bypass -File "' + $PSCommandPath + '"'
    Start-Process -FilePath 'powershell.exe' -Verb RunAs -ArgumentList $arguments -Wait
    exit
}
try {
    $exe = Join-Path $PSScriptRoot 'Start-Last100.exe'
    if (-not (Test-Path -LiteralPath $exe -PathType Leaf)) { throw 'Extract the complete ZIP first. Start-Last100.exe was not found.' }
    $name = 'Last100 LAN - Private LocalSubnet Only'
    Get-NetFirewallRule -DisplayName $name -ErrorAction SilentlyContinue | Remove-NetFirewallRule
    New-NetFirewallRule -DisplayName $name -Direction Inbound -Action Allow -Program $exe -Protocol TCP -LocalPort '8765-8775' -Profile Private -RemoteAddress LocalSubnet | Out-Null
    Write-Host 'Done. Only this game, TCP 8765-8775, Private profile, LocalSubnet.' -ForegroundColor Green
    Write-Host 'The firewall stays enabled. No Public-network rule was added.'
    Write-Host 'To remove: Windows Defender Firewall > Advanced settings > Inbound rules > Last100 LAN - Private LocalSubnet Only.'
} catch { Write-Host $_.Exception.Message -ForegroundColor Red }
Read-Host 'Press Enter to close'
