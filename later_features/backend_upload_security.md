# Future Security Enhancements

## Involving the Backend in Avatar Uploads
Currently, we are using a direct client-to-cloud upload (e.g., to Cloudinary) for performance and scaling. 

**Question to consider later:**
Should we involve the ASP.NET Core backend in the upload process (e.g., via a proxy or signed URL generator) to implement extra security logging, audit trails, and stricter file validation?

**Status:** Deferred to Phase 3+
