$month = 5
$year = 2026
$daysInMonth = 31

# Get all unstaged files
$files = git ls-files --others --exclude-standard | Get-Random -Count 9999

if ($files.Count -eq 0) {
    Write-Host "No files found to commit."
    exit
}

# Distribute files to days.
# We will create an array of "commits"
$commitMessages = @(
    "Update project structure",
    "Add new features",
    "Refactor code for performance",
    "Fix minor bugs",
    "Update configuration files",
    "Improve UI/UX components",
    "Add backend routes",
    "Update database schemas",
    "Add authentication logic",
    "Fix linting issues"
)

$fileIndex = 0

for ($day = 1; $day -le $daysInMonth; $day++) {
    # Generate 1 to 3 commits per day
    $numCommits = Get-Random -Minimum 1 -Maximum 4
    
    for ($c = 0; $c -lt $numCommits; $c++) {
        # Determine how many files to include in this commit.
        # We need to make sure we don't run out of files before the end of the month,
        # but also consume all files by the end.
        
        # We have remaining days: $daysInMonth - $day + 1
        # It's easier if we just commit 1 file per commit, and on the last commit of the month, we commit everything remaining.
        
        if ($fileIndex -lt $files.Count) {
            # Pick 1 to 2 files per commit
            $filesToCommit = Get-Random -Minimum 1 -Maximum 3
            
            # If it's the very last day and last commit, take all remaining files
            if ($day -eq $daysInMonth -and $c -eq ($numCommits - 1)) {
                $filesToCommit = $files.Count - $fileIndex
            }
            
            $filesForThisCommit = @()
            for ($f = 0; $f -lt $filesToCommit; $f++) {
                if ($fileIndex -lt $files.Count) {
                    $filesForThisCommit += $files[$fileIndex]
                    $fileIndex++
                }
            }
            
            if ($filesForThisCommit.Count -gt 0) {
                foreach ($f in $filesForThisCommit) {
                    git add $f
                }
                
                $hour = Get-Random -Minimum 9 -Maximum 23
                $minute = Get-Random -Minimum 0 -Maximum 59
                $second = Get-Random -Minimum 0 -Maximum 59
                
                $dateStr = "{0}-{1:D2}-{2:D2}T{3:D2}:{4:D2}:{5:D2}" -f $year, $month, $day, $hour, $minute, $second
                
                $env:GIT_AUTHOR_DATE = $dateStr
                $env:GIT_COMMITTER_DATE = $dateStr
                
                $msg = $commitMessages | Get-Random
                git commit -m $msg
            }
        }
    }
}

# In case there are any remaining files (e.g. if we ran out of random allocation before the end),
# let's just make one final commit on May 31st with all remaining files.
if ($fileIndex -lt $files.Count) {
    Write-Host "Committing remaining files..."
    while ($fileIndex -lt $files.Count) {
        git add $files[$fileIndex]
        $fileIndex++
    }
    $dateStr = "{0}-{1:D2}-31T23:59:59" -f $year, $month
    $env:GIT_AUTHOR_DATE = $dateStr
    $env:GIT_COMMITTER_DATE = $dateStr
    $msg = "Finalize project setup"
    git commit -m $msg
}

Remove-Item Env:\GIT_AUTHOR_DATE
Remove-Item Env:\GIT_COMMITTER_DATE

Write-Host "Commits generated successfully!"
