import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

import { DATABASE_URL } from '../config/constants';

async function main() {
    // create the connection
    const connnection = postgres(DATABASE_URL, { max: 1 });
    const db = drizzle(connnection);

    await migrate(db, {
        migrationsFolder: './src/database/migrations'
    });
    await connnection.end();
}

(async () => {
    main();
})();
