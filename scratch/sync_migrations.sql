-- Ensure BOTH tables have the same history to avoid case-sensitivity confusion
CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

CREATE TABLE IF NOT EXISTS "__efmigrationshistory" (
    "migrationid" character varying(150) NOT NULL,
    "productversion" character varying(32) NOT NULL,
    CONSTRAINT "pk___efmigrationshistory" PRIMARY KEY ("migrationid")
);

-- Insert missing migrations (ignore duplicates)
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES 
('20260421121645_InitialCreate', '9.0.4'),
('20260421125307_AddTimestampIndex', '9.0.4'),
('20260426163530_AddUserPresenceFields', '9.0.4'),
('20260426181925_GlobalLowerCaseConvention', '9.0.4'),
('20260426201449_RenameLastSeenAtToLowercase', '9.0.4')
ON CONFLICT ("MigrationId") DO NOTHING;

INSERT INTO "__efmigrationshistory" ("migrationid", "productversion") VALUES 
('20260421121645_InitialCreate', '9.0.4'),
('20260421125307_AddTimestampIndex', '9.0.4'),
('20260426163530_AddUserPresenceFields', '9.0.4'),
('20260426181925_GlobalLowerCaseConvention', '9.0.4'),
('20260426201449_RenameLastSeenAtToLowercase', '9.0.4')
ON CONFLICT ("migrationid") DO NOTHING;
