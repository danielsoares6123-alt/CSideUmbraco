$objects = git rev-list --objects --all
$result = foreach ($obj in $objects) {
    if ([string]::IsNullOrWhiteSpace($obj)) { continue }
    $parts = $obj -split ' ', 2
    $sha = $parts[0]
    $name = if ($parts.Length -gt 1) { $parts[1] } else { "" }
    
    # Only get size for blobs (files), not trees or commits (which are small)
    $type = git cat-file -t $sha
    if ($type -eq 'blob') {
        $sizeStr = git cat-file -s $sha
        if ([int]::TryParse($sizeStr, [ref]$null)) {
            $sizeMB = [math]::Round([int]$sizeStr / 1MB, 2)
            [PSCustomObject]@{
                SHA = $sha
                SizeMB = $sizeMB
                Name = $name
            }
        }
    }
}
$result | Sort-Object SizeMB -Descending | Select-Object -First 10 | Format-Table -AutoSize
