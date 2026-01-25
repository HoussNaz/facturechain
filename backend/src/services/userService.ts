import bcrypt from "bcryptjs";
import { pool } from "../db/pool.js";
import { mapUser } from "../db/mapper.js";
import type { PublicUser, User } from "../types/models.js";
import type { AppError } from "../types/errors.js";

const rounds = 10;

const publicUser = (user: User): PublicUser => ({
    id: user.id,
    email: user.email,
    companyName: user.companyName,
    siret: user.siret,
    address: user.address,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

export async function getUser(userId: string): Promise<PublicUser> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
        const err: AppError = new Error("Utilisateur introuvable");
        err.status = 404;
        throw err;
    }
    return publicUser(mapUser(result.rows[0]));
}

type UpdatePayload = {
    companyName?: string;
    siret?: string;
    address?: string;
    email?: string;
};

export async function updateUser(userId: string, payload: UpdatePayload): Promise<PublicUser> {
    const existing = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (existing.rows.length === 0) {
        const err: AppError = new Error("Utilisateur introuvable");
        err.status = 404;
        throw err;
    }

    // Check email uniqueness if changing email
    if (payload.email) {
        const emailCheck = await pool.query(
            "SELECT id FROM users WHERE lower(email) = lower($1) AND id != $2",
            [payload.email, userId]
        );
        if (emailCheck.rows.length > 0) {
            const err: AppError = new Error("Cet email est déjà utilisé");
            err.status = 400;
            throw err;
        }
    }

    const user = mapUser(existing.rows[0]);
    const now = new Date().toISOString();

    const result = await pool.query(
        `UPDATE users SET
       company_name = $1,
       siret = $2,
       address = $3,
       email = $4,
       updated_at = $5
     WHERE id = $6
     RETURNING *`,
        [
            payload.companyName ?? user.companyName,
            payload.siret ?? user.siret,
            payload.address ?? user.address,
            payload.email ?? user.email,
            now,
            userId
        ]
    );

    return publicUser(mapUser(result.rows[0]));
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    if (result.rows.length === 0) {
        const err: AppError = new Error("Utilisateur introuvable");
        err.status = 404;
        throw err;
    }

    const user = mapUser(result.rows[0]);
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash || "");
    if (!isValid) {
        const err: AppError = new Error("Mot de passe actuel incorrect");
        err.status = 400;
        throw err;
    }

    const passwordHash = await bcrypt.hash(newPassword, rounds);
    await pool.query(
        "UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3",
        [passwordHash, new Date().toISOString(), userId]
    );
}

export async function deleteUser(userId: string): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Delete user's certifications first
        await client.query(
            "DELETE FROM certifications WHERE invoice_id IN (SELECT id FROM invoices WHERE user_id = $1)",
            [userId]
        );

        // Delete user's invoices
        await client.query("DELETE FROM invoices WHERE user_id = $1", [userId]);

        // Delete user
        const result = await client.query("DELETE FROM users WHERE id = $1 RETURNING id", [userId]);

        if (result.rows.length === 0) {
            const err: AppError = new Error("Utilisateur introuvable");
            err.status = 404;
            throw err;
        }

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}
