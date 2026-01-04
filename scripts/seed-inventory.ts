import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import * as csvParse from 'csv-parse/sync';

const prisma = new PrismaClient();

interface CsvRow {
  'Asset Name': string;
  'Model': string;
  'Manufacturer': string;
  'Category': string;
  'Status': string;
  'Notes': string;
}

async function seedInventory() {
  try {
    // Read and parse the CSV file
    const csvFilePath = path.resolve(__dirname, '../public/temp-data.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');

    const records = csvParse.parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as CsvRow[];

    console.log(`📋 Found ${records.length} equipment items to import`);

    let createdCount = 0;
    let skippedCount = 0;

    // Process each record
    for (let index = 0; index < records.length; index++) {
      const record = records[index];

      // Generate a unique asset ID (using index as a simple approach)
      // In production, this would likely come from Snipe-IT
      const assetId = index + 2; // Start from 2 (1 is reserved for test asset)

      // Create a unique asset tag from the category and ID
      const assetTag = `${record['Category'].toUpperCase().replace(/\s+/g, '-')}-${assetId}`;

      try {
        const existingAsset = await prisma.asset.findUnique({
          where: { assetTag },
        });

        if (existingAsset) {
          console.log(`⊘ Skipping ${record['Asset Name']} (${assetTag}) - already exists`);
          skippedCount++;
          continue;
        }

        await prisma.asset.create({
          data: {
            id: assetId,
            assetTag: assetTag,
            modelName: record['Asset Name'],
            category: record['Category'],
          },
        });

        if ((createdCount + 1) % 10 === 0) {
          console.log(`✓ Created ${createdCount + 1} assets...`);
        }

        createdCount++;
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
          skippedCount++;
        } else {
          console.error(`✗ Error creating asset ${record['Asset Name']}:`, error);
        }
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${createdCount} assets`);
    console.log(`   Skipped: ${skippedCount} assets (already exist)`);
    console.log(`   Total:   ${records.length} items in CSV`);

    // Show category summary
    const categories = [...new Set(records.map(r => r['Category']))];
    console.log(`\n📦 Categories imported:`);
    categories.forEach(cat => {
      const count = records.filter(r => r['Category'] === cat).length;
      console.log(`   - ${cat}: ${count} items`);
    });

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedInventory().catch(err => {
  console.error(err);
  process.exit(1);
});