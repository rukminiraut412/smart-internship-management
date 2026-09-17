cd "C:\Users\rukmi\OneDrive\Desktop\smart-internship-management\backend"

$path = ".\app\schemas.py"

$taskSchemas = @'

# ============================================================================
# TASK MANAGEMENT SCHEMAS
# ============================================================================

class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    internship_id: str
    student_id: str
    mentor_id: Optional[str] = None
    title: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Task title",
    )
    description: Optional[str] = None
    category: Optional[str] = Field(
        default="Development",
        max_length=100,
    )
    status: Optional[str] = Field(
        default="Pending",
        description="Pending, In Progress, or Completed",
    )
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
    )
    description: Optional[str] = None
    category: Optional[str] = Field(
        default=None,
        max_length=100,
    )
    status: Optional[str] = Field(
        default=None,
        description="Pending, In Progress, or Completed",
    )
    due_date: Optional[datetime] = None

'@

# Backup current schemas.py
Copy-Item $path "$path.backup" -Force

# Insert the missing schemas before the existing TaskCreateRequest
$content = Get-Content $path -Raw

if ($content -notmatch "class TaskCreate\(BaseModel\)") {
    $content = $content -replace `
        '(?=class TaskCreateRequest\(BaseModel\):)', `
        "$taskSchemas`r`n"
    Set-Content $path $content -Encoding UTF8
    Write-Host "TaskCreate and TaskUpdate added successfully."
} else {
    Write-Host "TaskCreate already exists. No changes made."
}
