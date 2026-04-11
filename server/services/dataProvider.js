import { getDb } from "../utils/db.js";
import * as localDb from "../utils/localDb.js";

// DataProvider fetches from BOTH MariaDB and local db.json
function normalizeRecord(record) {
    if (!record || typeof record !== 'object') return record;
    const normalized = { ...record };
    if (normalized.id !== undefined && normalized._id === undefined) {
        normalized._id = String(normalized.id);
    }
    if (normalized._id !== undefined && normalized.id === undefined) {
        normalized.id = normalized._id;
    }
    return normalized;
}

export const provider = {
    async find(collection, filter = {}) {
        const results = [];
        
        const normalizedFilter = {};
        for (const key of Object.keys(filter)) {
            normalizedFilter[key === '_id' ? 'id' : key] = filter[key];
        }

        // Try MariaDB first
        const db = getDb();
        if (db) {
            try {
                const keys = Object.keys(normalizedFilter);
                const values = Object.values(normalizedFilter);

                const where = keys.length
                    ? "WHERE " + keys.map(k => `${k} = ? `).join(" AND ")
                    : "";
                
                const [rows] = await db.query(
                    `SELECT * FROM ${collection} ${where}`,
                    values
                );
                results.push(...rows.map(normalizeRecord));
            } catch (e) {
                console.warn(`MariaDB find error for ${collection}:`, e.message);
            }
        }
        
        // Also fetch from local db.json
        try {
            const localResults = await localDb.find(collection, filter);
            // Merge results and remove duplicates (by _id or id)
            const existingIds = new Set(results.map(r => (r._id || r.id)?.toString()));
            for (const item of localResults) {
                const itemId = (item._id || item.id)?.toString();
                if (!existingIds.has(itemId)) {
                    results.push(normalizeRecord(item));
                }
            }
        } catch (e) {
            console.warn(`Local db find error for ${collection}:`, e.message);
        }
        
        return results;
    },

    async findOne(collection, filter = {}) {
        const normalizedFilter = {};
        for (const key of Object.keys(filter)) {
            normalizedFilter[key === '_id' ? 'id' : key] = filter[key];
        }

        // Try MariaDB first
        const db = getDb();
        if (db) {
            try {
                const keys = Object.keys(normalizedFilter);
                const values = Object.values(normalizedFilter);

                const where = keys.length
                    ? "WHERE " + keys.map(k => `${k} = ? `).join(" AND ")
                    : "";

                const [rows] = await db.query(
                    `SELECT * FROM ${collection} ${where} LIMIT 1`,
                    values
                );
                if (rows.length) return normalizeRecord(rows[0]);
            } catch (e) {
                console.warn(`MariaDB findOne error for ${collection}:`, e.message);
            }
        }
        
        // Fall back to local db.json
        try {
            const result = await localDb.findOne(collection, filter);
            return normalizeRecord(result);
        } catch (e) {
            console.warn(`Local db findOne error for ${collection}:`, e.message);
            return null;
        }
    },

    async insertOne(collection, doc) {
        let dbResult = null;
        let localResult = null;
        
        // Insert to MariaDB
        const db = getDb();
        if (db) {
            try {
                const keys = Object.keys(doc);
                const values = Object.values(doc);

                const placeholders = keys.map(() => "?").join(", ");

                const [result] = await db.query(
                    `INSERT INTO ${collection} (${keys.join(", ")}) VALUES (${placeholders})`,
                    values
                );

                dbResult = { insertedId: result.insertId, _id: String(result.insertId) };
            } catch (e) {
                console.warn(`MariaDB insertOne error for ${collection}:`, e.message);
            }
        }
        
        // Also insert to local db.json (as backup/fallback)
        try {
            localResult = await localDb.insertOne(collection, doc);
        } catch (e) {
            console.warn(`Local db insertOne error for ${collection}:`, e.message);
        }
        
        // Return MariaDB result if available, otherwise local result
        if (dbResult) return dbResult;

        if (localResult) {
            localResult = {
                ...localResult,
                _id: localResult.insertedId,
                id: localResult.insertedId,
            };
            return localResult;
        }

        return { insertedId: doc._id || doc.id, _id: doc._id || doc.id };
    },

    async updateOne(collection, filter = {}, updates = {}) {
        let dbResult = null;
        let localResult = null;
        
        // Normalize ID field for SQL collections
        const normalizeFilter = {};
        for (const key of Object.keys(filter)) {
            if (key === '_id') normalizeFilter['id'] = filter[key];
            else normalizeFilter[key] = filter[key];
        }

        // Update in MariaDB
        const db = getDb();
        if (db) {
            try {
                const updateKeys = Object.keys(updates);
                const updateValues = Object.values(updates);

                const filterKeys = Object.keys(normalizeFilter);
                const filterValues = Object.values(normalizeFilter);

                const setClause = updateKeys.map(k => `${k} = ?`).join(", ");
                const whereClause = filterKeys.map(k => `${k} = ?`).join(" AND ");

                const [result] = await db.query(
                    `UPDATE ${collection} SET ${setClause} WHERE ${whereClause}`,
                    [...updateValues, ...filterValues]
                );

                dbResult = {
                    matchedCount: result.affectedRows,
                    modifiedCount: result.changedRows
                };
            } catch (e) {
                console.warn(`MariaDB updateOne error for ${collection}:`, e.message);
            }
        }
        
        // Also update in local db.json
        try {
            localResult = await localDb.updateOne(collection, filter, updates);
        } catch (e) {
            console.warn(`Local db updateOne error for ${collection}:`, e.message);
        }
        
        // Return MariaDB result if available, otherwise local result
        return dbResult || localResult || { matchedCount: 0, modifiedCount: 0 };
    },

    async deleteOne(collection, filter = {}) {
        let dbResult = null;
        let localResult = null;
        
        // Normalize filter to SQL id
        const normalizedFilter = {};
        for (const key of Object.keys(filter)) {
            normalizedFilter[key === '_id' ? 'id' : key] = filter[key];
        }

        // Delete from MariaDB
        const db = getDb();
        if (db) {
            try {
                const keys = Object.keys(normalizedFilter);
                const values = Object.values(normalizedFilter);

                const where = keys.map(k => `${k} = ? `).join(" AND ");

                const [result] = await db.query(
                    `DELETE FROM ${collection} WHERE ${where} LIMIT 1`,
                    values
                );

                dbResult = { deletedCount: result.affectedRows };
            } catch (e) {
                console.warn(`MariaDB deleteOne error for ${collection}:`, e.message);
            }
        }
        
        // Also delete from local db.json
        try {
            localResult = await localDb.deleteOne(collection, filter);
        } catch (e) {
            console.warn(`Local db deleteOne error for ${collection}:`, e.message);
        }
        
        // Return MariaDB result if available, otherwise local result
        return dbResult || localResult || { deletedCount: 0 };
    }
};
