import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

const INVENTORY_CSV = path.resolve(__dirname, '../inventory.csv');
const ERROR_LOG = path.resolve(__dirname, '../seed-errors.log');
const SNIPEIT_API_URL = process.env.SNIPEIT_API_URL || '';
const SNIPEIT_API_KEY = process.env.SNIPEIT_API_KEY || '';

if (!SNIPEIT_API_URL || !SNIPEIT_API_KEY) {
  console.error('SNIPEIT_API_URL and SNIPEIT_API_KEY must be set in the environment variables.');
  process.exit(1);
}

async function seedInventory() {
  const errors: string[] = [];

  fs.createReadStream(INVENTORY_CSV)
    .pipe(csv())
    .on('data', async (row) => {
      try {
        const response = await axios.post(
          `${SNIPEIT_API_URL}/hardware`,
          {
            name: row.name,
            asset_tag: row.asset_tag,
            serial: row.serial,
            category_id: row.category_id,
            manufacturer_id: row.manufacturer_id,
            model_id: row.model_id,
          },
          {
            headers: {
              Authorization: `Bearer ${SNIPEIT_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log(`Successfully imported asset: ${response.data.name}`);
      } catch (error) {
        let errorMessage = `Failed to import asset: ${row.name}.`;

        if (error instanceof Error) {
          errorMessage += ` Error: ${error.message}`;
        } else {
          errorMessage += ` Unknown error occurred.`;
        }

        console.error(errorMessage);
        errors.push(errorMessage);
      }
    })
    .on('end', () => {
      if (errors.length > 0) {
        fs.writeFileSync(ERROR_LOG, errors.join('\n'), 'utf-8');
        console.log(`Import completed with errors. See ${ERROR_LOG} for details.`);
      } else {
        console.log('Import completed successfully with no errors.');
      }
    });
}

seedInventory();