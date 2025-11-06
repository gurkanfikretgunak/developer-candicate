# Supabase Storage Setup for CV Files

## Step 1: Create Storage Bucket

1. Go to Supabase Dashboard → **Storage**
2. Click **"New bucket"**
3. Bucket configuration:
   - **Name**: `candidate-cvs`
   - **Public**: OFF (Private bucket)
   - Click **"Create bucket"**

## Step 2: Add Storage Policies

After creating the bucket, add these policies:

### Policy 1: Upload CVs
- **Policy name**: Users can upload CVs
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **Policy definition**:

```sql
bucket_id = 'candidate-cvs' AND
auth.uid() IN (
  SELECT id FROM user_profiles
  WHERE organization_id IS NOT NULL
)
```

### Policy 2: View CVs
- **Policy name**: Users can view organization CVs
- **Allowed operation**: SELECT
- **Target roles**: authenticated
- **Policy definition**:

```sql
bucket_id = 'candidate-cvs' AND
auth.uid() IN (
  SELECT id FROM user_profiles
  WHERE organization_id IS NOT NULL
)
```

### Policy 3: Delete CVs
- **Policy name**: Users can delete organization CVs
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **Policy definition**:

```sql
bucket_id = 'candidate-cvs' AND
auth.uid() IN (
  SELECT id FROM user_profiles
  WHERE organization_id IS NOT NULL
)
```

## Alternative: Simple Public Policy (Development Only)

For quick testing, you can make the bucket public:

1. Go to bucket settings
2. Toggle **"Public bucket"** to ON
3. **Warning**: Not recommended for production!

## File Upload Guidelines

### Accepted File Types:
- PDF (.pdf)
- Word (.doc, .docx)

### Max File Size:
- Default: 50MB
- Can be adjusted in bucket settings

### File Naming Convention:
```
{candidate-id}/{timestamp}_{original-filename}
```

Example: `550e8400-e29b-41d4-a716-446655440000/1699999999_john_doe_cv.pdf`

## Using Storage in Code

The frontend is already prepared for CV upload. Once storage is configured:

1. Files will be uploaded to Supabase Storage
2. URL will be saved in `candidates.cv_file_url`
3. Original filename saved in `candidates.cv_file_name`
4. Users can download CVs from candidate view

## Verification

Test storage is working:

```sql
-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'candidate-cvs';

-- Check policies
SELECT * FROM storage.policies WHERE bucket_id = 'candidate-cvs';
```

---

**Note**: Storage policies cannot be created via SQL migrations due to permissions.  
They must be created through the Supabase Dashboard UI.

