"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
const bootstrap_1 = require("./db/bootstrap");
const pool_1 = require("./db/pool");
const app_1 = require("./app");
async function bootstrap() {
    try {
        await pool_1.pool.query('SELECT 1');
        await (0, bootstrap_1.ensureDatabaseCompatibility)();
        app_1.app.listen(env_1.env.port, () => {
            console.log(`API running on http://localhost:${env_1.env.port}`);
        });
    }
    catch (error) {
        console.error('Failed to start backend:', error);
        process.exit(1);
    }
}
void bootstrap();
//# sourceMappingURL=index.js.map