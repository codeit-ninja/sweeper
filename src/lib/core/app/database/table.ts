import { fromPromise, ok, ResultAsync } from 'neverthrow';
import { app } from '../app.svelte';
import type { QueryResult } from '@tauri-apps/plugin-sql';

export type DefaultFields = {
    id: number;
    createdAt: string;
    updatedAt: string;
};

export type Model<D extends Record<string, any> = Record<string, any>> = D & DefaultFields;

export const DatabaseErrors = {
    CREATE: (tableName: string, details?: string) => ({
        type: 'DATABASE_CREATE_ERROR' as const,
        message: `Error creating database table '${tableName}'`,
        details,
        tableName,
    }),
    SELECT: (tableName: string, details?: string) => ({
        type: 'DATABASE_SELECT_ERROR' as const,
        message: `Error selecting from database table '${tableName}'`,
        details,
        tableName,
    }),
    INSERT: (tableName: string, details?: string) => ({
        type: 'DATABASE_INSERT_ERROR' as const,
        message: `Error inserting into database table '${tableName}'`,
        details,
        tableName,
    }),
    UPDATE: (tableName: string, details?: string) => ({
        type: 'DATABASE_UPDATE_ERROR' as const,
        message: `Error updating database table '${tableName}'`,
        details,
        tableName,
    }),
    DELETE: (tableName: string, details?: string) => ({
        type: 'DATABASE_DELETE_ERROR' as const,
        message: `Error deleting from database table '${tableName}'`,
        details,
        tableName,
    }),
    DROP: (tableName: string, details?: string) => ({
        type: 'DATABASE_DROP_ERROR' as const,
        message: `Error dropping database table '${tableName}'`,
        details,
        tableName,
    }),
    VALIDATION: (tableName: string, field: string, details?: string) => ({
        type: 'DATABASE_VALIDATION_ERROR' as const,
        message: `Validation error for field '${field}' in table '${tableName}'`,
        details,
        tableName,
        field,
    }),
} as const;

export type DatabaseError = ReturnType<(typeof DatabaseErrors)[keyof typeof DatabaseErrors]>;
export type SQLFieldType = 'INTEGER' | 'TEXT' | 'REAL' | 'BLOB' | 'DATETIME' | 'BOOLEAN' | string; // Allow custom field definitions

export abstract class Table<M extends Record<string, any> = Record<string, any>> {
    abstract readonly name: string;
    abstract readonly fields: Record<keyof M, SQLFieldType>;

    /**
     * Default fields automatically added to every table
     */
    readonly defaultFields = {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        createdAt: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
        updatedAt: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    } as const;

