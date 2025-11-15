#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Script to generate SQL seed file for location data
 * Reads the TypeScript data file and generates SQL INSERT statements
 */

function escapeSqlString(str) {
  if (!str) return "NULL";
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeJsonb(obj) {
  if (!obj) return "NULL";
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

async function main() {
  const root = path.join(__dirname, "..");
  const dataFile = path.join(root, "danh-sach-3321-xa-phuong_v2.ts");
  const outputFile = path.join(
    root,
    "server/db/migrations/0101_seed_location_data.sql"
  );

  console.log("Reading data file...");
  const fileContent = fs.readFileSync(dataFile, "utf8");

  // Extract allRecords array - find the start and end
  const startMarker = "export const allRecords: AdministrativeUnitRecord[] =";
  const startIndex = fileContent.indexOf(startMarker);
  if (startIndex === -1) {
    throw new Error("Could not find allRecords export in data file");
  }

  // Find the opening bracket after the export statement
  const arrayStart = fileContent.indexOf("[", startIndex);
  if (arrayStart === -1) {
    throw new Error("Could not find array start bracket");
  }

  // Find the closing bracket before "as const" or ";"
  // Look for the pattern: ]\nas const; or ]\n;
  const asConstIndex = fileContent.indexOf("as const;", arrayStart);
  const semicolonAfterBracket = fileContent.indexOf("];", arrayStart);

  let arrayEnd;
  if (asConstIndex !== -1) {
    // Find the ] before "as const"
    arrayEnd = fileContent.lastIndexOf("]", asConstIndex);
  } else if (semicolonAfterBracket !== -1) {
    arrayEnd = semicolonAfterBracket + 1; // Include the ]
  } else {
    throw new Error("Could not find array end bracket");
  }

  // Extract the array content
  const arrayContent = fileContent.substring(arrayStart, arrayEnd + 1);

  // Parse the array content
  // Since it's a large array, we'll use eval in a safe way (only for this trusted data file)
  const allRecords = eval(`(${arrayContent})`);

  console.log(`Found ${allRecords.length} records`);

  // Group records by level to ensure proper insertion order
  const level1 = allRecords.filter((r) => r.level === 1);
  const level2 = allRecords.filter((r) => r.level === 2);
  const level3 = allRecords.filter((r) => r.level === 3);

  console.log(`Level 1 (provinces): ${level1.length}`);
  console.log(`Level 2 (districts): ${level2.length}`);
  console.log(`Level 3 (wards/communes): ${level3.length}`);

  // Build SQL using temporary table for code mapping
  let sql = `-- Seed location data for Vietnam
-- Generated from: danh-sach-3321-xa-phuong_v2.ts
-- Total records: ${allRecords.length}
-- Generated at: ${new Date().toISOString()}

-- First, ensure Vietnam country exists
INSERT INTO "location_countries" (
  "code",
  "name",
  "is_active",
  "created_at",
  "updated_at"
)
VALUES (
  'VN',
  '{"vi": "Việt Nam", "en": "Vietnam"}'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT ("code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "updated_at" = NOW();

-- Create temporary table for code to ID mapping
CREATE TEMP TABLE IF NOT EXISTS location_code_map (
  code VARCHAR(50) PRIMARY KEY,
  unit_id UUID NOT NULL
);

-- Get Vietnam country ID and insert Level 1 records
DO $$
DECLARE
  vn_country_id UUID;
  current_id UUID;
BEGIN
  -- Get Vietnam country ID
  SELECT id INTO vn_country_id
  FROM "location_countries"
  WHERE code = 'VN'
  LIMIT 1;

  IF vn_country_id IS NULL THEN
    RAISE EXCEPTION 'Vietnam country not found after insert';
  END IF;

  RAISE NOTICE 'Inserting Level 1 records (% records)...', ${level1.length.toString()};
`;

  // Generate INSERT statements for level 1
  sql += `\n  -- Level 1: Provinces and Cities\n`;
  for (let i = 0; i < level1.length; i++) {
    const record = level1[i];
    const nameJson = escapeJsonb(record.name);
    const code = escapeSqlString(record.code);
    const type = escapeSqlString(record.type);
    const isActive = record.isActive ? "true" : "false";

    sql += `  INSERT INTO "location_administrative_units" (
    "country_id",
    "code",
    "name",
    "type",
    "level",
    "parent_id",
    "is_active",
    "created_at",
    "updated_at"
  )
  SELECT
    vn_country_id,
    ${code},
    ${nameJson},
    ${type},
    1,
    NULL,
    ${isActive},
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM "location_administrative_units"
    WHERE "code" = ${code} AND "country_id" = vn_country_id
  )
  RETURNING id INTO current_id;

  -- Store code to ID mapping
  IF current_id IS NOT NULL THEN
    INSERT INTO location_code_map (code, unit_id)
    VALUES (${code}, current_id)
    ON CONFLICT (code) DO UPDATE SET unit_id = current_id;
  ELSE
    -- If record already exists, get its ID
    SELECT id INTO current_id
    FROM "location_administrative_units"
    WHERE "code" = ${code} AND "country_id" = vn_country_id
    LIMIT 1;
    
    IF current_id IS NOT NULL THEN
      INSERT INTO location_code_map (code, unit_id)
      VALUES (${code}, current_id)
      ON CONFLICT (code) DO UPDATE SET unit_id = current_id;
    END IF;
  END IF;
`;

    if ((i + 1) % 10 === 0) {
      sql += `\n  -- Progress: ${i + 1}/${level1.length} level 1 records\n`;
    }
  }

  // Generate INSERT statements for level 2
  sql += `\n  -- Level 2: Districts\n`;
  sql += `  RAISE NOTICE 'Inserting Level 2 records (% records)...', ${level2.length.toString()};\n`;
  for (let i = 0; i < level2.length; i++) {
    const record = level2[i];
    const nameJson = escapeJsonb(record.name);
    const code = escapeSqlString(record.code);
    const type = escapeSqlString(record.type);
    const isActive = record.isActive ? "true" : "false";
    const parentCode = record.parentCode
      ? escapeSqlString(record.parentCode)
      : "NULL";

    sql += `  INSERT INTO "location_administrative_units" (
    "country_id",
    "code",
    "name",
    "type",
    "level",
    "parent_id",
    "is_active",
    "created_at",
    "updated_at"
  )
  SELECT
    vn_country_id,
    ${code},
    ${nameJson},
    ${type},
    2,
    (SELECT unit_id FROM location_code_map WHERE code = ${parentCode}),
    ${isActive},
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM "location_administrative_units"
    WHERE "code" = ${code} AND "country_id" = vn_country_id
  )
  RETURNING id INTO current_id;

  -- Store code to ID mapping
  IF current_id IS NOT NULL THEN
    INSERT INTO location_code_map (code, unit_id)
    VALUES (${code}, current_id)
    ON CONFLICT (code) DO UPDATE SET unit_id = current_id;
  ELSE
    SELECT id INTO current_id
    FROM "location_administrative_units"
    WHERE "code" = ${code} AND "country_id" = vn_country_id
    LIMIT 1;
    
    IF current_id IS NOT NULL THEN
      INSERT INTO location_code_map (code, unit_id)
      VALUES (${code}, current_id)
      ON CONFLICT (code) DO UPDATE SET unit_id = current_id;
    END IF;
  END IF;
`;

    if ((i + 1) % 50 === 0) {
      sql += `\n  -- Progress: ${i + 1}/${level2.length} level 2 records\n`;
    }
  }

  // Generate INSERT statements for level 3
  sql += `\n  -- Level 3: Wards and Communes\n`;
  sql += `  RAISE NOTICE 'Inserting Level 3 records (% records)...', ${level3.length.toString()};\n`;
  for (let i = 0; i < level3.length; i++) {
    const record = level3[i];
    const nameJson = escapeJsonb(record.name);
    const code = escapeSqlString(record.code);
    const type = escapeSqlString(record.type);
    const isActive = record.isActive ? "true" : "false";
    const parentCode = record.parentCode
      ? escapeSqlString(record.parentCode)
      : "NULL";

    sql += `  INSERT INTO "location_administrative_units" (
    "country_id",
    "code",
    "name",
    "type",
    "level",
    "parent_id",
    "is_active",
    "created_at",
    "updated_at"
  )
  SELECT
    vn_country_id,
    ${code},
    ${nameJson},
    ${type},
    3,
    (SELECT unit_id FROM location_code_map WHERE code = ${parentCode}),
    ${isActive},
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM "location_administrative_units"
    WHERE "code" = ${code} AND "country_id" = vn_country_id
  );
`;

    if ((i + 1) % 100 === 0) {
      sql += `\n  -- Progress: ${i + 1}/${level3.length} level 3 records\n`;
    }
  }

  sql += `
  RAISE NOTICE 'Location seed data insertion completed';
END $$;

-- Clean up temporary table
DROP TABLE IF EXISTS location_code_map;
`;

  console.log(`Writing SQL to ${outputFile}...`);
  fs.writeFileSync(outputFile, sql, "utf8");
  console.log(`✓ Generated SQL seed file: ${outputFile}`);
  console.log(`  Total records: ${allRecords.length}`);
  console.log(`  Level 1: ${level1.length}`);
  console.log(`  Level 2: ${level2.length}`);
  console.log(`  Level 3: ${level3.length}`);
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
