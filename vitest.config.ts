import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: [
            "src/services/scheduler.test.ts",
            "src/services/scheduleService.test.ts",
            "src/services/dataEngineRunner.test.ts",
            "src/services/dataEngineRunner.integration.test.ts",
        ],

        exclude: [
            "node_modules/**",
            "dist/**",
        ],
    },
});