    /**
     * Validates table name to prevent SQL injection
     */
    private validateTableName(): void {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(this.name)) {
            throw new Error(`Invalid table name: ${this.name}`);
        }
    }

    /**
     * Validates field names to prevent SQL injection
     */
    private validateFieldNames(fields: string[]): void {
        for (const field of fields) {
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
                throw new Error(`Invalid field name: ${field}`);
            }
        }
    }

    /**
     * Validates that required fields are present in data
     */
    private validateRequiredFields(data: Partial<M>): ResultAsync<void, DatabaseError> {
        const requiredFields = Object.keys(this.fields).filter(
            (key) => !this.fields[key as keyof M].includes('DEFAULT') && !this.fields[key as keyof M].includes('NULL'),
        );

        for (const field of requiredFields) {
            if (!(field in data) || data[field as keyof M] == null) {
                return ResultAsync.fromSafePromise(
                    Promise.reject(
                        DatabaseErrors.VALIDATION(this.name, field, `Required field '${field}' is missing or null`),
                    ),
                );
            }
        }

        return ResultAsync.fromSafePromise(Promise.resolve());
    }

    /**
     * Creates the table in the database
     */
    create(): ResultAsync<this, DatabaseError> {
        try {
            this.validateTableName();

            const allFields = {
                ...this.defaultFields,
                ...this.fields,
            };

            const fieldDefinitions = Object.entries(allFields)
                .map(([key, value]) => `${key} ${value}`)
                .join(', ');

            return fromPromise(
                app.database
                    .getDatabase()
                    .execute(
                        `CREATE TABLE IF NOT EXISTS ${this.name} (
                            ${fieldDefinitions}
                        )`,
                    )
                    .then(() => this),
                (error) => DatabaseErrors.CREATE(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.CREATE(this.name, String(error))));
        }
    }

    get(where: Partial<M & DefaultFields> = {}): ResultAsync<M & DefaultFields, DatabaseError> {
        try {
            this.validateTableName();

            if (Object.keys(where).length === 0) {
                return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, 'No WHERE clause')));
            }

            const whereKeys = Object.keys(where);
            this.validateFieldNames(whereKeys);

            const whereClause = whereKeys
                .map((key) => (where[key] === null ? `${key} IS NULL` : `${key} = ?`))
                .join(' AND ');
            const values = whereKeys.filter((key) => where[key] !== null).map((key) => where[key]);

            return fromPromise(
                app.database.getDatabase().select(`SELECT * FROM ${this.name} WHERE ${whereClause}`, values),
                (error) => DatabaseErrors.SELECT(this.name, String(error)),
            ).andThen((rows) => {
                const resultRows = rows as (M & DefaultFields)[];

                if (resultRows.length === 0) {
                    return ResultAsync.fromSafePromise(
                        Promise.reject(DatabaseErrors.SELECT(this.name, 'No records found')),
                    );
                }

                return ok(resultRows[0] as M & DefaultFields);
            });
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, String(error))));
        }
    }

    getOne(id: number): ResultAsync<M & DefaultFields, DatabaseError> {
        try {
            this.validateTableName();

            return fromPromise(
                app.database.getDatabase().select(`SELECT * FROM ${this.name} WHERE id = ?`, [id]),
                (error) => DatabaseErrors.SELECT(this.name, String(error)),
            ).andThen((rows) => {
                const resultRows = rows as (M & DefaultFields)[];

                if (resultRows.length === 0) {
                    return ResultAsync.fromSafePromise(
                        Promise.reject(DatabaseErrors.SELECT(this.name, `No record found with id ${id}`)),
                    );
                }

                return ok(resultRows[0]);
            });
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, String(error))));
        }
    }

    getMany(where: Partial<M & DefaultFields> = {}): ResultAsync<(M & DefaultFields)[], DatabaseError> {
        try {
            this.validateTableName();

            if (Object.keys(where).length === 0) {
                return this.getAll();
            }

            const whereKeys = Object.keys(where);
            this.validateFieldNames(whereKeys);

            const whereClause = whereKeys
                .map((key) => (where[key] === null ? `${key} IS NULL` : `${key} = ?`))
                .join(' AND ');
            const values = whereKeys.filter((key) => where[key] !== null).map((key) => where[key]);

            return fromPromise(
                app.database.getDatabase().select(`SELECT * FROM ${this.name} WHERE ${whereClause}`, values),
                (error) => DatabaseErrors.SELECT(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, String(error))));
        }
    }

    deleteMany(where: Partial<M & DefaultFields> = {}): ResultAsync<QueryResult, DatabaseError> {
        try {
            this.validateTableName();

            if (Object.keys(where).length === 0) {
                return ResultAsync.fromSafePromise(
                    Promise.reject(DatabaseErrors.DELETE(this.name, 'No WHERE clause provided')),
                );
            }

            const whereKeys = Object.keys(where);
            this.validateFieldNames(whereKeys);

            const whereClause = whereKeys
                .map((key) => (where[key] === null ? `${key} IS NULL` : `${key} = ?`))
                .join(' AND ');
            const values = whereKeys.filter((key) => where[key] !== null).map((key) => where[key]);

            return fromPromise(
                app.database.getDatabase().execute(`DELETE FROM ${this.name} WHERE ${whereClause}`, values),
                (error) => DatabaseErrors.DELETE(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.DELETE(this.name, String(error))));
        }
    }

    /**
     * Selects all records from the table
     */
    getAll(): ResultAsync<(M & DefaultFields)[], DatabaseError> {
        try {
            this.validateTableName();

            return fromPromise(app.database.getDatabase().select(`SELECT * FROM ${this.name}`), (error) =>
                DatabaseErrors.SELECT(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, String(error))));
        }
    }

    /**
     * Inserts a new record into the table
     */
    insert(data: M): ResultAsync<QueryResult, DatabaseError> {
        try {
            this.validateTableName();

            return this.validateRequiredFields(data).andThen(() => {
                const excludeKeys = Object.keys(this.defaultFields);
                const dataKeys = Object.keys(data).filter((key) => !excludeKeys.includes(key) && key in this.fields);

                this.validateFieldNames(dataKeys);

                if (dataKeys.length === 0) {
                    return ResultAsync.fromSafePromise(
                        Promise.reject(DatabaseErrors.INSERT(this.name, 'No valid fields to insert')),
                    );
                }

                const values = dataKeys.map((key) => data[key as keyof M]);
                const placeholders = dataKeys.map(() => '?').join(', ');

                return fromPromise(
                    app.database
                        .getDatabase()
                        .execute(`INSERT INTO ${this.name} (${dataKeys.join(', ')}) VALUES (${placeholders})`, values),
                    (error) => DatabaseErrors.INSERT(this.name, String(error)),
                );
            });
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.INSERT(this.name, String(error))));
        }
    }

    /**
     * Updates records in the table
     */
    update(
        fields: Partial<M & DefaultFields>,
        where: Partial<M & DefaultFields>,
    ): ResultAsync<QueryResult, DatabaseError> {
        try {
            this.validateTableName();

            const updateKeys = Object.keys(fields);
            const whereKeys = Object.keys(where);

            if (updateKeys.length === 0) {
                return ResultAsync.fromSafePromise(
                    Promise.reject(DatabaseErrors.UPDATE(this.name, 'No fields to update')),
                );
            }

            if (whereKeys.length === 0) {
                return ResultAsync.fromSafePromise(
                    Promise.reject(DatabaseErrors.UPDATE(this.name, 'WHERE clause is required for safety')),
                );
            }

            this.validateFieldNames([...updateKeys, ...whereKeys]);

            // Automatically update the updatedAt field
            const fieldsWithTimestamp = {
                ...fields,
                updatedAt: new Date().toISOString(),
            };

            // Build SET clause, allowing nulls
            const setClause = Object.keys(fieldsWithTimestamp)
                .map((key) => (fieldsWithTimestamp[key] === null ? `${key} = NULL` : `${key} = ?`))
                .join(', ');

            // Build values for non-null fields
            const setValues = Object.keys(fieldsWithTimestamp)
                .filter((key) => fieldsWithTimestamp[key] !== null)
                .map((key) => fieldsWithTimestamp[key]);

            const whereClause = whereKeys
                .map((key) => (where[key] === null ? `${key} IS NULL` : `${key} = ?`))
                .join(' AND ');

            const whereValues = whereKeys.filter((key) => where[key] !== null).map((key) => where[key]);

            const values = [...setValues, ...whereValues];

            return fromPromise(
                app.database.getDatabase().execute(`UPDATE ${this.name} SET ${setClause} WHERE ${whereClause}`, values),
                (error) => DatabaseErrors.UPDATE(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.UPDATE(this.name, String(error))));
        }
    }

    /**
     * Deletes records from the table
     */
    delete(where: Partial<M & DefaultFields>): ResultAsync<QueryResult, DatabaseError> {
        try {
            this.validateTableName();

            const whereKeys = Object.keys(where);

            if (whereKeys.length === 0) {
                return ResultAsync.fromSafePromise(
                    Promise.reject(DatabaseErrors.DELETE(this.name, 'WHERE clause is required for safety')),
                );
            }

            this.validateFieldNames(whereKeys);

            const whereClause = whereKeys
                .map((key) => (where[key] === null ? `${key} IS NULL` : `${key} = ?`))
                .join(' AND ');

            const values = whereKeys.filter((key) => where[key] !== null).map((key) => where[key]);

            return fromPromise(
                app.database.getDatabase().execute(`DELETE FROM ${this.name} WHERE ${whereClause}`, values),
                (error) => DatabaseErrors.DELETE(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.DELETE(this.name, String(error))));
        }
    }

    /**
     * Drops the table from the database
     */
    drop(): ResultAsync<QueryResult, DatabaseError> {
        try {
            this.validateTableName();

            return fromPromise(app.database.getDatabase().execute(`DROP TABLE IF EXISTS ${this.name}`), (error) =>
                DatabaseErrors.DROP(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.DROP(this.name, String(error))));
        }
    }

    /**
     * Counts the number of records in the table
     */
    count(where?: Partial<M & DefaultFields>): ResultAsync<number, DatabaseError> {
        try {
            this.validateTableName();

            let query = `SELECT COUNT(*) as count FROM ${this.name}`;
            let values: any[] = [];

            if (where && Object.keys(where).length > 0) {
                const whereKeys = Object.keys(where);
                this.validateFieldNames(whereKeys);

                const whereClause = whereKeys
                    .map((key) => (where[key] === null ? `${key} IS NULL` : `${key} = ?`))
                    .join(' AND ');

                query += ` WHERE ${whereClause}`;
                values = whereKeys.filter((key) => where[key] !== null).map((key) => where[key]);
            }

            return fromPromise(
                app.database
                    .getDatabase()
                    .select(query, values)
                    .then((result) => {
                        const rows = result as Array<{ count: number }>;
                        return rows[0]?.count || 0;
                    }),
                (error) => DatabaseErrors.SELECT(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, String(error))));
        }
    }

    /**
     * Checks if the table exists in the database
     */
    exists(): ResultAsync<boolean, DatabaseError> {
        try {
            this.validateTableName();

            return fromPromise(
                app.database
                    .getDatabase()
                    .select("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [this.name])
                    .then((result) => {
                        const rows = result as Array<{ name: string }>;
                        return rows.length > 0;
                    }),
                (error) => DatabaseErrors.SELECT(this.name, String(error)),
            );
        } catch (error) {
            return ResultAsync.fromSafePromise(Promise.reject(DatabaseErrors.SELECT(this.name, String(error))));
        }
    }
}
