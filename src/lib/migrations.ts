export interface DatabaseMigration {
  version: number;
  id: string;
  title: string;
  file: string;
  reversible: boolean;
}

export const databaseMigrations: DatabaseMigration[] = [
  { version: 1, id: '001_initial_graph', title: 'Initial canonical graph tables', file: 'db/migrations/001_initial_graph.sql', reversible: false },
  { version: 2, id: '002_review_and_history', title: 'Review, change-set and release history', file: 'db/migrations/002_review_and_history.sql', reversible: true },
  { version: 3, id: '003_ingestion_and_events', title: 'Ingestion jobs and graph events', file: 'db/migrations/003_ingestion_and_events.sql', reversible: true }
];

export function pendingMigrations(currentVersion: number) {
  return databaseMigrations.filter((migration) => migration.version > currentVersion).sort((a, b) => a.version - b.version);
}

export function assertMigrationSequence(migrations = databaseMigrations) {
  const versions = migrations.map((migration) => migration.version).sort((a, b) => a - b);
  return versions.every((version, index) => version === index + 1);
}
