import { env } from './config/env';
import { ensureDatabaseCompatibility } from './db/bootstrap';
import { pool } from './db/pool';
import { app } from './app';

async function bootstrap(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    await ensureDatabaseCompatibility();

    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend:', error);
    process.exit(1);
  }
}

void bootstrap();
