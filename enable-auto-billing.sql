-- Check current status of auto-generation for all entity profiles
SELECT 
    ep.id,
    ep.name,
    COALESCE(epp."autoGenerateBills", false) as auto_generate_enabled,
    COALESCE(epp."enableSmsNotifications", false) as sms_enabled,
    COUNT(ps.id) as active_properties
FROM entity_profile ep
LEFT JOIN entity_profile_preference epp ON ep.id = epp."entityProfileId"
LEFT JOIN property_subscription ps ON ps."entityProfileId" = ep.id 
    AND ps."isBillingActive" = true 
    AND ps."deletedAt" IS NULL
GROUP BY ep.id, ep.name, epp."autoGenerateBills", epp."enableSmsNotifications"
ORDER BY ep.name;

-- Enable auto-generation for all entity profiles (update existing records)
UPDATE entity_profile_preference
SET "autoGenerateBills" = true
WHERE "autoGenerateBills" = false;

-- Insert preferences for entity profiles that don't have them yet
INSERT INTO entity_profile_preference ("entityProfileId", "autoGenerateBills", "enableSmsNotifications", "enableEmailNotifications")
SELECT 
    ep.id,
    true,
    true,
    true
FROM entity_profile ep
LEFT JOIN entity_profile_preference epp ON ep.id = epp."entityProfileId"
WHERE epp."entityProfileId" IS NULL;

-- Verify the changes
SELECT 
    ep.id,
    ep.name,
    epp."autoGenerateBills" as auto_generate_enabled,
    epp."enableSmsNotifications" as sms_enabled,
    COUNT(ps.id) as active_properties
FROM entity_profile ep
LEFT JOIN entity_profile_preference epp ON ep.id = epp."entityProfileId"
LEFT JOIN property_subscription ps ON ps."entityProfileId" = ep.id 
    AND ps."isBillingActive" = true 
    AND ps."deletedAt" IS NULL
GROUP BY ep.id, ep.name, epp."autoGenerateBills", epp."enableSmsNotifications"
ORDER BY ep.name;
